


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EntradaProducto } from '../models/entradas';
import { ListaProductos } from '../models/listaProductos';
import { ConnectivityService } from './connectivity.service';
import { IndexedDBService } from './indexed-db.service';
import { catchError, tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class EntradasService {
  isConnected: boolean = true;

  // APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  // APIv3: string = 'http://localhost/olimpusGym/conf/';
  // API: String = '';

  API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  
  constructor(private clienteHttp: HttpClient, private connectivityService: ConnectivityService, private indexedDBService: IndexedDBService) {}

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
    return this.clienteHttp.post(this.API+"producto_bod.php?existencias",data);
  }

  actualizarProducto(data:any):Observable<any>{
    return this.clienteHttp.post(this.API+"producto_bod.php?updateBodegaProducto1Histo",data);
  }

 /* actualizarProducto(data:any):Observable<any>{
    return this.clienteHttp.post(this.API+"producto_bod.php?updateBodegaProducto1",data);
  }*/

  listaProductos(): Observable<any> {
    return this.clienteHttp.get<any>(this.API+'producto_bod.php?getProBodPre').pipe(
      tap(dataResponse => {
        this.saveDataToIndexedDB(dataResponse);
        
      }),
      catchError(error => {
        return this.getEntradasDatos();
      })
    );
  }

  private saveDataToIndexedDB(data: any) {
    // Guarda los datos en IndexedDB
    this.indexedDBService.saveEntradasData('Entradas', data);
  }
  
  getEntradasDatos() {
    return new Observable(observer => {
      this.indexedDBService.getEntradasData('Entradas').then(data => {
        if (data && data.length > 0) {
          let maxId = -1;
          let lastData: any;
          data.forEach((record: any) => {
            if (record.id > maxId) {
              maxId = record.id;
              lastData = record.data;
            }
          });
          observer.next(lastData); // Emitir el último dato encontrado
        } else {
          observer.next(null); // Emitir null si no hay datos en IndexedDB
        }
        observer.complete();
      }).catch(error => {
        observer.error(error); // Emite un error si no se pueden obtener los datos de IndexedDB
      });
    });
  }
  

  insertarHistorial(data:any): Observable<any>{
    return this.clienteHttp.post<any>(this.API+'producto_bod.php?addHistorialInventario',data);
  }

}
