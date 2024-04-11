import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { gimnasio } from '../models/gimnasio';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ConnectivityService } from './connectivity.service';
@Injectable({
  providedIn: 'root'
})
export class GimnasioService {

  private gymSubject = new BehaviorSubject<any[]>([]);
  gimnasioSeleccionado = new BehaviorSubject<number>(0);
  botonEstado = new Subject<{respuesta: boolean, idGimnasio: any}>();
  optionSelected = new BehaviorSubject<number>(0);

  isConnected: boolean = true;
  //API: string = 'https://olympus.arvispace.com/olimpusGym/conf/'

  APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  APIv3: string = 'http://localhost/olimpusGym/conf/';
  API: String = '';

  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private clienteHttp: HttpClient, private connectivityService: ConnectivityService) {}

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

  obternerPlan(): Observable<any[]>{
    return this.clienteHttp.get<any[]>(this.API+"bodega.php?consultar");
  }

  getCategoriasSubject() {
    return this.gymSubject.asObservable();
  }

  agregarSucursal(datosGym: gimnasio):Observable<any>{
    return this.clienteHttp.post(this.API+"bodega.php?insertar", datosGym);
  }

  consultarArchivos(id: any):Observable<any>{
    return this.clienteHttp.get(this.API+"bodega.php?consultarArchivos="+id);
  }

  actualizarSucursal(datosGym: any):Observable<any>{
    console.log(datosGym, "datosGym");
    return this.clienteHttp.post(this.API+"bodega.php?actualizar", datosGym);
  }

  consultarPlan(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"bodega.php?consultarB="+id);
  }

  actualizarEstatus(idGimnasio: any, estatus: any): Observable<any> {
    let body = new URLSearchParams();
    body.set('idBodega', idGimnasio);
    body.set('estatus', estatus.toString());
    body.set('actualizarEstatus', '1');
    let options = {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    };
    return this.clienteHttp.post(this.API+"bodega.php", body.toString(), options);
  }

  getAllServices(): Observable<any> {
    return this.clienteHttp.get(this.API+"serviciosGym.php");
  }

  getServicesForId(id: any): Observable<any> {
    return this.clienteHttp.post(this.API+"serviciosGym.php", { id: id });
  }
}
