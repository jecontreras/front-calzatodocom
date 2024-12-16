import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { CART } from 'src/app/interfaces/sotarage';
import { Store } from '@ngrx/store';
import { CartAction, BuscadorAction } from 'src/app/redux/app.actions';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ToolsService } from 'src/app/services/tools.service';
import  { SocialAuthService, FacebookLoginProvider, SocialUser }  from 'angularx-social-login';
import { UsuariosService } from 'src/app/servicesComponents/usuarios.service';
import { CategoriasService } from 'src/app/servicesComponents/categorias.service';

declare var ePayco: any;

const URLFRONT = environment.urlFront;

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  showFiller = false;
  public mobileQuery: any;
  breakpoint: number;
  private _mobileQueryListener: () => void;
  urlwhat:string;
  data:any = {};
  listCart: any = [];
  events: string[] = [];
  opened:boolean;
  dataUser:any = {};
  rolUser:any = {};
  userId:any;
  buscador:string;
  tiendaInfo:any = {};
  disableBtn:boolean = false;
  texto:string; 
  
  socialUser: SocialUser;
  isLoggedin: boolean = null;
  searchVisible = false;
  lisCategory:any = [];
  urlLocation:string;
  countCart = 0;
  @ViewChild('menu2') menu2;

  constructor(
    public media: MediaMatcher,
    public changeDetectorRef: ChangeDetectorRef,
    private _store: Store<CART>,
    private Router: Router,
    public _tools: ToolsService,
    private socialAuthService: SocialAuthService,
    private _user: UsuariosService,
    private _categoryService: CategoriasService
  ) { 
    this._store.subscribe((store: any) => {
      console.log(store);
      store = store.name;
      if(!store) return false;
      this.listCart = store.cart || [];
      console.log("****64", this.listCart.length, this.countCart)
      if( ( ( this.countCart !== this.listCart.length ) && ( this.listCart.length > this.countCart ) ) && ( this.listCart.length !== 0 ) ) this.openDialog();
      this.countCart = this.listCart.length;
      this.userId = store.usercabeza || {};
      this.dataUser = store.user || {};
      this.tiendaInfo = store.configuracion || {};
      this.submitChat();
      this.calculateSubtotal();
    });
  }

  ngOnInit() {
    this.urlLocation = window.location.origin;
    this.mobileQuery = this.media.matchMedia('(max-width: 290px)');
    this._mobileQueryListener = () => this.changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    // tslint:disable-next-line:no-unused-expression
    this.mobileQuery.ds;
    this.socialAuthService.authState.subscribe( async (user) => {
      let result = await this._user.initProcess( user );
      console.log("**********", user, result )
      this.socialUser = user;
      this.isLoggedin = (user != null);
      }
    );
    this.getCategory();
  }

  openDialog(){
    setTimeout(()=> this.menu2.toggle(), 200 )
  }

  getCategory(){
    this._categoryService.get( {  where: { cat_activo: 0 }, limit: 5 } ).subscribe( res => {
      this.lisCategory = res.data;
    });
  }

  toggleMenu() {
    // Lógica para abrir/cerrar el menú lateral en móvil
  }

  closeCart() {
    console.log('Cerrar carrito');
  }

  async removeItem( key: any ) {
    if( !key.relacion ) {
      this.listCart = this.listCart.filter(item => item.id !== key.id );
      this.deleteCart( key );
    }
    else {
      let opt = await this._tools.confirm({title:"Eliminar", detalle:"Si Eliminas el articulo del carrito se borra la oferta seleccionada", confir:"Si Eliminar"});
      if( opt.value ) {
        for( let itemR of this.listCart.filter( row => row.articulo === key.articulo ) ){
          this.deleteCart( itemR );
        }
        this.listCart = this.listCart.filter(item => item.articulo !== key.articulo );
      }
    }
    this.calculateSubtotal();
  }

  calculateSubtotal() {
    return this.listCart.reduce((total, item) => total + item.costo * item.cantidad, 0);
  }

  toggleSearch() {
    this.searchVisible = !this.searchVisible;
  }

  loginWithFacebook(): void {
    this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }


  signOut(): void {
    this.socialAuthService.signOut();
  }

  deleteCart( item:any ){
    let accion = new CartAction(item, 'delete');
    this._store.dispatch(accion);
  }

  submitChat(){
    let texto:string =  '';
    this.data.total = 0;
    for(let row of this.listCart){
      texto+= ` productos: ${ row.titulo } foto: ${ row.foto } codigo: ${ row.codigo } cantidad: ${ row.cantidad } color ${ row.color || 'default'}`;
      this.data.total+= row.costoTotal || 0;
    }
    this.texto = texto;
    //console.log(this.dataUser, this.userId)
    if(this.userId.id){
      this.urlwhat = `https://wa.me/${ this.userId.usu_indicativo || 57 }${ this.userId.usu_telefono || ( this.tiendaInfo.numeroCelular || '3208429429' ) }?text=Hola Servicio al cliente, como esta, saludo cordial, estoy interesad@ en comprar los siguientes ${texto}`
    }else{
      this.urlwhat = `https://wa.me/57${ this.tiendaInfo.numeroCelular || '3208429429' }?text=Hola Servicio al cliente, como esta, saludo cordial, estoy interesad@ en comprar los siguientes ${texto}`
    }
  }

  buscarArticulo(){
    let data:any = {
      search: this.buscador
    };

    let accion = new BuscadorAction( data, 'post');
    this._store.dispatch( accion );
    this.Router.navigate( ['/tienda/productos'] );
  }

  openEpayco(){
    if( this.disableBtn ) return false;
    this.disableBtn = true;
    const handler:any = ePayco.checkout.configure({
      key: '90506d3b72d22b822f53b54dcf22dc3a',
      test: true
    });

    let data:any ={
      //Parametros compra (obligatorio)
      name: "Compra de articulos",
      description: this.texto,
      invoice: this.codigo(),
      currency: "cop",
      amount: this.data.total,
      tax_base: "0",
      tax: "0",
      country: "co",
      lang: "eng",
      //Onpage="false" - Standard="true"
      external: "true", 
      //Atributos opcionales
      extra1: "extra1",
      extra2: "extra2",
      extra3: "extra3",
      confirmation: URL+"/paquete/comprado",
      //confirmation: "https://f37798ba.ngrok.io/paquete/comprado",
      response: URLFRONT,

      //Atributos cliente
      name_billing: '',
      address_billing: '',
      type_doc_billing: "cc" || '',
      mobilephone_billing: '',
      number_doc_billing: ''
    }
    this.createPago( data.invoice );
    handler.open(data)
    setTimeout(()=>{
      this.disableBtn = false;
    }, 5000)
  }

  createPago( id:string ){
    let data:any = {
      usuario: this.userId.id,
      x_id_factura: id
    };
  }
  codigo() {
    return (Date.now().toString(36).substr(2, 3) + Math.random().toString(36).substr(2, 2)).toUpperCase();
  }

  handleOpenCategory( item:any){
    this.Router.navigate(['/tienda/productos', item.id ]);
    setTimeout( ()=> location.reload(), 100 )
  }

}
