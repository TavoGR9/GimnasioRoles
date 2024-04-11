


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EntradaProducto } from '../models/entradas';
import { ListaProductos } from '../models/listaProductos';
import { ConnectivityService } from './connectivity.service';
@Injectable({
  providedIn: 'root',
})
export class EntradasService {
  isConnected: boolean = true;

  APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  APIv3: string = 'http://localhost/olimpusGym/conf/';
  API: String = '';

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

  agregarEntradaProducto(entradaProductos:any):Observable<any>{
    console.log("entradaProductos", entradaProductos);
    return this.clienteHttp.post(this.API+"producto_bod.php?insertarBodegaPro",entradaProductos);
  }
  
  listaProductos(): Observable<any> {
    return this.clienteHttp.get<any>(this.API+'producto_bod.php?getProBodPre');
  }

}
