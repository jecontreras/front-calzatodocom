import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { CART } from 'src/app/interfaces/sotarage';
import { CartAction, UserAction } from 'src/app/redux/app.actions';
import { ToolsService } from 'src/app/services/tools.service';
import { UsuariosService } from 'src/app/servicesComponents/usuarios.service';
import { VentasService } from 'src/app/servicesComponents/ventas.service';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { EpaycoService } from 'src/app/services/epayco.service';
import { environment } from 'src/environments/environment';
declare var ePayco: any;

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss']
})
export class CarritoComponent implements OnInit {
  
  listCarrito:any = [];
  totalSuma:number = 0;
  paymentForm: FormGroup;
  data:any = {};
  disabled:boolean = true;
  // Resumen del pedido
  orderSummary = {
    subtotal: 0,
    extraCharge: 0,
    total: 0,
    sumCantidad: 0,
    RestarAdl: 0
  };

  // Columnas mostradas en la tabla
  displayedColumns: string[] = ['product', 'subtotal'];

  dataUser:any = {};
  ShopConfig:any = {};
  disabledSpineer: boolean = false;
  // Lista de indicativos de países
  countryCodes = [
    { name: 'Colombia', code: '57' },
    { name: 'Estados Unidos', code: '1' },
    { name: 'México', code: '52' },
    { name: 'Argentina', code: '54' },
    { name: 'España', code: '34' },
    { name: 'Chile', code: '56' },
    { name: 'Perú', code: '51' },
    { name: 'Ecuador', code: '593' },
    { name: 'Venezuela', code: '58' },
    { name: 'Brasil', code: '55' },
    // Agrega más países si es necesario
  ];

  constructor(
    private _store: Store<CART>,
    public _tools: ToolsService,
    private fb: FormBuilder,
    private _user: UsuariosService,
    private _ventas: VentasService,
    private _router: Router,
    private epaycoService: EpaycoService
  ) { 
    this.paymentForm = this.fb.group({
      paymentMethod: ['bacs', Validators.required] // Valor predeterminado: "Contra entrega"
    });
    this._store.subscribe((store: any) => {
      //console.log(store);
      store = store.name;
      if(!store) return false;
      this.dataUser = store.user || {};
      this.listCarrito = store.cart || [];
      this.ShopConfig = store.configuracion || {};
      this.suma();
    });
    
  }

  ngOnInit(): void {
    setTimeout(()=>{
      window.document.scrollingElement.scrollTop=0;
    },1000);
  }

  validadorInput(){
    //console.log("*********", this.data)
    //console.log(`Indicativo: ${this.data.indicativo}, Teléfono: ${this.data.telefono}`);
    if( !this.data.nombre ) return this.disabled = true;
    if( !this.data.telefono ) return this.disabled = true;
    if( !this.data.direccion ) return this.disabled = true;
    if( !this.data.barrio ) return this.disabled = true;
    if( !this.data.ciudad  ) return this.disabled = true;
    if( !this.data.ven_imagen_conversacion  ) return this.disabled = true;
    this.disabled = false;
  }

  suma(){
    this.totalSuma = 0;
    this.orderSummary.sumCantidad = 0;
    for( let row of this.listCarrito ) {
      this.totalSuma+= row.costoTotal;
      this.orderSummary.sumCantidad+=row.cantidad;
    }
    this.orderSummary.subtotal = this.totalSuma;
    let RestarAdl = 0;
    if( this.paymentForm.value.paymentMethod !== "bacs" ) {
      this.orderSummary.extraCharge = 10000;
      this.orderSummary.RestarAdl = 0;
    }
    else {
      this.orderSummary.extraCharge = 0;
      RestarAdl = ( ( this.orderSummary.subtotal / 10 ) );
      //RestarAdl = RestarAdl * 100;
      this.orderSummary.RestarAdl = RestarAdl;
    }
    this.orderSummary.total = ( this.orderSummary.subtotal + this.orderSummary.extraCharge ) - RestarAdl;
    this.orderSummary.total = this.orderSummary.total - RestarAdl;
  }

  updateCart( item:any ){
    let accion = new CartAction( item, 'put');
    this._store.dispatch( accion );
  }

  async borrar( item:any ){
    if( item.relacion === false ){
      this.listCarrito = this.listCarrito.filter( row => row.id !== item.id );
      this.deleteCart( item );
    }else{
      let opt = await this._tools.confirm({title:"Eliminar", detalle:"Si Eliminas el articulo del carrito se borra la oferta seleccionada", confir:"Si Eliminar"});
      if( opt.value ) {
        for( let itemR of this.listCarrito.filter( row => row.articulo === item.articulo ) ){
          this.deleteCart( itemR );
        }
      }
    }
    this.suma();
  }

  deleteCart( item:any ){
    let accion = new CartAction(item, 'delete');
    this._store.dispatch(accion);
    this.suma();
  }

  onPaymentMethodChange(event: any): void {
    console.log('Método de pago seleccionado:', event.value);
    this.suma();
    // Aquí puedes actualizar otros valores o realizar lógicas adicionales según el método seleccionado
  }

  onSubmit(form: any) {
    if (form.valid) {
      // Lógica para enviar el formulario
      console.log('Formulario enviado', this.data);
    } else {
      console.log('Formulario no válido');
    }
  }

  onSubmit2() {
    console.log('Formulario enviado', this.data);
    //this.finalizando();
  }

  isInvalid(form: any, fieldName: string): boolean {
    return form.controls[fieldName] && form.controls[fieldName].invalid && form.controls[fieldName].touched;
  }

  validador(){
    if( !this.data.nombre ) { this._tools.tooast( { title: "Error falta el nombre ", icon: "error"}); return false; }
    if( !this.data.telefono ) { this._tools.tooast( { title: "Error falta el telefono", icon: "error"}); return false; }
    if( !this.data.direccion ) { this._tools.tooast( { title: "Error falta la direccion ", icon: "error"}); return false; }
    if( !this.data.ciudad  ) { this._tools.tooast( { title: "Error falta la ciudad ", icon: "error"}); return false; }
    if( !this.data.barrio ) { this._tools.tooast( { title: "Error falta el barrio ", icon: "error"}); return false; }
    return true;
  }

  async finalizando(){
    if( this.disabled ) return false;
    this.disabled = true;
    let validador = await this.validador();
    if( !validador ) { this.disabled = false; return false;}
    let data:any = {
      "ven_tipo": this.orderSummary.extraCharge === 0 ? 'PAGO ADELANTADO' : 'PAGA EN CASA',
      "usu_clave_int": 1,
      "ven_usu_creacion": "arleytienda@gmail.com",
      "ven_fecha_venta": moment().format("DD/MM/YYYY"),
      "cob_num_cedula_cliente": ( this.data.indicativo || '57' ) + this.data.telefono,
      "ven_nombre_cliente": this.data.nombre,
      "ven_telefono_cliente": ( this.data.indicativo || '57' )+ this.data.telefono,
      "ven_ciudad": this.data.ciudad,
      "ven_barrio": this.data.barrio,
      "ven_direccion_cliente": this.data.direccion,
      "ven_total": ( this.orderSummary.total ),
      "ven_ganancias": this.orderSummary.extraCharge,
      "ven_observacion": this.data.ven_observacion || "",
      "ven_estado": 0,
      "create": moment().format("DD/MM/YYYY"),
      "ven_cantidad": this.orderSummary.sumCantidad,
      "apartamento": this.data.apartamento || '',
      "departamento": this.data.departamento || '',
      "empresa": this.ShopConfig.id,
      "ven_precio": this.orderSummary.subtotal,
      "listaArticulo": _.map( this.listCarrito, ( row =>{
        row = {
          articulo: row.articulo,
          titulo: row.titulo,
          pro_vendedorCompra: 0,
          cantidad: row.cantidad,
          comision: 0,
          tallaSelect: row.talla || 'unica',
          color: row.color || row.foto,
          foto: row.foto,
          codigoImg: row.foto,
          loVendio: row.costo,
          costo: row.costoTotal,
          pro_usu_creacion: this.dataUser.id,
          ...row
        }
        return row;
      }))
    };
    this.disabledSpineer = true;
    let idUser:any = await this.crearUser();
    //console.log("****196", idUser)
    data.usu_clave_int = idUser.id;
    let resul = await this.nexCompra( data );
    if( !resul ) {
      this.disabled = false;
      this.disabledSpineer = false;
      return this._tools.presentToast("TENEMOS PROBLEMAS AL REGISTRAR LA VENTA");
    }
    this.handleCheckTransFer( resul );
    this.disabled = false;
    this.disabledEpaycoSpinner = true;
    //this.disabledSpineer = false;
    this._tools.presentToast("Exitoso Tu pedido esta en proceso. un accesor se pondra en contacto contigo!");
    setTimeout(()=>this._tools.tooast( { title: "Tu pedido esta siendo procesado "}) ,3000);
    //this.mensajeWhat();
    let accion: any = new CartAction({}, 'drop');
    this._store.dispatch(accion);
    //this._router.navigate(['/tienda/detallepedido']);
    //this.dialogRef.close('creo');

  }

  disabledEpaycoSpinner:boolean = false;

  mensajeWhat(){
    let mensaje: string = ``;
    mensaje = `https://wa.me/57${ this.ShopConfig.numeroCelular }?text=${encodeURIComponent(`
      Hola Servicio al cliente, como esta, saludo cordial,
      para confirmar adquiere este producto
      Nombre de cliente: ${ this.data.nombre }
      *Celular:*${ this.data.telefono }
      *Ciudad:* ${ this.data.ciudad }
      *Barrio:*${ this.data.barrio }
      *Dirección:* ${ this.data.direccion }
      *Nombre Cliente:*${ this.data.pro_nombre }

      TOTAL FACTURA ${( this.data.costo + ( this.data.pro_vendedor || 0 ) )}
      🤝Gracias por su atención y quedo pendiente para recibir por este medio la imagen de la guía de despacho`)}`;
    console.log(mensaje);
    window.open(mensaje);
  }

  async crearUser(){
    let filtro = await this.validandoUser( this.data.telefono );
    if( filtro ) { return filtro; }
    let data:any = {
      usu_clave: this.data.telefono,
      usu_confir: this.data.telefono,
      usu_usuario: this.data.telefono,
      usu_email: this.data.telefono,
      usu_nombre: this.data.nombre,
      usu_documento: this.data.telefono,
      rol: "visitante"
    };
    let result = await this.creandoUser( data );
    //console.log("********", result);
    if( !result ) return false;
    return result;
  }
  
  async nexCompra( data:any ){
    return new Promise( resolve =>{
      this._ventas.create( data ).subscribe(( res:any )=>{
        this.data.id = res.id;
        resolve( res );
      },( error:any )=> {
        //this._tools.presentToast("Error de servidor")
        resolve( false );
      });
    })
  }

  urlRotulado(){

  }

  validandoUser( documento:any ){
    return new Promise( resolve => {
      this._user.get( { where: { usu_documento: documento } } ).subscribe( ( res:any )=> {
        res = res.data[0];
        if( !res ) resolve( false );
        let accion:any = new UserAction( res , 'post' );
        this._store.dispatch( accion );
        this.urlRotulado();
        resolve( res );
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
        resolve( res.data );
      });
    });
  }
  checkoutData: any;
  /*
  handleCheckTransFer(){
    const paymentDetails = {
      amount: this.orderSummary.total,
      tax: 0, // Cambia según corresponda
      base: this.orderSummary.total,
      description: 'Compra en Mi Tienda',
      email: 'cliente@correo.com', // Debes pedir el email al cliente
      name: 'Juan Pérez', // Debes pedir el nombre al cliente
      phone: '3001234567', // Debes pedir el teléfono al cliente
    };

    this._ventas.createCheckout(paymentDetails).subscribe(
      (response) => {
        this.checkoutData = response.checkoutData;
        // Redirige al cliente a ePayco
        const epaycoForm = document.createElement('form');
        epaycoForm.action = 'https://checkout.epayco.co/checkout.js';
        epaycoForm.method = 'POST';
        epaycoForm.target = '_self';

        // Agrega los datos como inputs ocultos
        for (const key in this.checkoutData) {
          if (Object.prototype.hasOwnProperty.call(this.checkoutData, key)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = this.checkoutData[key];
            epaycoForm.appendChild(input);
          }
        }

        document.body.appendChild(epaycoForm);
        epaycoForm.submit();
      },
      (error) => {
        console.error('Error al generar el checkout:', error);
        alert('Hubo un problema al generar el pago.');
      }
    );
  }
    */
  handleCheckTransFer( dataBuy ){
    console.log("DST", dataBuy)
    var handler = ePayco.checkout.configure({
      key: this.ShopConfig.keyEpayco,
      test: this.ShopConfig.epaycoDev
    });

    var data = {
      url: "https://recaudos.pagosinteligentes.com/CollectForm.aspx?Token=be3c7e95-5c30-47e3-9209-9e88a2e6f57d",
      otrourl: "https://publihazclick.s3.amazonaws.com/paquetes/19fd8728-c89b-44c7-951b-79dcbbace3ff.jpg",
      wester: "https://www.google.com.co/",
      imgwester: "https://www.viviendocali.com/wp-content/uploads/2017/10/Western-Union-en-bucaramanga.jpg",
      // Parámetros obligatorios
      name: "Comprando",
      invoice: dataBuy.id,
      currency: "cop", // Moneda
      amount: dataBuy.ven_tipo === 'PAGO ADELANTADO' ? this.orderSummary.total : 20000, // Total del pedido
      tax_base: "0", // Subtotal
      tax: "0", // IVA
      tax_ico: "0", // Impuesto al consumo
      country: "co",
      lang: "es", // Usa el valor de lang
  
      //Onpage="false" - Standard="true"
      external: "true",
  
      // Atributos cliente
      name_billing: this.data.nombre,
      address_billing: this.data.direccion,
      mobilephone_billing: this.data.telefono,
      number_doc_billing: "",
      email_billing: this.data.ven_imagen_conversacion,
      type_doc_billing: "cc",
  
      confirmation: environment.url+"/tblventas/checkEpayco",
      response: location.origin+"/tienda/detallepedido/"+dataBuy.id,
  
      // Atributos opcionales
      extra1: "extra1",
      extra2: "extra2",
      extra3: "extra3",
  };

  console.log("***410", data)
  handler.open(data)
  /*let obj:any = {
    url: "https://recaudos.pagosinteligentes.com/CollectForm.aspx?Token=be3c7e95-5c30-47e3-9209-9e88a2e6f57d",
    otrourl: "https://publihazclick.s3.amazonaws.com/paquetes/19fd8728-c89b-44c7-951b-79dcbbace3ff.jpg",
    wester: "https://www.google.com.co/",
    imgwester: "https://www.viviendocali.com/wp-content/uploads/2017/10/Western-Union-en-bucaramanga.jpg",
    name: "Comprando en Calzatodo",
    description: "Calzado Importado",
    invoice: dataBuy.id,
    currency: 'cop',
    amount: dataBuy.ven_tipo === 'PAGO ADELANTADO"' ? this.orderSummary.total : 20000, // Total del pedido
    tax_base: '0',
    tax: '0',
    country: 'co',
    test: false,
    lang: 'eng',
    external: 'true',
    extra1: 'extra1',
    extra2: 'extra2',
    extra3: 'extra3',
    name_billing: this.dataUser.name + ' ' + this.dataUser.lastname,
    email_billing: this.dataUser.email,
    address_billing: this.dataUser.ciudad || 'cucuta',
    type_doc_billing: this.dataUser.tipdoc,
    mobilephone_billing: this.dataUser.celular,
    number_doc_billing: this.dataUser.celular
};
//console.log( obj)
try {
  const handler: any = ePayco.checkout.configure({
    key: '90506d3b72d22b822f53b54dcf22dc3a',
    test: true
  })
    ;
  handler.open(obj);
} catch (error) {
  console.log("************", error)
  this._tools.tooast("Eror en el proceso de compra");
}*/

  }
}
