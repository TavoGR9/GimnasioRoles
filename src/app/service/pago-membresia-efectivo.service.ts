import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { msgResult } from '../models/empleado';

@Injectable({
  providedIn: 'root'
})
export class PagoMembresiaEfectivoService {

  URLServices: string = "https://olympus.arvispace.com/gimnasioRoles/configuracion/recepcion/pagoEfectivoMembresia.php/"; 
  constructor(private clienteHttp:HttpClient) { }
  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
  
  obternerDataMem(){
    return this.clienteHttp.get(this.URLServices);
  }

  idPagoSucursal(id:any,MemId:any):Observable<any>{
    const params = new HttpParams().set('consClienteId', id).set('consDetMemId', MemId);

    return this.clienteHttp.get(this.URLServices, { params });
  }

  /*obtenerActivos(){
    return this.clienteHttp.get(this.URLServices+"?consultar");
  }*/

  obtenerActivos(inicioDate: any, finDate: any, idGym: any): Observable<any>{
    const params = new HttpParams().set('fechaInicio',inicioDate).set('fechaFin',finDate).set('GYMid',idGym);
    return this.clienteHttp.get(this.URLServices, {params});
  }

  clientesMemReenovar(){
    return this.clienteHttp.get(this.URLServices+"?Reenovacion");
  }

  pagoMemOpcion1(id:any):Observable<any>{
    return this.clienteHttp.get(this.URLServices+"?updateMembresia="+id);
  }  

  membresiasLista(idSucu: any):Observable<any>{
    return this.clienteHttp.get(this.URLServices+"?listaMembre="+idSucu);
  }
  
  membresiasInfo(idMemb: any):Observable<any>{
    return this.clienteHttp.get(this.URLServices+"?infoMembre="+idMemb);
  }

  actualizacionMemebresia(idCli:any,idMem:any, idDetalleMem: any):Observable<any>{
    const params = new HttpParams().set('consultClienteId', idCli).set('consultMemId', idMem).set('detalleMemId',idDetalleMem);

    return this.clienteHttp.get(this.URLServices, { params });
  }

  histoClienteMemb(id:any):Observable<any>{
    return this.clienteHttp.get(this.URLServices+"?histoCliente="+id);
  }

  actualizaDatosCliente(data: any): Observable<any> {
    return this.clienteHttp.post<msgResult>(this.URLServices+"?updatePersonalData", data, { headers: this.httpHeaders });
  }
}