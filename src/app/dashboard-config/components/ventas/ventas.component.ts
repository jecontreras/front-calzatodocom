import { Component, OnInit } from '@angular/core';
import { FormventasComponent } from '../../form/formventas/formventas.component';
import { MatDialog } from '@angular/material';
import { ToolsService } from 'src/app/services/tools.service';
import { VentasService } from 'src/app/servicesComponents/ventas.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';
import { STORAGES } from 'src/app/interfaces/sotarage';
import { Store } from '@ngrx/store';
import { FormpuntosComponent } from '../../form/formpuntos/formpuntos.component';
import * as moment from 'moment';

declare interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: any[][];
}

declare const swal: any;
declare const $: any;

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.scss']
})
export class VentasComponent implements OnInit {

  dataTable: DataTable;
  dataTable2: DataTable;
  pagina = 10;
  paginas = 0;
  loader = true;
  query:any = {
    where:{
      ven_sw_eliminado: 0,
      ven_estado: { '!=': 4 }
    },
    page: 0
  };
  query2:any = {
    where:{
      ven_sw_eliminado: 0,
      ven_estado: 0
    },
    sort: "createdAt ASC",
    page: 0
  };
  Header:any = [ 'Acciones','Nombre Cliente','Teléfono Cliente','Fecha Venta','Cantidad','Precio','Imagen Producto','Estado', 'Tallas' ];
  $:any;
  public datoBusqueda = '';

  notscrolly:boolean=true;
  notEmptyPost:boolean = true;
  dataUser:any = {};
  activando:boolean = false;
  dateHoy = moment().format("DD/MM/YYYY");
  sumCantidad:any = 0;
  ShopConfig:any = {};

  constructor(
    public dialog: MatDialog,
    private _tools: ToolsService,
    private _ventas: VentasService,
    private spinner: NgxSpinnerService,
    private _store: Store<STORAGES>,
  ) {
    this._store.subscribe((store: any) => {
      store = store.name;
      this.dataUser = store.user || {};
      this.activando = false;
      if(this.dataUser.usu_perfil.prf_descripcion != 'administrador') this.query.where.usu_clave_int = this.dataUser.id;
      if(this.dataUser.usu_perfil.prf_descripcion == 'administrador') this.activando = true;
      this.ShopConfig = store.configuracion || {};
    });
   }

  async ngOnInit() {
    this.dataTable = {
      headerRow: this.Header,
      footerRow: this.Header,
      dataRows: []
    };
    this.dataTable2 = {
      headerRow: this.Header,
      footerRow: this.Header,
      dataRows: []
    };
    this.cargarTodos();
    this.cargarTodos2();
    this.sumCantidad = await this.getVentasHoy();
  }

  getVentasHoy(){
    return new Promise( resolve =>{
      this._ventas.getCount( {
        "where": {
          "ven_sw_eliminado": 0,
          "ven_estado": {
              "!=": 4
          },
          "create": this.dateHoy
      }
      } ).subscribe( res => resolve( res.data ) )
    })
  }

  crear(obj:any){
    const dialogRef = this.dialog.open(FormventasComponent,{
      data: {datos: obj || {}}
    });

    dialogRef.afterClosed().subscribe( async ( result ) => {
      console.log(`Dialog result: ${result}`);
      if(result == 'creo') this.cargarTodos();
      if( obj.id ) {
        let filtro:any = await this.getDetallado( obj.id );
          if( !filtro ) return false;
          let idx = _.findIndex( this.dataTable.dataRows, [ 'id', obj.id ] );
          console.log("**",idx)
          if( idx >= 0 ) {
            console.log("**",this.dataTable['dataRows'][idx], filtro)
            this.dataTable['dataRows'][idx] = { ven_estado: filtro.ven_estado, ...filtro};
          }

          idx = _.findIndex( this.dataTable2.dataRows, [ 'id', obj.id ] );
          console.log("**",idx)
          if( idx >= 0 ) {
            console.log("**",this.dataTable2['dataRows'][idx], filtro)
            this.dataTable2['dataRows'][idx] = { ven_estado: filtro.ven_estado, ...filtro};
          }
      }
    });
  }

  async getDetallado( id:any ){
    return new Promise( resolve => {
      this._ventas.get( { where: { id: id } } ).subscribe(( res:any )=>{
        res = res.data[0];
        resolve( res || false )
      },()=> resolve( false ) );
    })
  }

  darPuntos(){
    const dialogRef = this.dialog.open(FormpuntosComponent,{
      data: { datos: {} }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  delete(obj:any, idx:any){
    let data:any = {
      id: obj.id,
      ven_sw_eliminado: 1
    };
    this._tools.confirm({title:"Eliminar", detalle:"Deseas Eliminar Dato", confir:"Si Eliminar"}).then((opt)=>{
      if(opt.value){
        if(obj.ven_estado == 1) { this._tools.presentToast("Error no puedes ya Eliminar la venta ya esta aprobada"); return false; }
        this._ventas.update(data).subscribe((res:any)=>{
          this.dataTable.dataRows.splice(idx, 1);
          this._tools.presentToast("Eliminado")
        },(error)=>{console.error(error); this._tools.presentToast("Error de servidor") })
      }
    });
  }

  onScroll(){
    if (this.notscrolly && this.notEmptyPost) {
       this.notscrolly = false;
       this.query.page++;
       this.cargarTodos();
     }
  }
  onScroll2(){
    this.query2.page++;
    this.cargarTodos2();
  }

  cargarTodos() {
    this.spinner.show();
    this.query.where.empresa = this.ShopConfig.id;
    this._ventas.get(this.query)
    .subscribe(
      (response: any) => {
        this.dataTable.headerRow = this.dataTable.headerRow;
        this.dataTable.footerRow = this.dataTable.footerRow;
        this.dataTable.dataRows.push(... response.data)
        this.dataTable.dataRows = _.unionBy(this.dataTable.dataRows || [], this.dataTable.dataRows, 'id');
        this.loader = false;
          this.spinner.hide();

          if (response.data.length === 0 ) {
            this.notEmptyPost =  false;
          }
          this.notscrolly = true;
      },
      error => {
        console.log('Error', error);
      });
  }

  cargarTodos2() {
    this.spinner.show();
    this._ventas.get( this.query2 )
    .subscribe(
      (response: any) => {
        this.dataTable2.headerRow = this.dataTable2.headerRow;
        this.dataTable2.footerRow = this.dataTable2.footerRow;
        this.dataTable2.dataRows.push(... response.data)
        this.dataTable2.dataRows = _.unionBy(this.dataTable2.dataRows || [], this.dataTable2.dataRows, 'id');
      },
      error => {
        console.log('Error', error);
      });
  }

  async buscar() {
    this.loader = false;
    this.notscrolly = true
    this.notEmptyPost = true;
    this.dataTable.dataRows = [];
    //console.log(this.datoBusqueda);
    this.datoBusqueda = this.datoBusqueda.trim();
    if (this.datoBusqueda === '') {
      this.query = {
        where:{
          ven_sw_eliminado: 0,
          ven_estado: { '!=': 4 }
        },
        page: 0
      }
      if(this.dataUser.usu_perfil.prf_descripcion != 'administrador') this.query.where.usu_clave_int = this.dataUser.id;
      this.cargarTodos();
    } else {
      this.query.where.or = [
        {
          ven_nombre_cliente: {
            contains: this.datoBusqueda|| ''
          }
        },
        {
          ven_usu_creacion: {
            contains: this.datoBusqueda|| ''
          }
        },
        {
          ven_telefono_cliente: {
            contains: this.datoBusqueda|| ''
          }
        },
        {
          ven_direccion_cliente: {
            contains: this.datoBusqueda|| ''
          }
        },
        {
          ven_fecha_venta: {
            contains: this.datoBusqueda|| ''
          }
        },
        {
          ven_tallas: {
            contains: this.datoBusqueda|| ''
          }
        },
      ];
      this.cargarTodos();
      this.sumCantidad = await this.getVentasHoy();
    }
  }

}
