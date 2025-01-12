import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { CART } from '../interfaces/sotarage';
import { environment } from 'src/environments/environment';

declare var ePayco: any; // Declaramos el objeto ePayco del script

@Injectable({
  providedIn: 'root'
})
export class EpaycoService {
  private ePaycoInstance: any;
  private ShopConfig:any = {};

  constructor(
    private _store: Store<CART>,
  ) {
    this._store.subscribe((store: any) => {
      store = store.name;
      if(!store) return false;
      this.ShopConfig = store.configuracion || {};
    });
  }

  pagar( dataBuy: any ) {
    return new Promise( resolve =>{
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
          amount: dataBuy.ven_tipo === 'PAGO ADELANTADO' ? dataBuy.ven_total : 20000, // Total del pedido
          tax_base: "0", // Subtotal
          tax: "0", // IVA
          tax_ico: "0", // Impuesto al consumo
          country: "co",
          lang: "es", // Usa el valor de lang
      
          //Onpage="false" - Standard="true"
          external: "true",
      
          // Atributos cliente
          name_billing: dataBuy.ven_nombre_cliente || '',
          address_billing: dataBuy.ven_direccion_cliente || '',
          mobilephone_billing: dataBuy.telefono || '',
          number_doc_billing: "",
          email_billing: dataBuy.ven_imagen_conversacion || '',
          type_doc_billing: "cc",
      
          confirmation: environment.url+"/tblventas/checkEpayco",
          response: location.origin+"/tienda/detallepedido/"+dataBuy.id,
      
          // Atributos opcionales
          extra1: "extra1",
          extra2: "extra2",
          extra3: "extra3",
      };
    
      console.log("***410", data)
      handler.open(data);
      resolve( true );
    });
  }
}
