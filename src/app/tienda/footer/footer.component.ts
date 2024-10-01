import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { CART } from 'src/app/interfaces/sotarage';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  tiendaInfo:any = {};

  constructor(
    private _store: Store<CART>,
  ) {
    this._store.subscribe((store: any) => {
      store = store.name;
      if(!store) return false;
      this.tiendaInfo = store.configuracion || {};
    });
  }

  ngOnInit() {
  }


  handleContacto(){
    let url = "https://wa.me/573213692393?text=Hola Servicio al cliente";
    window.open(url);
  }

}
