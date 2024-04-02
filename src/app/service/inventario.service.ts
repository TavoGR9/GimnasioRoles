import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
//import { caja } from '../modules/recepcion/components/models/caja';

@Injectable({
  providedIn: 'root'
})
export class inventarioService {

API: string = 'http://localhost/plan/producto_bod.php'
 // API: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/administrador/inventario.php'
  
  constructor(private clienteHttp:HttpClient) {
  }

  obtenerProductoPorId(id: any, idGimnasio: any): Observable<any> {
    let params = new HttpParams().set('consultar', id).set('idGimnasio', idGimnasio);
    return this.clienteHttp.get(this.API, { params: params });
  }

  HistorialInventario(dateInicio: any, dateFin: any, idGym: any): Observable<any> {
    const url = `${this.API}?obtenerHistorialInventario`;
    const body = {id_bodega_param: idGym, fechaInicio_param: dateInicio, fechaFin_param: dateFin};
    return this.clienteHttp.post(url, body);
  }

}
