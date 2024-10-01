import { NgModule } from '@angular/core';
import { MainsComponent } from './main.component';
import { MainConfigRoutingModule } from './main-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule,  FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoriasComponent } from './components/categorias/categorias.component';
import { ProductosComponent } from './components/productos/productos.component';
import { FormcategoriasComponent } from './form/formcategorias/formcategorias.component';
import { MyOwnCustomMaterialModule } from '../app.material.module';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ProvedoresComponent } from './components/provedores/provedores.component';
import { FormprovedoresComponent } from './form/formprovedores/formprovedores.component';
import { FormproductosComponent } from './form/formproductos/formproductos.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { FormusuariosComponent } from './form/formusuarios/formusuarios.component';
import { VentasComponent } from './components/ventas/ventas.component';
import { FormventasComponent } from './form/formventas/formventas.component';
import { BancosComponent } from './components/bancos/bancos.component';
import { CobrosComponent } from './components/cobros/cobros.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { FormbancosComponent } from './form/formbancos/formbancos.component';
import { FormcobrosComponent } from './form/formcobros/formcobros.component';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxSpinnerModule } from "ngx-spinner";
import { ReferidosComponent } from './components/referidos/referidos.component';
import { FormpuntosComponent } from './form/formpuntos/formpuntos.component';

//settings
import { AngularEditorModule } from '@kolkov/angular-editor';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { ViewProductosComponent } from './form/view-productos/view-productos.component';
import { MenuLateralComponent } from './components/menu-lateral/menu-lateral.component';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { NgImageSliderModule } from 'ng-image-slider';
import { HeaderComponent } from './components/header/header.component';
import { ConfigComponent } from './components/config/config.component';
import { NgxCurrencyModule } from 'ngx-currency';
import { ImageCropperModule } from 'ngx-image-cropper';
import { TestimonioComponent } from './components/testimonio/testimonio.component';
import { FormTestimonioComponent } from './form/form-testimonio/form-testimonio.component';


@NgModule({
  entryComponents: [
    FormcategoriasComponent,
    FormprovedoresComponent,
    FormproductosComponent,
    FormusuariosComponent,
    FormventasComponent,
    FormcobrosComponent,
    FormpuntosComponent,
    ViewProductosComponent,
    FormTestimonioComponent
  ],
  declarations: [
    MainsComponent,
    CategoriasComponent,
    ProductosComponent,
    FormcategoriasComponent,
    ProvedoresComponent,
    FormprovedoresComponent,
    FormproductosComponent,
    UsuariosComponent,
    FormusuariosComponent,
    VentasComponent,
    FormventasComponent,
    BancosComponent,
    CobrosComponent,
    PerfilComponent,
    FormbancosComponent,
    FormcobrosComponent,
    ReferidosComponent,
    FormpuntosComponent,
    PedidosComponent,
    ViewProductosComponent,
    HeaderComponent,
    ConfigComponent,
    TestimonioComponent,
    FormTestimonioComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    ReactiveFormsModule,
    MainConfigRoutingModule,
    MyOwnCustomMaterialModule,
    InfiniteScrollModule,
    NgxSpinnerModule,
    FormsModule,
    NgxDropzoneModule,
    AngularEditorModule,
    NgxImageZoomModule,
    NgImageSliderModule,
    NgxCurrencyModule,
    ImageCropperModule
  ],
  exports: [
    FormcategoriasComponent,
    FormprovedoresComponent,
    FormproductosComponent,
    FormusuariosComponent,
    FormventasComponent,
    FormcobrosComponent,
    ViewProductosComponent
  ],
  providers: [
  ],
  bootstrap: [MainsComponent]
})
export class ConfigModule { }
