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
  
  // obternerDataMem(){
  //   return this.clienteHttp.get(this.API);
  // }

  idPagoSucursal(id:any,MemId:any):Observable<any>{
    const params = new HttpParams().set('consClienteId', id).set('consDetMemId', MemId);

    return this.clienteHttp.get(this.API+"Usuario.php", { params });
  }

  ticketPagoInfo(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"Usuario.php?infoTicketMembresia="+id);
  }

  /*obtenerActivos(){
    return this.clienteHttp.get(this.API+"?consultar");
  }*/

 /* obtenerActivos(inicioDate: any, finDate: any, idGym: any): Observable<any>{
    const params = new HttpParams().set('fechaInicio',inicioDate).set('fechaFin',finDate).set('GYMid',idGym);
    return this.clienteHttp.get(this.API, {params});
  }*/

  obtenerActivos(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"Usuario.php?obtenerVista="+id);
  }  


  obtenerClientes(idGym:any):Observable<any>{
    return this.clienteHttp.get(this.API+"Usuario.php?idGimnasio="+idGym);
  } 

  clientesMemReenovar(){
    return this.clienteHttp.get(this.API+"Usuario.php?Reenovacion");
  }

  pagoMemOpcion1(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"Usuario.php?updateMembresia="+id);
  }  

  membresiasLista(idSucu: any):Observable<any>{
    return this.clienteHttp.get(this.API+"Usuario.php?listaMembre="+idSucu);
  }
  
  membresiasInfo(idMemb: any):Observable<any>{
    return this.clienteHttp.get(this.API+"Usuario.php?infoMembre="+idMemb);
  }

  actualizacionMemebresia(idCli:any,idMem:any, fecha: any):Observable<any>{
    const params = new HttpParams().set('consultClienteId', idCli).set('consultMemId', idMem).set('fechaActual',fecha);

    return this.clienteHttp.get(this.API+"Usuario.php", { params });
  }

  histoClienteMemb(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"Usuario.php?histoCliente="+id);
  }

  actualizaDatosCliente(data: any): Observable<any> {
    return this.clienteHttp.post<msgResult>(this.API+"Usuario.php?updatePersonalData", data, { headers: this.httpHeaders });
  }
}