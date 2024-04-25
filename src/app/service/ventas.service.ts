import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ventas } from '../models/ventas';
import { ConnectivityService } from './connectivity.service';

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  isConnected: boolean = true;

  // APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  // APIv3: string = 'http://localhost/olimpusGym/conf/';
  // API: String = '';

  API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  
  constructor(private clienteHttp:HttpClient, private connectivityService: ConnectivityService) {
  }

  // comprobar(){
  //   this.connectivityService.checkInternetConnectivity().subscribe((isConnected: boolean) => {
  //     this.isConnected = isConnected;
  //     if (isConnected) {
  //       //console.log("La red WiFi tiene acceso a Internet.");
  //       this.API = this.APIv2;
  //     } else {
  //       //console.log("La red WiFi no tiene acceso a Internet.");
  //       this.API = this.APIv3;
  //     }
  //   });
  // }
  
  obternerVentas(){
    return this.clienteHttp.get(this.API+"venta_detalleVenta.php")
  }

  agregarVentas(Ventas: Ventas):Observable<any>{
    return this.clienteHttp.post(this.API+"venta_detalleVenta.php?insertarVentas=1", Ventas);
  }

  consultarVentas(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"venta_detalleVenta.php?consultar="+id);
  }

}
