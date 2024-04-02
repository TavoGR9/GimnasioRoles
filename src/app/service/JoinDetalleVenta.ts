import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JoinDetalleVentaService {
  //API: string = 'https://localhost/plan/JoinDetalleVenta.php'
  //API2: string = 'http://localhost/plan/JoinDetalleCaja.php'
 //API: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/recepcion/JoinDetalleVenta.php'

 API: string = 'http://localhost/plan/venta_detalleVenta.php'
 API2: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/recepcion/JoinDetalleCaja.php'
  
  constructor(private clienteHttp:HttpClient) {
  }

  consultarProductosVentas(Gimnasio_idGimnasio: number | null):Observable<any[]>{
    const url = `${this.API}?ventasDetalle=${Gimnasio_idGimnasio}`;
    console.log(url, "url");
    return this.clienteHttp.get<any[]>(url);
  }


  obtenerDetallesCaja(Recepcionista_idRecepcionista: string, idCaja: string): Observable<any[]> {
    const url = `${this.API2}?Recepcionista_idRecepcionista=${Recepcionista_idRecepcionista}&idCaja=${idCaja}`;
    return this.clienteHttp.get<any[]>(url);
  }

  consultarProductosGimnasio(idGimnasio: number | null): Observable<any[]> {
    const url = `${this.API}?consultar=true&Gimnasio_idGimnasio=${idGimnasio}`;
    return this.clienteHttp.get<any[]>(url);
  }

}
