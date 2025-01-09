import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { STORAGES } from 'src/app/interfaces/sotarage';
import { ConfiguracionAction, UserAction } from 'src/app/redux/app.actions';
import { ToolsService } from 'src/app/services/tools.service';
import { UsuariosService } from 'src/app/servicesComponents/usuarios.service';
import { VentasService } from 'src/app/servicesComponents/ventas.service';
import  { SocialAuthService, FacebookLoginProvider, SocialUser }  from 'angularx-social-login';
import { FormatosService } from 'src/app/services/formatos.service';
import { ConfiguracionService } from 'src/app/servicesComponents/configuracion.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-checkt-dialog',
  templateUrl: './checkt-dialog.component.html',
  styleUrls: ['./checkt-dialog.component.scss']
})
export class ChecktDialogComponent implements OnInit {
  data:any = {};
  disabled:boolean = true;
  valor:number = 0;
  dataUser:any = {};
  ShopConfig:any = {};
  dataEndV:any = {};
  listCantidad = [];

  constructor(
    public dialogRef: MatDialogRef<ChecktDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public datas: any,
    public _tools: ToolsService,
    private _ventas: VentasService,
    private _user: UsuariosService,
    private _router: Router,
    private _store: Store<STORAGES>,
    private socialAuthService: SocialAuthService,
    public _formato: FormatosService,
    private _empresa: ConfiguracionService,
    private cdr: ChangeDetectorRef
  ) {
    this._store.subscribe((store: any) => {
      store = store.name;
      if( !store ) return false;
      this.dataUser = store.user || {};
      this.ShopConfig = store.configuracion || {};
    });
  }

  async ngOnInit() {
    console.log( this.datas );
    this.datas = this.datas.datos || {};
    this.data.talla = this.datas.talla;
    this.data.cantidadAd = this.datas.cantidadAd || 0;
    this.data.priceSelect = this.datas.priceSelect || this.data.costo;
    this.data.costo = this.datas.costo || 105000;
    this.data.opt = this.datas.opt;
    this.data.color = this.datas.colorSelect;
    this.data.pro_vendedor = this.datas.pro_vendedor;
    this.data.envioT = "priorida";
    //this.suma();
    this.handleCantidad( false );
    this.socialAuthService.authState.subscribe( async (user) => {
      let result = await this._user.initProcess( user );
      //console.log("**********", user, result )
      }
    );
    //VALIDADOR DE VENTAS
    if( this.ShopConfig.configV === 1 ){
      this.dataEndV = await this.getUltimaV();
      if( this.dataEndV ){
        if( this.dataEndV.empresa === 1 ) {
          let empresa:any = await this.getEmpresa2();
          this.ShopConfig = empresa;
          //console.log("**********71", this.ShopConfig)
          let accion = new ConfiguracionAction( empresa, 'post');
          this._store.dispatch( accion );
        }
      }
    }
    //console.log("**80", this.data )
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

  handleCantidad( opt:boolean ){
    //this.listCantidad = [];
    //console.log("****88", opt);
    if( opt ) { 
      this.data.cantidadAd++;
      this.ProcessListErt();
    }else{
      console.log("**NO ENTRAR93")
      if( this.listCantidad.length-1 === this.data.cantidadAd ) return false;
      for (let index = 0; index < this.data.cantidadAd; index++) {
        this.ProcessListErt();
      }
    }

  }

  ProcessListErt(){
    let data = { 
      id: this._tools.codigo(),
      ListTalla: [],
      foto: this.datas.foto,
      cantidadAd: 1,
      listColor: this.datas.listColor,
      color: this.datas.listColor[0].talla
    };
    //console.log("****113", data)
    this.listCantidad.push( data );
    this.handlePhoto( this.listCantidad[ this.listCantidad.length - 1 ] );
    this.suma();
  }

  handlePhoto( item:any ){
    let filterPhot = this.datas.listColor.find( row => row.talla === item.color );
    //console.log("***89", item, filterPhot)
    if( filterPhot ) {
      item.foto = filterPhot.foto;
      item.ListTalla = ( filterPhot.tallaSelect.filter( row => row.check === true ) ) || [];
      item.talla = item.ListTalla[0].tal_descripcion;
    }
  }

  handleDrop( item:any ){
    this.listCantidad = this.listCantidad.filter( row => row.id !== item.id );
    this.suma();
  }

  getEmpresa2(){
    return new Promise( resolve =>{
      this._empresa.get( { where: { id: 2 }, limit: 1 } ).subscribe( res =>{
        return resolve( res.data[0] );
      });
    });
  }

  async validateProcessVenta(){
    return new Promise( resolve =>{
      this._ventas.get( { where: { empresa: 2, create: moment().format("DD/MM/YYYY") }, limit:5 } ).subscribe( res =>{
        if( res.count === 4 ) return resolve( true );
        else return resolve( false );
      });
    });
  }

  async getUltimaV(){
    return new Promise( resolve =>{
      this._ventas.get( { where: { }, limit: 1 } ).subscribe( async ( res ) =>{
        if( res.data[0].empresa === 1 ) {
          let validate = await this.validateProcessVenta( );
          if( validate === true ) res.data[0].empresa = 1;
        }
        return resolve( res.data[0] );
      });
    });
  }

  isInvalid(form: any, fieldName: string): boolean {
    return form.controls[fieldName] && form.controls[fieldName].invalid && form.controls[fieldName].touched;
  }

  onSubmit(form: any) {
    if (form.valid) {
      // Lógica para enviar el formulario
      console.log('Formulario enviado', this.data);
    } else {
      console.log('Formulario no válido');
    }
  }

  validadorInput(){
    //console.log("*********", this.data)
    if( !this.data.nombre ) return this.disabled = true;
    if( !this.data.telefono ) return this.disabled = true;
    if( !this.data.direccion ) return this.disabled = true;
    if( !this.data.barrio ) return this.disabled = true;
    if( !this.data.ciudad  ) return this.disabled = true;
    //if( !this.data.talla ) return this.disabled = true;
    //if( !this.data.color ) return this.disabled = true;
    this.disabled = false;
  }

  async finalizando(){
    let precioUnd = this.data.costo1 / ( this.data.cantidadAd1 || 1 );
    this.dialogRef.close( { precioUnd: precioUnd, item: this.listCantidad } );

  }

  formatCantidad(){
    let txtEnd = "";
    for( let item of this.listCantidad ){
      txtEnd+= `{"Foto": "${ item.foto }", "Color":"${ item.color }", "Talla": "${ item.talla }", "Cantidad": "${ item.cantidadAd }"},`;
    }
    return txtEnd;
  }

  async crearUser(){
    let filtro = await this.validandoUser( this.data.cedula );
    if( filtro ) { return false; }
    let data:any = {
      usu_clave: this.data.cedula,
      usu_confir: this.data.cedula,
      usu_usuario: this.data.cedula,
      usu_email: this.data.cedula,
      usu_nombre: this.data.nombre,
      usu_documento: this.data.cedula
    };
    let result = await this.creandoUser( data );
    //console.log("********", result);
    if( !result ) return false;
    return true;
  }

  validandoUser( documento:any ){
    return new Promise( resolve => {
      this._user.get( { where: { usu_documento: documento } } ).subscribe( ( res:any )=> {
        res = res.data[0];
        if( !res ) resolve( false );
        let accion:any = new UserAction( res , 'post' );
        this._store.dispatch( accion );
        this.urlRotulado();
        resolve( true );
      });
    });
  }

  creandoUser( data:any ){
    return new Promise( resolve => {
      this._user.create( data ).subscribe( ( res:any )=> {
        if( !res.success ) { resolve ( false ) }
        let accion:any = new UserAction( res.data , 'post' );
        this._store.dispatch( accion );
        this.urlRotulado();
        resolve( true );
      });
    });
  }

  urlRotulado(){

  }

  suma(){
    this.data.cantidadAd1 = 0;
    let priceReal = 0;
    for( let item of this.listCantidad ) this.data.cantidadAd1+= item.cantidadAd;
    let filterPrice = this.datas.listPrecios.find( row => this.data.cantidadAd1 >= row.cantidad );
    //console.log("***249", filterPrice )
    if( filterPrice ) priceReal = filterPrice.precios / filterPrice.cantidad ;
    //console.log("****269", filterPrice)
    let sumaR = ( ( priceReal ) || this.datas.pro_uni_venta ) * this.data.cantidadAd1;
    this.data.costo = sumaR;
    this.data.costo1 = sumaR;
    //console.log("***rr272", this.data.costo, this.data.cantidadAd1  )
    //if( this.data.envioT === 'priorida' ) this.data.costo+=5000;
    //console.log( this.data )
  }

  mensajeWhat(){
    let mensaje: string = ``;
    mensaje = `https://wa.me/57${ this.ShopConfig.numeroCelular }?text=${encodeURIComponent(`
      Hola Servicio al cliente, como esta, saludo cordial,
      para confirmar adquiere este producto
      Nombre de cliente: ${ this.data.nombre }
      *Celular:*${ this.data.telefono }
      *Cantidad:* ${ this.data.cantidadAd || 1 }
      *Ciudad:* ${ this.data.ciudad }
      *Barrio:*${ this.data.barrio }
      *Dirección:* ${ this.data.direccion }
      *Nombre Cliente:*${ this.datas.pro_nombre }
      *Detalles:* ${ this.formatCantidad() }

      TOTAL FACTURA ${( this.data.costo + ( this.data.pro_vendedor || 0 ) )}
      🤝Gracias por su atención y quedo pendiente para recibir por este medio la imagen de la guía de despacho`)}`;
    console.log(mensaje);
    window.open(mensaje);
  }

  validador(){
    if( !this.data.nombre ) { this._tools.tooast( { title: "Error falta el nombre ", icon: "error"}); return false; }
    if( !this.data.telefono ) { this._tools.tooast( { title: "Error falta el telefono", icon: "error"}); return false; }
    if( !this.data.direccion ) { this._tools.tooast( { title: "Error falta la direccion ", icon: "error"}); return false; }
    if( !this.data.ciudad  ) { this._tools.tooast( { title: "Error falta la ciudad ", icon: "error"}); return false; }
    if( !this.data.barrio ) { this._tools.tooast( { title: "Error falta el barrio ", icon: "error"}); return false; }
    //if( !this.data.talla ) { this._tools.tooast( { title: "Error falta la talla ", icon: "error"}); return false; }
    return true;
  }

  async nexCompra( data:any ){
    return new Promise( resolve =>{
      this._ventas.create( data ).subscribe(( res:any )=>{
        this.data.id = res.id;
        resolve( true );
      },( error:any )=> {
        //this._tools.presentToast("Error de servidor")
        resolve( false );
      });
    })
  }

  logearFacebook(){
    this.socialAuthService.signIn( FacebookLoginProvider.PROVIDER_ID );
  }

}
