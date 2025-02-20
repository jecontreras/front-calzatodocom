import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CART } from 'src/app/interfaces/sotarage';
import { ToolsService } from 'src/app/services/tools.service';
import { Store } from '@ngrx/store';
import { SeleccionCategoriaAction, CartAction, ProductoHistorialAction, UserCabezaAction } from 'src/app/redux/app.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from 'src/app/servicesComponents/producto.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';
import { MatDialog, MatSnackBar } from '@angular/material';
import { InfoProductoComponent } from '../info-producto/info-producto.component';
import { NgImageSliderComponent } from 'ng-image-slider';
import { FormatosService } from 'src/app/services/formatos.service';
import * as moment from 'moment';
import { ChecktDialogComponent } from '../checkt-dialog/checkt-dialog.component';
import { UsuariosService } from 'src/app/servicesComponents/usuarios.service';
import { TestimoniosService } from 'src/app/servicesComponents/testimonios.service';
import { PizzaPartyComponent } from '../catalogo/catalogo.component';


// Declara jQuery para que Angular lo reconozca
declare var $: any;
declare var bootstrap: any;
@Component({
  selector: 'app-producto-view',
  templateUrl: './producto-view.component.html',
  styleUrls: ['./producto-view.component.scss']
})
export class ProductosViewComponent implements OnInit {

  id:any;
  data:any = {
    listTestimonios: []
  };
  pedido:any = { cantidad:1 };
  view:string = "descripcion";
  rango:number = 20;
  listProductos:any = [];
  query:any = {
    where:{
      pro_activo: 0
    },
    page: 0,
    limit: 30
  };
  queryId:any = {
    where:{
      //pro_activo: 0
    },
    page: 0,
    limit: 1
  };
  loader:boolean = false;
  notEmptyPost:boolean = true;
  notscrolly:boolean=true;
  listProductosHistorial:any = [];
  tiendaInfo:any = {};
  comentario:any = {};
  imageObject:any = [];
  imageObject2:any = [
    {
      image: "./assets/imagenes/1920x700.png",
      thumbImage: "./assets/imagenes/1920x700.png",
      alt: '',
      check: true,
      id: 1,
      title: ""
    }
  ];
  imageObject3:any = [
    {
      image: "./assets/imagenes/1920x700.png",
      thumbImage: "./assets/imagenes/1920x700.png",
      alt: '',
      check: true,
      id: 1,
      title: ""
    }
  ];

  @ViewChild('nav', {static: true}) ds: NgImageSliderComponent;
  sliderWidth: Number = 1119;
  sliderImageWidth: Number = 250;
  sliderImageWidth1: Number = 60;
  sliderImageHeight: Number = 200;
  sliderImageHeight1: Number = 60;
  sliderArrowShow: Boolean = true;
  sliderInfinite: Boolean = true;
  sliderImagePopup: Boolean = false;
  sliderAutoSlide: Number = 1;
  sliderSlideImage: Number = 1;
  sliderAnimationSpeed: any = 1;
  userId:any = {};
  dataUser:any = {};
  urlwhat:string
  listGaleria:any = [];
  listGaleria1:any = [];
  viewsImagen:string;
  listTallas:any = [];
  number:any;
  isClicked: boolean = false;
  viewsImagen2:string;
  durationInSeconds = 5;
  timeot= {
    hora: 0,
    minuto: 15,
    milesegundo: 15
  };

  showNotification = false;
  lastPurchase = { user: 'Julio de Valledupar', name: 'Articulo', price: '$150.000', image: 'https://segundav2.s3.us-east-2.amazonaws.com/optional/a4192d10-87da-40db-aa0b-87b0fc062888.webp' };
  dataList:any = [
    {
      txt: "Compro Andres Ciudad Armenia"
    },{
      txt: "Compro Albaro Ciudad Caqueta"
    },{
      txt: "Compro Diego Ciudad Bogota"
    },{
      txt: "Compro Juan Ciudad Medellin"
    },{
      txt: "Compro Huberth Ciudad Bogota"
    },{
      txt: "Compro Cesar Ciudad Bucaramanga"
    },{
      txt: "Compro Alberto Ciudad Cartagena"
    },{
      txt: "Compro Andrea Ciudad Medellin"
    },{
      txt: "Compro Roberto Ciudad Santa martha"
    },{
      txt: "Compro Eduardo Ciudad Huila"
    },{
      txt: "Compro Alvaro Ciudad Bogota"
    },
  ];

  @ViewChild('nextStep', { static: false }) nextStep: ElementRef;
  @ViewChild('productCarousel', { static: false }) productCarousel: ElementRef;
  listComentario:any =[];

  constructor(
    private _store: Store<CART>,
    private _tools: ToolsService,
    private activate: ActivatedRoute,
    private _producto: ProductoService,
    private Router: Router,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    public _formato: FormatosService,
    private _user: UsuariosService,
    private _testimonio: TestimoniosService,
    private _snackBar: MatSnackBar,

  ) {
    this._store.subscribe((store: any) => {
      //console.log(store);
      store = store.name;
      if(!store) return false;
      this.userId = store.usercabeza || {};
      this.dataUser = store.user || {};
      this.listProductosHistorial = _.orderBy(store.productoHistorial, ['createdAt'], ['DESC']);
      this.tiendaInfo = store.configuracion || {};
      if( store.usercabeza ) {
        this.queryId.where.idPrice = store.usercabeza.id;
        this.query.where.idPrice = store.usercabeza.id;
       }
    });
    /*setInterval(()=>{
      this.openSnackBar();
    }, 50000 );*/
    let terv = 0;
    setInterval(()=>{
      //this.openSnackBar();
      terv++;
      if( terv >= 10 && terv <=10 ){
        this.rango++;
        this.showNotification = true;
        function getRandomInt(max) {
          return Math.floor(Math.random() * max);
        }
        this.lastPurchase.user = this.dataList[getRandomInt(10)].txt;
        this.lastPurchase.image = this.viewsImagen;
      }
      if( terv >= 14 ){
        this.showNotification = false;
        terv = 0;
      }
      
    }, 1000 );
    //this.configTime();
  }

  async ngOnInit() {
    //console.log("**127", this.activate.snapshot.params)
    if((this.activate.snapshot.paramMap.get('id'))){
      this.id = this.activate.snapshot.paramMap.get('id');
      this.getProducto();
      this.getProductos();
      this.listComentario = this.handleComent();
    }
    this.urlwhat = `https://api.whatsapp.com/send?phone=57${ this.tiendaInfo.numeroCelular }&amp;text=Hola%2C%20estoy%20interesado%20en%20los%20tenis%20NIKE%2C%20gracias...`

    this.number = this.activate.snapshot.paramMap.get('cel');
    if( this.number ) this.dataUser = await this.getUser();
    setTimeout(()=>{
      window.document.scrollingElement.scrollTop=0;
    },1000 );

  }

  scrollToNextStep() {
    //console.log("*****", this.nextStep )
    if (this.nextStep) {
      this.alertTallaColor();
      this.nextStep.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }

  isValidationActive: boolean = false;

  alertTallaColor() {
    this.isValidationActive = true; // Activa la validación visual

    if (this.data.tallaR !== 'Unica' && !this.pedido.talla) {
      this._tools.error({ mensaje: "Por Favor Seleccionar una Talla" });
      return false;
    }

    if (!this.data.colorSelect) {
      this._tools.error({ mensaje: "Por Favor Seleccionar un Color" });
      return false;
    }

    // Si pasa la validación, desactiva la validación visual
    this.isValidationActive = false;
    return true;
  }

  prev() {
    $('#productCarousel').carousel('prev');
  }

  next() {
    $('#productCarousel').carousel('next');
  }
  
  isFullscreen = false;
  currentImage: string = '';
  currentIndex: number = 0;

  openFullscreen(image: string, index: number) {
    this.isFullscreen = true;
    this.currentImage = image;
    this.currentIndex = index;
  }

  closeFullscreen() {
    this.isFullscreen = false;
  }

  prevImage() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.imageObject2.length - 1; // Volver al último si estás en el primero
    }
    this.currentImage = this.imageObject2[this.currentIndex].image;
  }

  nextImage() {
    if (this.currentIndex < this.imageObject2.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0; // Volver al primero si estás en el último
    }
    this.currentImage = this.imageObject2[this.currentIndex].image;
  }

  configTime(){
    let minuto = 15;
    let milegundo = 15;
    setInterval(()=>{
      if( minuto === 0 ) return false;
      milegundo--;
      if(milegundo == 0 ) {
        minuto--;
        milegundo = 60;
      }
      this.timeot.hora = 0;
      this.timeot.minuto = minuto;
      this.timeot.milesegundo = milegundo;
    }, 1000 );
  }

  openSnackBar() {
    this._snackBar.openFromComponent(PizzaPartyComponent, {
      duration: this.durationInSeconds * 1000,
    });
  }

  getUser(){
    return new Promise( resolve =>{
      this._user.get({ where:{ usu_telefono: this.number }, limit: 1 } ).subscribe( item =>{
        item = item.data[0];
        if( item ) {
          this.GuardarStoreUser( item );
          this.query.where.idPrice = item.id;
        }
        resolve( item );
      },()=> resolve( false ) );
    })
  }

  GuardarStoreUser( data:any ) {
    let accion = new UserCabezaAction( data , 'post');
    this._store.dispatch(accion);
  }

  getProducto(){
    this.queryId.where.id = this.id;
    this._producto.get( this.queryId ).subscribe((res:any)=>{
      this.data = res.data[0] || {};
      this.getTestimonios();
      this.data.listComentarios = this.data.listComment || [];
      //console.log("***165", this.data.listComentarios)
      try {
        //this.data.listTallas = this.data.listColor[0].tallaSelect.filter( item => item.cantidad );
        console.log("***111", this.data)
        //for( let row of this.data.listTallas ) row.tal_descripcion = ( Number( row.tal_descripcion ) || row.tal_descripcion );
        //this.data.listTallas = _.orderBy( this.data.listTallas , ['tal_descripcion'], ['DEC'] );
        //console.log( "129", this.data )
      } catch (error) {}
      this.viewsImagen = this.data.foto;
      this.viewsImagen2 = this.data.foto;
      if( !this.data.listComentarios ) this.data.listComentarios = [];
      this.listGaleria1 = this.data.listaGaleria || [];
      if( !this.data.listColor ) this.data.listColor = [];
      for( let row of this.data.listColor){
        this.listTallas.push( ... ( _.filter( row.tallaSelect, off=> off.check == true ) ) );
        this.listTallas = _.unionBy( this.listTallas || [], this.listTallas, 'id');
      }
      for( let row of this.data.listaTallas ) {
        //this.pedido.talla = row.tal_descripcion;
        this.data.tallaR = row.tal_descripcion;
      }
      for( let row of this.data.listColor ) {
        let filtro = this.listGaleria.find( item => item.pri_imagen == row.foto );
        if( !filtro ) this.listGaleria.push( { id: this._tools.codigo(), pri_imagen: row.foto } );
      }
      this.listGaleria.push( { id: this._tools.codigo(), pri_imagen: this.data.foto})
      this.imageObject2 = _.map( this.listGaleria, ( item )=>{
        return {
          image: item.pri_imagen,
          thumbImage: item.pri_imagen,
          alt: '',
          check: true,
          id: item.id,
          title: ""
        }
      });
      for( let row of this.listGaleria1 ) this.imageObject2.push(
        {
          image: row.foto,
          thumbImage: row.foto,
          alt: '',
          check: true,
          id: row.id,
          title: ""
        }
      )
      this.bucleImg();
      this.listTallas = _.orderBy( this.listTallas, ['tal_descripcion'], ['asc']);
      try { this.handleSelect( this.data.listColor[0] ); } catch (error) { }
      //console.log("****357", window.document.scrollingElement)
      setTimeout(()=> window.document.scrollingElement.scrollTop=0, 200 );
    }, error=> { console.error(error); this._tools.presentToast('Error de servidor'); });
  }

  async bucleImg(){
      let idx = 0;
    while( true ){
      let dataFoto = this.listGaleria[idx];
      if( !dataFoto ) { idx = 0; dataFoto = this.listGaleria[idx]; }
      await this.sleep( 5 )
      this.viewsImagen2 = dataFoto.pri_imagen;
      idx++;

    }
  }

  async sleep(minutos){
    return new Promise(resolve => {
        setTimeout(async () => { resolve(true) }, minutos * 1000);
    });
}

  verImagen( img:any ){
    this.viewsImagen = img.pri_imagen || this.data.foto;
  }

  paginateArticle(){
    this.query.skip++;
    this.getProductos();
  }

  disabledReload:boolean = true;

  async getProductos(){
    this.query.where.codigo = this.data.codigo;
    delete this.query.where.id;
    if( this.tiendaInfo.id ) this.query.where.empresa = this.tiendaInfo.id;
    this.disabledReload = true;
    let resultado:any = await this.getArticulos();
    //this.imageObject = [];
    for( let row of resultado ){
      this.imageObject.push(
        {
          image: row.foto,
          thumbImage: row.foto,
          alt: '',
          check: true,
          id: row.id,
          ids: row.id,
          title: this._formato.monedaChange( 3, 2, row.pro_uni_venta || 0 )
        }
      );
    }

    this.disabledReload = false;
  }

  getArticulos(){
    return new Promise (resolve =>{
      this.query.where.idPrice = this.userId.id;
      this.query.where.id = { '!=' : [ this.id ] }
      try { this.query.where.pro_categoria = this.data.pro_categoria.id; } catch (error) { }
      //console.log("***210", this.query)
      this._producto.get( this.query ).subscribe((res:any)=>{
        resolve( res.data )
      }, ( error )=> { console.error(error); resolve( [] ); } );
    })
  }

  handleCatalogoPrev( opt:string ){
    let idR = this.data.id + 1;
    if( opt === 'prev' ) idR = this.data.id - 1;
    this.Router.navigate([ '/tienda/productosView', idR] );
    setTimeout(()=> location.reload(), 100 );
  }

  getTestimonios(){
    this._testimonio.get({ where: { /*productos:this.id*/ }, limit: 100, page: 0 })
    .subscribe(
      (response: any) => {
        //console.log("getTestimonios repsonse",response);
        this.data.listTestimonios = response.data
      },
      error => {
        console.log('Error', error);
      });
  }

  suma( data:any ){
    this.data.costo = Number( this.pedido.cantidad ) * this.data.pro_uni_venta;
  }

  codigo(){
    return (Date.now().toString(20).substr(2, 3) + Math.random().toString(20).substr(2, 3)).toUpperCase();
  }

  categoriasVer(){
    let accion = new SeleccionCategoriaAction( this.data.pro_categoria, 'post');
    this._store.dispatch(accion);
    this.Router.navigate(['/tienda/productos']);
  }

  AgregarCart(){
    this.suma( this.data );
    let data = {
      articulo: this.data.id,
      codigo: this.data.pro_codigo,
      titulo: this.data.pro_nombre,
      color: "",
      talla: this.pedido.talla,
      foto: this.data.foto,
      cantidad: this.pedido.cantidad || 1,
      costo: this.data.pro_uni_venta,
      costoTotal: this.data.costo,
      id: this.codigo()
    };
    let accion = new CartAction(data, 'post');
    this._store.dispatch(accion);
    this._tools.presentToast("Producto agregado al carro");
  }

  viewProducto( obj:any ){
    /*const dialogRef = this.dialog.open(InfoProductoComponent,{
      width: '855px',
      maxHeight: "665px",
      data: { datos: obj }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });*/
    let filtro = this.listProductosHistorial.filter( ( row:any ) => row.id == obj.id );
    if(!filtro) {
      let accion = new ProductoHistorialAction( obj , 'post');
      this._store.dispatch( accion );
    }
    this.Router.navigate(['/tienda/productosView', obj.id ]);
    setTimeout(()=>{
      window.document.scrollingElement.scrollTop=0;
      location.reload()
    }, 200)
  }

  async AgregarCart2( item:any ){
    this.scrollToNextStep();
    let validate= this.alertTallaColor();
    if( !validate ) return false;
    let data:any = {
      articulo: item.id,
      codigo: item.pro_codigo,
      titulo: item.pro_nombre,
      foto: this.viewsImagen || item.foto,
      talla: this.pedido.talla,
      cantidad: item.cantidadAdquirir || 1,
      costo: item.pro_uni_venta,
      costoTotal: ( item.pro_uni_venta*( item.cantidadAdquirir || 1 ) ),
      id: this.codigo(),
      color: this.data.colorSelect
    };
    let accion = new CartAction(data, 'post');
    this._store.dispatch(accion);
    this._tools.presentToast("Agregado al Carro");
    let resultA = await this._tools.carritoCompra();
    //console.log("****482", resultA)
    if( resultA.value ) {
      this.Router.navigate(['/tienda/carrito'])
    }
  }

  handlePhoto(obj:any) {
    //console.log("***173", obj)
    //console.log("***", this.imageObject2[obj])
    this.viewsImagen = this.imageObject2[obj].image;
  }

  async imageOnClick(obj:any) {
    //let data =  this.listProductosHistorial.find( (row:any )=> row.id == this.imageObject[obj].id);
    let data = await this.getProducId( { where: {
      idPrice: this.query.where.idPrice,
      pro_activo: 0
    } } );
    //console.log("**++",obj, data, this.imageObject, this.listProductosHistorial)
    if( !data ) return false;
    this.viewProducto( data );
  }

  getProducId( query){
    return new Promise( resolve=>{
      this._producto.get( query ).subscribe((res:any)=>{
        resolve( res.data[0] || {});
      });
    })
  }

  arrowOnClick(event) {
      // console.log('arrow click event', event);
  }

  lightboxArrowClick(event) {
      // console.log('popup arrow click', event);
  }

  prevImageClick() {
      this.ds.prev();
  }

  nextImageClick() {
      this.ds.next();
  }

  masInfo(obj:any){
    obj.talla = this.pedido.talla;
    obj.cantidad = this.pedido.cantidad || 1;
    let cerialNumero:any = '';
    let numeroSplit:any;
    let cabeza:any = this.dataUser.cabeza;
    if( cabeza ){
      numeroSplit = _.split( cabeza.usu_telefono, "+57", 2);
      if( numeroSplit[1] ) cabeza.usu_telefono = numeroSplit[1];
      if( cabeza.usu_perfil == 3 ) cerialNumero = ( cabeza.usu_indicativo || '57' ) + ( cabeza.usu_telefono || '3208429429' );
      else cerialNumero = "57"+this.validarNumero();
    }else cerialNumero = "57"+this.validarNumero();
    if(this.userId.id) this.urlwhat = `https://wa.me/${ this.userId.usu_indicativo || 57 }${ ( (_.split( this.userId.usu_telefono , "+57", 2))[1] ) || '3208429429'}?text=Hola Servicio al cliente, como esta, saludo cordial, estoy interesad@ en mas informacion ${obj.pro_nombre} codigo ${obj.pro_codigo} foto ==> ${ obj.foto } Talla: ${ obj.talla || 'default' }`;
    else {
      this.urlwhat = `https://wa.me/${ cerialNumero }?text=Hola Servicio al cliente, como esta, saludo cordial, estoy interesad@ en mas informacion ${obj.pro_nombre} codigo ${obj.pro_codigo} foto ==> ${ obj.foto } Talla: ${ obj.talla || 'default'}`;
    }
    window.open(this.urlwhat);
  }

  guardarComentario(){
    this._producto.createTestimonio( {
      descripcion: this.comentario.descripcion,
      nombre: this.comentario.nombre,
      email: this.comentario.email,
      productos: this.data.id
    }).subscribe(( res:any )=>{
      this._tools.tooast( { title: "Comentario creado" } );
      this.comentario = {};
      this.data.listComentarios.push( {
        nombre: res.nombre,
        fecha:  moment( res.createdAt ).format("DD/MM/YYYY"),
        descripcion: res.descripcion,
        posicion: _.random(0, 10),
        foto: "./assets/noimagen.jpg"
      } );
    },()=> this._tools.tooast( { title: "Error al crear el Comentario" } ) );
  }

  comprarArticulo( cantidad:number, opt, price:number = 0 ){
    this.isClicked = true;
    let datar = this.data;
    this.suma( datar );
    //this.AgregarCart();
    datar.cantidadAd = opt === true ? cantidad : this.pedido.cantidad || cantidad;
    datar.priceSelect = opt === true ? price: this.pedido.pro_uni_venta || price;
    datar.priceSelect = Number( datar.priceSelect );
    try {
      datar.talla = this.pedido.talla || datar.listTallas[0].tal_descripcion;
    } catch (error) { }
    datar.opt = opt;
    datar.foto = this.viewsImagen;
    const dialogRef = this.dialog.open(ChecktDialogComponent,{
      //width: '855px',
      maxWidth: '100%',
      //maxHeight: "665px",
      data: { datos: datar }
    });
    dialogRef.afterClosed().subscribe( async (result) => {
      //console.log(`Dialog result: ${result}`, result);
      if( result ) {
        for( let item of result.item ) this.handleNextCarrito( item, result.precioUnd );
        this._tools.presentToast("Agregado al Carro");
        let resultA = await this._tools.carritoCompra();
        //console.log("****482", resultA)
        if( resultA.value ) {
          this.Router.navigate(['/tienda/carrito'])
        }
      }
    });
  }

   handleNextCarrito( item:any, precioUnd:number ){
    let data:any = {
      relacion: true,
      articulo: this.data.id,
      codigo: this.data.pro_codigo,
      titulo: this.data.pro_nombre,
      foto: item.foto,
      talla: item.talla,
      cantidad: item.cantidadAd,
      costo: precioUnd,
      costoTotal: ( precioUnd*( item.cantidadAd || 1 ) ),
      id: this.codigo(),
      color: item.color
    };
    let accion = new CartAction(data, 'post');
    this._store.dispatch(accion);
  }

  resetAnimation() {
    // Después de que la animación termine, restablece la variable para que la animación solo se ejecute una vez
    this.isClicked = false;
  }

  validarNumero(){
    return this.tiendaInfo.numeroCelular || "3156027551";
  }

  handleSelect( item ){
    //console.log("***364", item, this.imageObject2 )
    try {
      this.listTallas = item.tallaSelect.filter( row => row.check === true );
    } catch (error) { }
    this.viewsImagen = item.foto;
    //this._tools.openFotoAlert( this.viewsImagen );
    this.data.colorSelect = item.talla;
    for( let row of this.data.listColor) row.check1 = false;
    item.check1 = true;
    let findIndex = _.findIndex( this.imageObject2, { 'image': item.foto } );
    //console.log("****11", findIndex )
    if( findIndex >= 0 ) this.showImage( findIndex );
  }

  // Función para mostrar la imagen que elijas
  showImage(index: number): void {
    //console.log("****701", this.nextStep )
    if( this.productCarousel ){
      const carousel = this.productCarousel.nativeElement;
      const bootstrapCarousel = new bootstrap.Carousel(carousel); // Crear instancia del carrusel
      bootstrapCarousel.to(index); // Cambiar al índice específico
    }
  }

  checkTalla( item ){
    this.pedido.talla = item.tal_descripcion;
    for( let row of this.data.listTallas ) row.check1 = false;
    item.check1 = !item.check1;
  }

  handleAdviser(){
    let number = this.userId.usu_telefono;
    if(number.length == 12 ) number;
    else number='57'+number;
    let url = `https://wa.me/${ number }?text=${encodeURIComponent(`👉Hola buenas! 🎉 Me gustaria mas informacion gracias 👈`)}`;
    window.open( url, "Mas Informacion", "width=640, height=480");
  }

  handleComent(){
    return [
      {
        "name": "Bonifacio Campos",
        "rating": 5,
        "comment": "Excelente producto ✌️"
      },
      {
        "name": "Casimiro Herrera",
        "rating": 5,
        "comment": "El pedido fue entregado según lo acordado, no hay nada que objetar.. me gustó."
      },
      {
        "name": "Claudio Vargas",
        "rating": 5,
        "comment": "¡Quedé muy satisfecho y espero realizar nuevas compras... producto muy bueno!"
      },
      {
        "name": "Elías Méndez",
        "rating": 5,
        "comment": "Me encantó, el producto buenísimo... sobre todo me llamó mucha atención el envío gratis y la rapidez en la entrega."
      },
      {
        "name": "Gabriel Vargas",
        "rating": 5,
        "comment": "Absolutamente nada a reclamar. ¡Recomiendo a todos! Buen producto, mejores promociones y excelente relación con el cliente."
      }
    ]
    
  }

}
