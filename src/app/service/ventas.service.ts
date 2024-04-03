import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ventas } from '../models/ventas';

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  API: string = 'http://localhost/plan/'
  
  constructor(private clienteHttp:HttpClient) {
  }

  obternerVentas(){
    return this.clienteHttp.get(this.API+"venta_detalleVenta.php")
  }

  agregarVentas(Ventas: Ventas):Observable<any>{
    return this.clienteHttp.post(this.API+"venta_detalleVenta.php?insertarVentas=1", Ventas);
  }

  consultarVentas(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"venta_detalleVenta.php?consultar="+id);
  }

}
