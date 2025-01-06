import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormventasComponent } from 'src/app/dashboard-config/form/formventas/formventas.component';
import { VentasService } from 'src/app/servicesComponents/ventas.service';
import * as _ from 'lodash';
import { STORAGES } from 'src/app/interfaces/sotarage';
import { Store } from '@ngrx/store';
import { ToolsService } from 'src/app/services/tools.service';
import { VentasProductosService } from 'src/app/servicesComponents/ventas-productos.service';
import { ActivatedRoute } from '@angular/router';
  
declare interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: any[][];
}

@Component({
  selector: 'app-detalle-pedido',
  templateUrl: './detalle-pedido.component.html',
  styleUrls: ['./detalle-pedido.component.scss']
})
export class DetallePedidoComponent implements OnInit {
  
  dataTable: DataTable;
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
  Header:any = [ 'Acciones','Tipo Venta','Nombre Cliente','Teléfono Cliente','Fecha Venta','Cantidad','Precio','Estado', 'Motivo Rechazo' ];
  $:any;

  notscrolly:boolean=true;
  notEmptyPost:boolean = true;
  dataUser:any = {};
  urlHref: string="";
  ShopConfig:any = {};
  dataUltV:any = { };
  id:any;

  constructor(
    private _ventas: VentasService,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private _store: Store<STORAGES>,
    public _tools: ToolsService,
    private activate: ActivatedRoute,
    private _ventasPro: VentasProductosService
  ) { 
    this._store.subscribe((store: any) => {
      store = store.name;
      if( !store ) return false;
      this.dataUser = store.user || {};
      this.ShopConfig = store.configuracion || {};
    });
  }

  async ngOnInit() {
    this.urlHref = window.location.origin + "/login";
    if((this.activate.snapshot.paramMap.get('id'))){
      this.id = this.activate.snapshot.paramMap.get('id');
    }
    this.dataTable = {
      headerRow: this.Header,
      footerRow: this.Header,
      dataRows: []
    };
    if( this.dataUser.id ) {
      await this.cargarTodos();
      try {
        setTimeout(()=> this.handleWhatsapp( this.dataUltV ), 5000 );
      } catch (error) { 
        console.log("**74", error )
      }
    }
  }

  crear(obj:any){
    const dialogRef = this.dialog.open(FormventasComponent,{
      data: {datos: obj || {}}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  onScroll(){
    if (this.notscrolly && this.notEmptyPost) {
       this.notscrolly = false;
       this.query.page++;
       this.cargarTodos();
     }
  }

  cargarTodos() {
    return new Promise( resolve =>{
      this.spinner.show();
      if( !this.id ) this.query.where.usu_clave_int = this.dataUser.id;
      if( this.id ) this.query.where.id = this.id;
      this._ventas.get( this.query )
      .subscribe(
        (response: any) => {
          this.dataTable.headerRow = this.dataTable.headerRow;
          this.dataTable.footerRow = this.dataTable.footerRow;
          this.dataTable.dataRows.push(... response.data)
          this.dataTable.dataRows = _.unionBy(this.dataTable.dataRows || [], this.dataTable.dataRows, 'id');
          if( this.dataTable.dataRows[0] ) this.handleOpenAlertP( this.dataTable.dataRows[0] );
          this.dataUltV = this.dataTable.dataRows[0];
          this.getVentarArt();
          this.loader = false;
            this.spinner.hide();
            
            if (response.data.length === 0 ) {
              this.notEmptyPost =  false; 
            }
            this.notscrolly = true;
            resolve( true );
        },
        error => {
          console.log('Error', error);
          resolve( false );
        });
    });
  }

  getVentarArt(){
    this._ventasPro.get( { where: { ventas: this.dataUltV.id } } ).subscribe( res => {
      this.dataUltV.listArticulo = res.data;
    });
  }
  handleOpenAlertP( item:any ){
    if( item.ven_estado === 0 ) this._tools.openAlertSubmir( { title: "Importante", text: `Nuestras Lines de Pago Unicas Disponibles Nequi # ${ this.ShopConfig.numNequi }
      Nuestras Lines de Pago Unicas Disponibles Bancolombia # ${ this.ShopConfig.numBancolombia }` } );
  }

  handleWhatsapp( row:any ){
    let mensaje: string = `https://wa.me/57${ this.ShopConfig.numeroCelular }?text=Hola Servicio al Cliente esta es mi orden, por favor, me pueden colaborar *Numero orden*: ${ row.id }`;
    // console.log( mensaje , res);
    window.open(mensaje);
  }
  handleCopy( text:string ){
    this._tools.copiarLinkRegistro( text );
  }

  handleOpenArt( item ){
    let url:string = window.origin;
    url+="/tienda/productosView/"+item.id;
    window.open( url )
  }

}
