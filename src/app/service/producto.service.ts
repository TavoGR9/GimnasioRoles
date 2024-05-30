import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {  HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Producto } from '../models/producto';
import { HttpParams } from '@angular/common/http';
import { tap, catchError} from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ConnectivityService } from './connectivity.service';
import { IndexedDBService } from './indexed-db.service';
@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
  private productoSubject = new BehaviorSubject<any[]>([]);

  isConnected: boolean = true;

  // APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  // APIv3: string = 'http://localhost/olimpusGym/conf/';
  // API: String = '';
  API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';

    constructor(private clienteHttp:HttpClient, private connectivityService: ConnectivityService, private indexedDBService: IndexedDBService) {
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

    creaProducto(datosFormulario: any): Observable<any> {
      return this.clienteHttp.post(this.API + 'producto_bod.php?insertar', datosFormulario).pipe(
        catchError(error => {
          console.error('Error al enviar la solicitud:', error);
          return throwError(error);
        })
      );
    }

    verProductoCodigoBarras(codigo: any) {
      const data = { codigo: codigo };
      return this.clienteHttp.post<any[]>(this.API + "producto_bod.php?consultarProductoPorCodigo", data);

    }

    consultarProductoId(id: any): Observable<any[]> {
      const data = { id_bodega_param: id }; // Crear el objeto de datos a enviar
      return this.clienteHttp.post<any[]>(this.API + "producto_bod.php?consultarProductoBodega", data)
        .pipe(
          tap((nuevosProductos: any[]) => {
            this.productoSubject.next(nuevosProductos);
          })
        );
    }

    consultarAllProducto(id: any): Observable<any[]> {
      const data = { id_pro_param: id };
      return this.clienteHttp.post<any[]>(this.API + "producto_bod.php?getAllProductos", data)
        .pipe(
          tap((nuevosProductos: any[]) => {
            this.productoSubject.next(nuevosProductos);
            this.saveDataToIndexedDB(nuevosProductos);
          }),
          catchError(error => {
            return this.getServiceDatos2();
          })
        ) as Observable<any[]>; // Añadir una conversión de tipo
    }
      

    private saveDataToIndexedDB(data: any) {
      // Guarda los datos en IndexedDB
      this.indexedDBService.saveProductosData('Productos', data);
    }
    
    getServiceDatos2() {
      return new Observable(observer => {
        this.indexedDBService.getProductosData('Productos').then(data => {
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
    
    actualizarProducto(datosP: any): Observable<any> {
      const url = `${this.API}producto_bod.php?actualizarP`;
      return this.clienteHttp.post(url, datosP).pipe(
        tap(dataResponse => {
        }),
        catchError(error => {
          console.log(error);
          return error;
       })
      );
    }

   
  

    obternerProductos(id:any):Observable<any>{
      const data = { id_bodega_param: id };
      return this.clienteHttp.post(this.API+"producto_bod.php?consultarProductoBodega=",data);
    }

    obternerProductosV(id:any):Observable<any>{
      const data = { id_bodega_param: id };
      return this.clienteHttp.post(this.API+"producto_bod.php?consultarProductoBodegaVenta=",data);
    }
  
    obternerInventario(id:any): Observable<any[]> {
      const data = { id_bodega_param: id };
      return this.clienteHttp.post<any[]>(this.API +'producto_bod.php?listaInventario=',data).pipe(
        tap((dataResponse: any[])=> {
          this.saveDataToIndexedDB3(dataResponse);
        }),
        catchError(error => {
          return this.getServiceDatos3();
        })
      ) as Observable<any[]>; 
    }
  
    private saveDataToIndexedDB3(data: any) {
      // Guarda los datos en IndexedDB
      this.indexedDBService.saveInventarioData('Inventario', data);
    }
    
    getServiceDatos3() {
      return new Observable(observer => {
        this.indexedDBService.getInventarioData('Inventario').then(data => {
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
    updateProductoStatus(id: number, estado: { estatus: number }): Observable<any> {
      return this.clienteHttp.post(this.API+"?actualizarEstatus="+id,estado);;
    }

    consultarProductosJ(idProducto: number | null, idBodega: number | null): Observable<any[]> {
      const url = `${this.API}producto_bod.php?consultarProductoId`;
      return this.clienteHttp.post<any[]>(url, { id_pro_param: idProducto, id_bodega: idBodega });
    }
    


    obtenerListaProduct(dateInicio: any, dateFin: any, idGym: any): Observable<any> {
      const url = `${this.API}producto_bod.php?consultarVentasPorFecha`;
      const body = { gimnasioId: idGym, fechaInicioParam: dateInicio, fechaFinParam: dateFin };
      return this.clienteHttp.post(url, body).pipe(
        tap(dataResponse => {
          this.saveDataToIndexedDB2(dataResponse);
        }),
        catchError(error => {
          return this.getServiceDatos();
        })
      );
    }
  
    private saveDataToIndexedDB2(data: any) {
      // Guarda los datos en IndexedDB
      this.indexedDBService.saveProductosVendidosData('ProductosVendidos', data);
    }
    
    getServiceDatos() {
      return new Observable(observer => {
        this.indexedDBService.getProductosVendidosData('ProductosVendidos').then(data => {
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
    
}
