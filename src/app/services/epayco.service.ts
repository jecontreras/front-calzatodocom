import { Injectable } from '@angular/core';

declare var ePayco: any; // Declaramos el objeto ePayco del script

@Injectable({
  providedIn: 'root'
})
export class EpaycoService {
  private ePaycoInstance: any;

  constructor() {
    this.ePaycoInstance = ePayco.checkout.configure({
      key: 'ef431d0876f05a31bbcaefd9289a1e1b8a5484d5', // Reemplaza con tu llave pública de ePayco
      test: true, // Cambiar a false si es en producción
    });
  }

  pagar(datosPago: any): void {
    this.ePaycoInstance.open(datosPago);
  }
}
