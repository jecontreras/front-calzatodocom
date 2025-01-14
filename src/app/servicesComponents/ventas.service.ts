import { Injectable } from '@angular/core';
import { ServiciosService } from '../services/servicios.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  constructor(
    private _model: ServiciosService
  ) { }

  get(query:any){
    return this._model.querys('tblventas/querys',query, 'post');
  }
  create(query:any){
    return this._model.querys('tblventas',query, 'post');
  }
  update(query:any){
    return this._model.querys('tblventas/'+query.id, query, 'put');
  }
  delete(query:any){
    return this._model.querys('tblventas/'+query.id, query, 'delete');
  }
  getCount (query:any){
    return this._model.querys('tblventas/countVenta',query, 'post');
  }

  createCheckout(data: any): Observable<any> {
    return this._model.querys('tblventas/compraEpayco',data, 'post');
  }

  createVentaWhatsapp(data: any): Observable<any> {
    return this._model.querys('tblventas/createWhatsapp',data, 'post');
  }

}
