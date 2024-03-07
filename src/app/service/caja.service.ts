import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { caja } from '../models/caja';

@Injectable({
  providedIn: 'root'
})
export class CajaService {

  //Servicio que se utiliza para obtener y guardar los datos de una caja.
  API: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/recepcion/caja.php'
 
  constructor(private clienteHttp:HttpClient) {
  }

  obternerCaja(){
    return this.clienteHttp.get(this.API)
  }

  agregarCaja(datoscaja: caja):Observable<any>{
    return this.clienteHttp.post(this.API+"?insertar=1", datoscaja);
  }

  actualizarCaja(id:any,datoscaja:any):Observable<any>{
    return this.clienteHttp.post(this.API+"?actualizar="+id,datoscaja);
  } 

  consultarCaja(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"?consultar="+id);
  }

  borrarCaja(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"?borrar="+id)
  }

}
