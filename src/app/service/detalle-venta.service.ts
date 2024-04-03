import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,forkJoin } from 'rxjs';
import { detalleVenta } from '../models/detalleVenta';

@Injectable({
  providedIn: 'root'
})
export class DetalleVentaService {
  //API: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/recepcion/detalle_venta.php'
  API: string = 'https://olympus.arvispace.com/olimpusGym/conf/'

  constructor(private clienteHttp:HttpClient) {
  }

  obternerVentaDetalle(){
    return this.clienteHttp.get(this.API+"venta_detalleVenta.php")
  }

  agregarVentaDetalle(datosVentaDetalle: detalleVenta[]): Observable<any> {
    return forkJoin(
      datosVentaDetalle.map((detalle: detalleVenta) =>
        this.clienteHttp.post(this.API + 'venta_detalleVenta.php?insertar=1', detalle)
      )
    );
  }
  
  consultarVentaDetalle(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"venta_detalleVenta.php?consultar="+id);
  }

}
