
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from '../models/Cliente';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  //Servicio para el registro y actualizaciones del cliente.

  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
  URLServices: String = "https://olympus.arvispace.com/gimnasioRoles/configuracion/recepcion/registros.php"; 
  URL: string = "https://olympus.arvispace.com/gimnasioRoles/configuracion/recepcion/formaPago.php/";
  apiFoto: string = "https://olympus.arvispace.com/gimnasioRoles/configuracion/recepcion/update_image.php";

  constructor(private clienteHttp:HttpClient) {
  }
  private dataSubject = new BehaviorSubject<any>(null);
  data$ = this.dataSubject.asObservable();

  guardarCliente(data: any): Observable<any> {
    return this.clienteHttp.post<any>(this.URLServices+"?insertar=1", data);
  }

  updatePhoto(archivo: any): Observable<any> {
    return this.clienteHttp.post<any>(this.apiFoto, archivo);
  }

  idPagoSucursal(id:any):Observable<any>{
    return this.clienteHttp.get(this.URL+"?consuProcAlmac="+id);
  }

  consultarDataPago(id:any):Observable<any>{
    return this.clienteHttp.get(this.URL+"?consultar="+id);
  }

  sendData(data: any) {
    this.dataSubject.next(data);
  }
  
  //validaciones correo
  consultarEmail(id:any):Observable<any>{
    return this.clienteHttp.get(this.URLServices+"?consultar="+id);
  }

  credenciales(data:string, password:string){
    let headers: any = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    let parameters = 'data=' + data + '&password=' + password;
    return this.clienteHttp.post(this.URLServices + 'login.php', parameters, { headers });
  }
}

