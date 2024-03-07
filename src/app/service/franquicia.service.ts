import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FranquiciaService {
 
  //Servicio que muestra la franquicia Olympus
  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  API: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/superAdministrador/franquicia.php'
  constructor( private clienteHttp:HttpClient){}

  obternerFran(){
    return this.clienteHttp.get(this.API)
  }

  consultarPlan(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"?consultarF="+id);
  }
}
