import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Producto } from '../models/producto';
import { HttpParams } from '@angular/common/http';
import { tap, catchError} from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ConnectivityService } from './connectivity.service';
@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
  private productoSubject = new BehaviorSubject<any[]>([]);

  isConnected: boolean = true;

  APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  APIv3: string = 'http://localhost/olimpusGym/conf/';
  API: String = '';
   //API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';

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

    creaProducto(datosFormulario: any): Observable<any> {
      return this.clienteHttp.post(this.API + 'producto_bod.php?insertar', datosFormulario).pipe(
        catchError(error => {
          console.error('Error al enviar la solicitud:', error);
          return throwError(error);
        })
      );
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
    
    actualizarProducto(datosP: any): Observable<any> {
      const url = `${this.API}producto_bod.php?actualizarP`;
      return this.clienteHttp.post(url, datosP);
    }

    obternerProductos(id:any):Observable<any>{
      const data = { id_bodega_param: id };
      return this.clienteHttp.post(this.API+"producto_bod.php?consultarProductoBodega=",data);
    }
  
    obternerInventario(id:any): Observable<any[]> {
      const data = { id_bodega_param: id };
      return this.clienteHttp.post<any[]>(this.API +'producto_bod.php?listaInventario=',data);
    }
  
    updateProductoStatus(id: number, estado: { estatus: number }): Observable<any> {
      return this.clienteHttp.post(this.API+"?actualizarEstatus="+id,estado);;
    }

    consultarProductosJ(idProducto: number | null): Observable<any[]> {
      const url = `${this.API}producto_bod.php?consultarProductoId`;
      return this.clienteHttp.post<any[]>(url, { id_pro_param: idProducto });
    }

    obtenerListaProduct(dateInicio: any, dateFin: any, idGym: any): Observable<any> {
      const url = `${this.API}producto_bod.php?consultarVentasPorFecha`;
      const body = { gimnasioId: idGym, fechaInicioParam: dateInicio, fechaFinParam: dateFin };
      return this.clienteHttp.post(url, body);
    }
    
}
