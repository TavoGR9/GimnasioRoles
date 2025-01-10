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

  //API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  API: string ='http://localhost/serviciosGym/';



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

   //ENTRADAS
  // llamada HTTP a la API REST, para insertar una entrada e insertar al historial
  agregarEntradaProducto(entradaProductos:any):Observable<any>{
    return this.clienteHttp.post(this.API+"insertarBodegaProHisto.php?insertarBodegaProHisto",entradaProductos);
  }

  obtenerCompras(inicioDate: any, finDate: any, idGym: any): Observable<any> {
    const params = {
      GYMid: idGym,
      fechaInicio: inicioDate,
      fechaFin: finDate
    };
    return this.clienteHttp.get(this.API + 'producto_bod.php?', { params });
  }

  //ENTRADAS
  // llamada HTTP a la API REST, para obtener las entradas por idGym y rango de fechas
  obtenerEntradas(inicioDate: any, finDate: any, idGym: any): Observable<any>{
    const params = {
      GYMid: idGym,
      fechaInicio: inicioDate,
      fechaFin: finDate
    };
    return this.clienteHttp.get(this.API+'obtenerEntradas.php', { params });
  }

 /* agregarEntradaProducto(entradaProductos:any):Observable<any>{
    return this.clienteHttp.post(this.API+"producto_bod.php?insertarBodegaPro",entradaProductos);
  }*/

  //ENTRADAS
  // llamada HTTP a la API REST, para verificar un producto
  verficarProducto(id_bodega: any, id_producto:any):Observable<any>{
    const data = {
      p_id_bodega: id_bodega,
      p_id_producto: id_producto
    }
    return this.clienteHttp.post(this.API+"ObtenerProductoPorBodegaYID.php?ObtenerProductoPorBodegaYID",data);
  }

  existencias(id_bodega: any,id_producto: any):Observable<any>{
    const data = {
      p_id_bodega: id_bodega,
      p_id_producto: id_producto
    }
    return this.clienteHttp.post(this.API+"producto_bod.php?existencias",data);
  }

  //ENTRADAS
  // llamada HTTP a la API REST, para actualizar una entrada e insertar al historial
  actualizarProducto(data:any):Observable<any>{
    return this.clienteHttp.post(this.API+"updateBodegaProducto1Histo.php?updateBodegaProducto1Histo",data);
  }

  actualizarProductoVDos(data:any):Observable<any>{
    return this.clienteHttp.post(this.API+"producto_bod.php?updateBodegaProducto1HistoDialog",data);
  }


 /* actualizarProducto(data:any):Observable<any>{
    return this.clienteHttp.post(this.API+"producto_bod.php?updateBodegaProducto1",data);
  }*/


  //ENTRADAS
  // llamada HTTP a la API REST, para obtener todos los productos
  listaProductos(): Observable<any> {
    return this.clienteHttp.get<any>(this.API+'getProBod.php?getProBodPre').pipe(
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


  // Actualización de Producto (membresia) y inserción a Historial nueva BD
  actualizarProductoEInsertarHistorial(data:any):Observable<any>{
    return this.clienteHttp.post(this.API+"updateBodegaProbodAddHistorial.php?updateBodegaProductoHistorial",data);
  }

}
