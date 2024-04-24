import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { msgResult } from '../models/empleado';
import { ConnectivityService } from './connectivity.service';
@Injectable({
  providedIn: 'root'
})
export class PagoMembresiaEfectivoService {
  
  isConnected: boolean = true;

  APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  APIv3: string = 'http://localhost/olimpusGym/conf/';
  API: String = '';

  constructor(private clienteHttp:HttpClient, private connectivityService: ConnectivityService) { }
  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });


  comprobar(){
    this.connectivityService.checkInternetConnectivity().subscribe((isConnected: boolean) => {
      this.isConnected = isConnected;
      if (isConnected) {
        //console.log("La red WiFi tiene acceso a Internet.");
        this.API = this.APIv2;
      } else {
        //console.log("La red WiFi no tiene acceso a Internet.");
        this.API = this.APIv3;
      }
    });
  }

  ticketPagoInfo(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"Usuario.php?infoTicketMembresia="+id);
  }

  obtenerActivos(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"Usuario.php?obtenerVista="+id);
  }

  obtenerClientes(inicioDate: any, finDate: any, idGym: any): Observable<any> {
    const params = {
      GYMid: idGym,
      fechaInicio: inicioDate,
      fechaFin: finDate
    };
    return this.clienteHttp.get(this.API + 'Usuario.php', { params });
  }
  

  membresiasLista(idSucu: any):Observable<any>{
    const params = {
      id_bodega: idSucu
    };
    return this.clienteHttp.get(this.API+"Usuario.php?listaMembre=", { params });
  }
  
  membresiasInfo(idMemb: any):Observable<any>{
    const params = {
      id_mem: idMemb
    };
    return this.clienteHttp.get(this.API+"Usuario.php?infoMembre=", { params });
  }

  actualizacionMemebresia(idCli:any,idMem:any, fecha: any, detMemID: any, precio: any, fechaFormateadaFin: any):Observable<any>{
    const params = new HttpParams().set('consultClienteId', idCli).set('consultMemId', idMem).set('fechaActual',fecha).set('detMemID',detMemID).set('precio',precio).set('fechaFormateadaFin',fechaFormateadaFin);

    return this.clienteHttp.get(this.API+"Usuario.php", { params });
  }

  histoClienteMemb(id:any):Observable<any>{
    const params = {
      idCliente: id
    };
    return this.clienteHttp.get(this.API+"Usuario.php?histoCliente=", { params });
  }

  actualizaDatosCliente(data: any): Observable<any> {
    return this.clienteHttp.post<msgResult>(this.API+"Usuario.php?updatePersonalData", data, { headers: this.httpHeaders });
  }
}