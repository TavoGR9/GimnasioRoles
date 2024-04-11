import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,forkJoin } from 'rxjs';
import { detalleVenta } from '../models/detalleVenta';
import { ConnectivityService } from './connectivity.service';

@Injectable({
  providedIn: 'root'
})
export class DetalleVentaService {

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
        //console.log("La red WiFi tiene acceso a Internet.");
        this.API = this.APIv2;
      } else {
        //console.log("La red WiFi no tiene acceso a Internet.");
        this.API = this.APIv3;
      }
    });
  }

  obternerVentaDetalle(){
    return this.clienteHttp.get(this.API+"venta_detalleVenta.php")
  }

  agregarVentaDetalle(datosVentaDetalle: detalleVenta[]): Observable<any> {
    return forkJoin(
      datosVentaDetalle.map((detalle: detalleVenta) =>
        this.clienteHttp.post(this.API + 'venta_detalleVenta.php?insertar=1', detalle)
      )
    );
  }
  
  consultarVentaDetalle(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"venta_detalleVenta.php?consultar="+id);
  }

}
