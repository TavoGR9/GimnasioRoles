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
  //API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  // API: string ='http://localhost/serviciosGym/';
  API: string = 'http://localhost/gimnasioServicios/'

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



    // obternerProductos(id:any):Observable<any>{
    //   const data = { id_bodega_param: id };
    //   return this.clienteHttp.post(this.API+"producto_bod.php?consultarProductoBodega=",data);
    // }

    // Aqui obtengo el id de la bodega en un json
    obternerProductos(id:any):Observable<any>{
      const data = { id_bodega_param: id };
      return this.clienteHttp.post(this.API+"producto_bod.php?consultarProductoIDBodega=",data);
    }

    obternerProductosV(id:any):Observable<any>{
      const data = { id_bodega_param: id };
      return this.clienteHttp.post(this.API+"producto_bod.php?consultarProductoBodegaVenta=",data);
    }




    obternerInventario(id:any): Observable<any[]> {
      const data = { id_bodega_param: id };
      return this.clienteHttp.post<any[]>(this.API +'getProductosBodega.php',data).pipe(
        tap((dataResponse: any[])=> {
          this.saveDataToIndexedDB3(dataResponse);
        }),
        catchError(error => {
          return this.getServiceDatos3();
        })
      ) as Observable<any[]>;
    }

    // listaProductos(): Observable<any> {
    //   return this.clienteHttp.get<any>(this.API+'getProBod.php?getProBodPre');
    // }


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



    deleteProd(idP: any): Observable<any> {
      const data ={id_producto: idP}
      return this.clienteHttp.post(this.API+"deleteProducto.php", data);
    }


    //Metodo utilizado para consultar productos(membresias) de un gimnasio
    consultarAllProducto(id: any): Observable<any[]> {
      const data = { id_pro_param: id };
      return this.clienteHttp.post<any[]>(this.API + "producto_bod.php?getAllProductosMemb", data)
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

    // REEMPLAZAR MEMBRESIAS POR PRODUCTOS
    // lista de productos(membresias) y productos de un gimnasio
    consultarAllProductoB(id: string | number): Observable<any> {
      return this.clienteHttp.get(this.API + "getProductosMembBodega.php?id_bodega="+id);
    }

    // crear producto(membresia) y poducto
    creaProductoMemb(datosFormulario: any): Observable<any> {
      return this.clienteHttp.post(this.API + 'insertarProductoMemb.php?insertarProductoMemb', datosFormulario).pipe(
        catchError(error => {
          console.error('Error al enviar la solicitud:', error);
          return throwError(error);
        })
      );
    }

    // actualiza el producto en caso de ser necesario en el componente crearProducto
    actualizarProducto2(datosP: any): Observable<any> {
      const url = `${this.API}updateProbod.php?actualizarP`;
      // console.log('datos: ', datosP);

      return this.clienteHttp.post(url, datosP).pipe(
        tap(dataResponse => {
          // console.log('que manda: ', dataResponse);
        }),
        catchError(error => {
          console.log(error);
          return error;
       })
      );
    }

    // ver producto por codigo de barras
    verProductoCodigoBarras2(codigo: any) {
      const data = { codigo: codigo };
      return this.clienteHttp.post<any[]>(this.API + "getProductoCodigoBarras.php?consultarProductoPorCodigo", data);

    }

    //EXISTENCIAS (LISTA INVENTARIO)
    // obtenerInventarioLista(id:any): Observable<any[]> {
    //   const data = { id_bodega_param: id };
    //   return this.clienteHttp.post<any[]>(this.API +'obtenerExistencias.php?listaExistencia=',data).pipe(
    //     tap((dataResponse: any[])=> {
    //       this.saveDataToIndexedDB3(dataResponse);
    //     }),
    //     catchError(error => {
    //       return this.getServiceDatos3();
    //     })
    //   ) as Observable<any[]>;
    // }

    //PARA PEDIDOS (obtener los productos de la bodega)
    obternerProductosV2(id:any):Observable<any>{
      const data = { id_bodega_param: id };
      return this.clienteHttp.post(this.API+"obtenerProductoPuntoVenta.php?consultarProductoBodegaVenta=",data);
    }

    //ENTRADAS
    // llamada HTTP a la API REST, para obtener los productos por idProbob y id_bodega
    consultarProductosId(idProducto: number | null, idBodega: number | null): Observable<any[]> {
      const url = `${this.API}obtenerProductosPorId.php?consultarProductoId`;
      return this.clienteHttp.post<any[]>(url, { id_pro_param: idProducto, id_bodega: idBodega });
    }


  //   //Agregar entradas desde la creacion de membresias
  //    // Método para guardar los registros adicionales
  //    enviarDatosRegistro(datos: any): Observable<any> {
  //   return this.clienteHttp.post<any>(`${this.API}guardarRegistros.php`, datos);
  // }

}
