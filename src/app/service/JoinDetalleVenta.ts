import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JoinDetalleVentaService {

  API: string = 'http://localhost/plan/'

  constructor(private clienteHttp:HttpClient) {
  }

  consultarProductosVentas(Gimnasio_idGimnasio: number | null):Observable<any[]>{
    const url = `${this.API}venta_detalleVenta.php?ventasDetalle=${Gimnasio_idGimnasio}`;
    console.log(url, "url");
    return this.clienteHttp.get<any[]>(url);
  }

  consultarProductosGimnasio(idGimnasio: number | null): Observable<any[]> {
    const url = `${this.API}venta_detalleVenta.php?consultar=true&Gimnasio_idGimnasio=${idGimnasio}`;
    return this.clienteHttp.get<any[]>(url);
  }

}
