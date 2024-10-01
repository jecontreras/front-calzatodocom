import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { CART } from 'src/app/interfaces/sotarage';
import { ConfiguracionAction } from 'src/app/redux/app.actions';
import { ConfiguracionService } from 'src/app/servicesComponents/configuracion.service';

@Component({
  selector: 'app-mains',
  templateUrl: './mains.component.html',
  styleUrls: ['./mains.component.scss']
})
export class MainsComponent implements OnInit {
  data:any = {};
  id:string;
  urlwhat:string;
  empresa:any = {};
  dominio:string;

  constructor(
    private _store: Store<CART>,
    private _config: ConfiguracionService,
  ) {
    this._store.subscribe((store: any) => {
      store = store.name;
      if(!store) return false;
      if( store.usercabeza ) this.data = store.configuracion || {}
    });
    this.dominio = window.location.host;
    console.log("******HOST", this.dominio)
    if( this.dominio === 'localhost:4200' ) this.dominio = "calzatodocom.web.app";
    this.getEmpresa();
  }

  ngOnInit() {
    this.urlwhat = `https://api.whatsapp.com/send?phone=57${ this.data.numeroCelular }&amp;text=Hola%2C%20estoy%20interesado%20en%20los%20tenis%20NIKE%2C%20gracias...`
  }

  getEmpresa(){
    this._config.get({ where: { dominio: this.dominio }, limit: 1 }).subscribe(( res:any )=>{
      //console.log(res);
      res = res.data[0];
      if( !res ) return false;
      if( res.id != this.empresa.id){
        let accion = new ConfiguracionAction( res, 'post');
        this._store.dispatch( accion );
      }
    },( error:any )=> console.error( error ));
  }

}
