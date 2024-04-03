import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { msgResult } from '../models/empleado';

@Injectable({
  providedIn: 'root'
})
export class PagoMembresiaEfectivoService {

  URLServices: string = "https://olympus.arvispace.com/olimpusGym/conf/"; 

  constructor(private clienteHttp:HttpClient) { }
  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
  
  obternerDataMem(){
    return this.clienteHttp.get(this.URLServices);
  }

  idPagoSucursal(id:any,MemId:any):Observable<any>{
    const params = new HttpParams().set('consClienteId', id).set('consDetMemId', MemId);

    return this.clienteHttp.get(this.URLServices+"Usuario.php", { params });
  }

  ticketPagoInfo(id:any):Observable<any>{
    return this.clienteHttp.get(this.URLServices+"Usuario.php?infoTicketMembresia="+id);
  }

  /*obtenerActivos(){
    return this.clienteHttp.get(this.URLServices+"?consultar");
  }*/

 /* obtenerActivos(inicioDate: any, finDate: any, idGym: any): Observable<any>{
    const params = new HttpParams().set('fechaInicio',inicioDate).set('fechaFin',finDate).set('GYMid',idGym);
    return this.clienteHttp.get(this.URLServices, {params});
  }*/

  obtenerActivos(id:any):Observable<any>{
    return this.clienteHttp.get(this.URLServices+"Usuario.php?obtenerVista="+id);
  }  


  obtenerClientes(idGym:any):Observable<any>{
    return this.clienteHttp.get(this.URLServices+"Usuario.php?idGimnasio="+idGym);
  } 

  clientesMemReenovar(){
    return this.clienteHttp.get(this.URLServices+"Usuario.php?Reenovacion");
  }

  pagoMemOpcion1(id:any):Observable<any>{
    return this.clienteHttp.get(this.URLServices+"Usuario.php?updateMembresia="+id);
  }  

  membresiasLista(idSucu: any):Observable<any>{
    return this.clienteHttp.get(this.URLServices+"Usuario.php?listaMembre="+idSucu);
  }
  
  membresiasInfo(idMemb: any):Observable<any>{
    return this.clienteHttp.get(this.URLServices+"Usuario.php?infoMembre="+idMemb);
  }

  actualizacionMemebresia(idCli:any,idMem:any, fecha: any):Observable<any>{
    const params = new HttpParams().set('consultClienteId', idCli).set('consultMemId', idMem).set('fechaActual',fecha);

    return this.clienteHttp.get(this.URLServices+"Usuario.php", { params });
  }

  histoClienteMemb(id:any):Observable<any>{
    return this.clienteHttp.get(this.URLServices+"Usuario.php?histoCliente="+id);
  }

  actualizaDatosCliente(data: any): Observable<any> {
    return this.clienteHttp.post<msgResult>(this.URLServices+"Usuario.php?updatePersonalData", data, { headers: this.httpHeaders });
  }
}