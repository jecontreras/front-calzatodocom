import { Injectable } from '@angular/core';
import { ServiciosService } from '../services/servicios.service';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(
    private _model: ServiciosService
  ) { }

  getSimply(query:any){
    return this._model.querys('tblproductos/getSimply',query, 'post');
  }

  get(query:any){
    return this._model.querys('tblproductos/querys',query, 'post');
  }
  create(query:any){
    return this._model.querys('tblproductos',query, 'post');
  }
  update(query:any){
    return this._model.querys('tblproductos/'+query.id, query, 'put');
  }

  updateVideoToken(query:any){ console.log("prod.serv updateVideoToken")
    return this._model.ejecutarPeticion('tblproductos/updateVideoToken', query, 'post');
  }
  delete(query:any){
    return this._model.querys('tblproductos/'+query.id, query, 'delete');
  }
  createTestimonio(query:any){
    return this._model.querys('tbltestimonio',query, 'post');
  }
}
