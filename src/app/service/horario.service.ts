import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { horario } from '../models/horario';
import { ConnectivityService } from './connectivity.service';
@Injectable({
  providedIn: 'root'
})
export class HorarioService {

  isConnected: boolean = true;

  APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  APIv3: string = 'http://localhost/olimpusGym/conf/';
  API: String = '';

  constructor(private clienteHttp:HttpClient, private connectivityService: ConnectivityService) {
  }

  comprobar(){
    this.connectivityService.checkInternetConnectivity().subscribe((isConnected: boolean) => {
      this.isConnected = isConnected;
      if (isConnected) {
        this.API = this.APIv2;
      } else {
        this.API = this.APIv3;
      }
    });
  }

  obternerHorario(){
    return this.clienteHttp.get(this.API+"horario.php");
  }

  agregarHorario(datosHorario: horario):Observable<any>{
    return this.clienteHttp.post(this.API+"horario.php?insertar=1", datosHorario);
  }
  
  actualizarHorario(id: any, datosPlan: any): Observable<any> {
    console.log(id, "idHorarios")
    return this.clienteHttp.post(`${this.API}horario.php?actualizar=${id}`, datosPlan, { headers: { 'Content-Type': 'application/json' }, responseType: 'text' });
  }

  consultarHorario(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"horario.php?consultar="+id);
  }

}
