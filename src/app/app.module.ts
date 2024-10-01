import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
//config
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ContenidoComponent } from './components/contenido/contenido.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MyOwnCustomMaterialModule } from './app.material.module';
import { ConfigModule } from './dashboard-config/config.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegistroComponent } from './components/registro/registro.component';
import { LoginComponent } from './components/login/login.component';

import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { appReducer } from './redux/app';
import { environment } from 'src/environments/environment';
import { MenuLateralComponent } from './dashboard-config/components/menu-lateral/menu-lateral.component';
import { NgImageSliderModule } from 'ng-image-slider';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxSpinnerModule } from "ngx-spinner";
import { ServiceWorkerModule } from '@angular/service-worker';
import { ProductoViewComponent } from './components/producto-view/producto-view.component';

import { NgxImageZoomModule } from 'ngx-image-zoom';
import { LoginsComponent } from './layout/login/login.component';
import { RegistrosComponent } from './layout/registro/registro.component';
import { TerminosComponent } from './layout/terminos/terminos.component';
import  { FacebookLoginProvider, GoogleLoginProvider, SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import { NgxCurrencyModule } from 'ngx-currency';

@NgModule({
  entryComponents:[
    LoginComponent,
    RegistroComponent,
    TerminosComponent
  ],
  declarations: [
    AppComponent,
    LoginsComponent,
    RegistrosComponent,
    ContenidoComponent,
    LoginComponent,
    RegistroComponent,
    TerminosComponent,
    MenuLateralComponent,
    ProductoViewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MyOwnCustomMaterialModule,
    HttpClientModule,
    ReactiveFormsModule,
    InfiniteScrollModule,
    NgxSpinnerModule,
    FormsModule,
    NgImageSliderModule,
    ConfigModule,
    NgxImageZoomModule,
    SocialLoginModule,
    NgxCurrencyModule,
    StoreModule.forRoot({ name: appReducer }),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  exports: [
    LoginComponent,
    RegistroComponent,
    MenuLateralComponent
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              'clientId'
            )
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider(
              '257894275306451'
            )
          }
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
