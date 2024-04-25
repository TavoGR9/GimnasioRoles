


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

  // APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  // APIv3: string = 'http://localhost/olimpusGym/conf/';
  // API: String = '';

  API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  
  constructor(private clienteHttp: HttpClient, private connectivityService: ConnectivityService) {}

  // comprobar(){
  //   this.connectivityService.checkInternetConnectivity().subscribe((isConnected: boolean) => {
  //     this.isConnected = isConnected;
  //     if (isConnected) {
  //       this.API = this.APIv2;
  //     } else {
  //       this.API = this.APIv3;
  //     }
  //   });
  // }

  agregarEntradaProducto(entradaProductos:any):Observable<any>{
    return this.clienteHttp.post(this.API+"producto_bod.php?insertarBodegaProHisto",entradaProductos);
  }

 /* agregarEntradaProducto(entradaProductos:any):Observable<any>{
    return this.clienteHttp.post(this.API+"producto_bod.php?insertarBodegaPro",entradaProductos);
  }*/
  
  verficarProducto(id_bodega: any, id_producto:any):Observable<any>{
    const data = {
      p_id_bodega: id_bodega,
      p_id_producto: id_producto
    }
    return this.clienteHttp.post(this.API+"producto_bod.php?ObtenerProductoPorBodegaYID",data);
  }

  existencias(id_bodega: any,id_producto: any):Observable<any>{
    const data = {
      p_id_bodega: id_bodega,
      p_id_producto: id_producto
    }
    console.log(data, "data");
    return this.clienteHttp.post(this.API+"producto_bod.php?existencias",data);
  }

  actualizarProducto(data:any):Observable<any>{
    return this.clienteHttp.post(this.API+"producto_bod.php?updateBodegaProducto1Histo",data);
  }

 /* actualizarProducto(data:any):Observable<any>{
    return this.clienteHttp.post(this.API+"producto_bod.php?updateBodegaProducto1",data);
  }*/

  listaProductos(): Observable<any> {
    return this.clienteHttp.get<any>(this.API+'producto_bod.php?getProBodPre');
  }

  insertarHistorial(data:any): Observable<any>{
    return this.clienteHttp.post<any>(this.API+'producto_bod.php?addHistorialInventario',data);
  }

}
