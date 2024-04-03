import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class inventarioService {

  API: string = 'http://localhost/plan/'
  
  constructor(private clienteHttp:HttpClient) {
  }

  obtenerProductoPorId(id: any, idGimnasio: any): Observable<any> {
    let params = new HttpParams().set('consultar', id).set('idGimnasio', idGimnasio);
    return this.clienteHttp.get(this.API+"producto_bod.php", { params: params });
  }

  HistorialInventario(dateInicio: any, dateFin: any, idGym: any): Observable<any> {
    const url = `${this.API}producto_bod.php?obtenerHistorialInventario`;
    const body = {id_bodega_param: idGym, fechaInicio_param: dateInicio, fechaFin_param: dateFin};
    return this.clienteHttp.post(url, body);
  }
}
