import { Component, OnInit } from '@angular/core';
import { ProductoService } from 'src/app/servicesComponents/producto.service';
import { CategoriasService } from 'src/app/servicesComponents/categorias.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Store } from '@ngrx/store';
import { CART } from 'src/app/interfaces/sotarage';
import { MatDialog, MatSnackBar } from '@angular/material';
import { BuscadorAction } from 'src/app/redux/app.actions';
import * as _ from 'lodash';
import { ToolsService } from 'src/app/services/tools.service';
import { FormatosService } from 'src/app/services/formatos.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-tienda',
  templateUrl: './tienda.component.html',
  styleUrls: ['./tienda.component.scss']
})
export class TiendaComponent implements OnInit {

  products = [];

  showNotification = false;
  lastPurchase = { user: 'Julio de Valledupar', name: 'Rolex Submariner RX31', price: '$89.900,00', image: 'assets/rolex_submariner_rx31.jpg' };

  
  tiendaInfo:any = {};
  seartxt:string = '';

  loader:boolean = true;
  notscrolly:boolean=true;
  notEmptyPost:boolean = true;
  busqueda:any = {};
  query:any = {
    where:{
      pro_activo: 0,
      //pro_categoria: { '!=' : [2,3,12] }
    },
    page: 0,
    limit: 30
  };

  listProductos:any = [];
  dataSeleccionda:string;
  listCategorias:any = [];
  idCategory:string;

  constructor(
    private _productos: ProductoService,
    private _categorias: CategoriasService,
    private spinner: NgxSpinnerService,
    private _store: Store<CART>,
    public dialog: MatDialog,
    private _tools: ToolsService,
    public _formato: FormatosService,
    private _snackBar: MatSnackBar,
    private activate: ActivatedRoute,
  ) {
    this._store.subscribe((store: any) => {
      store = store.name;
      if(!store) return false;
      this.tiendaInfo = store.configuracion || {};
      if( store.buscador ) if( Object.keys(store.buscador).length > 0 ) {  if( store.buscador.search ) { this.seartxt = store.buscador.search; this.buscar(); this.borrarBusqueda(); this.dataSeleccionda = store.buscador.search } }
    });
  }

  ngOnInit() {
    //this.getProductos();
    this.idCategory = this.activate.snapshot.paramMap.get('id');

    this.getCategorias();
    let interV = 0;
    setInterval(() => {
      //console.log("******78", this.showNotification, interV)
      interV++;
      this.showNotification = true;
      if( interV === 5 ) {
        this.showNotification = false;
        interV = 0;
      }
    }, 3000); // Simular la compra después de 3 segundos
  }

  getCategorias(){
    this._categorias.getProduct( { where:{ cat_activo: 0 }, limit: 100, empresa: this.tiendaInfo.id || 4 } ).subscribe((res:any)=>{
      this.listCategorias = res.data;
      //this.listCategorias.unshift( { cat_nombre: "Todos", id: 0 } );
    });
  }

  handleCategory(){
    this.query = { where:{ pro_activo: 0,  } ,limit: 30, page: 0 };
    this.listProductos = [];
    this.loader = true;
    this.getProductos();
  }
  
  buscar() {
    //console.log(this.seartxt);
    this.loader = true;
    this.seartxt = this.seartxt.trim();
    this.listProductos = [];
    this.notscrolly = true;
    this.notEmptyPost = true;
    this.query = { where:{ pro_activo: 0 } ,limit: 15, page: 0 };
    if (this.seartxt) {
      this.query.where.or = [
        {
          pro_nombre: {
            contains: this.seartxt|| ''
          }
        },
        {
          pro_descripcion: {
            contains: this.seartxt|| ''
          }
        },
        {
          pro_codigo: {
            contains: this.seartxt|| ''
          }
        }
      ];
    }
    this.getProductos();
  }

  buscarFiltro( opt:string ){
    this.query = { where:{ pro_activo: 0 } ,limit: 30, page: 0 };
    if(opt == 'ordenar'){
      if(this.busqueda.ordenar == 1){
        this.dataSeleccionda = "";
        delete this.query.sort
      }
      if(this.busqueda.ordenar == 2){
        this.dataSeleccionda = "Ordenar nombre";
        this.query.sort = 'pro_nombre DESC';
      }
      if(this.busqueda.ordenar == 3){
        this.dataSeleccionda = "Ordenar Precio";
        this.query.sort = 'pro_uni_venta DESC';
      }
      if(this.busqueda.ordenar == 3){
        this.dataSeleccionda = "Ordenar Fecha";
        this.query.sort = 'createdAt DESC';
      }
    }
    this.listProductos = [];
    this.loader = true;
    this.getProductos();
  }

  getProductos(){
    this.spinner.show();
    if( this.tiendaInfo.id ) this.query.where.empresa = this.tiendaInfo.id;
    else this.query.where.empresa = 4;
    this._productos.get(this.query).subscribe((res:any)=>{
      this.listProductos = _.unionBy(this.listProductos || [], res.data, 'id');
      //console.log("******",res)
      this.spinner.hide();
      this.loader = false;
      if (res.data.length === 0 ) {
        this.notEmptyPost =  false;
      }
      this.notscrolly = true;
    }, ( error )=> { console.error(error); this.spinner.hide(); this.loader = false;});
  }

  borrarBusqueda(){
    let accion = new BuscadorAction({}, 'drop');
    this._store.dispatch( accion );
  }

}
