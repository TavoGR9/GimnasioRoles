import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { horario } from '../models/horario';

@Injectable({
  providedIn: 'root'
})
export class HorarioService {

  APIHorario: string = 'https://olympus.arvispace.com/olimpusGym/conf/'
  constructor(private clienteHttp:HttpClient) {
  }

  obternerHorario(){
    return this.clienteHttp.get(this.APIHorario+"horario.php");
  }

  agregarHorario(datosHorario: horario):Observable<any>{
    return this.clienteHttp.post(this.APIHorario+"horario.php?insertar=1", datosHorario);
  }
  
  actualizarHorario(id: any, datosPlan: any): Observable<any> {
    console.log(id, "idHorarios")
    return this.clienteHttp.post(`${this.APIHorario}horario.php?actualizar=${id}`, datosPlan, { headers: { 'Content-Type': 'application/json' }, responseType: 'text' });
  }

  consultarHorario(id:any):Observable<any>{
    return this.clienteHttp.get(this.APIHorario+"horario.php?consultar="+id);
  }

}
