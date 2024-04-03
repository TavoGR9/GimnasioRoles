import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Producto } from '../models/producto';
import { HttpParams } from '@angular/common/http';
import { tap, catchError} from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
  private productoSubject = new BehaviorSubject<any[]>([]);

   APIP: string = 'http://localhost/plan/';

    constructor(private clienteHttp:HttpClient) {
    }

    creaProducto(datosFormulario: any): Observable<any> {
      return this.clienteHttp.post(this.APIP + 'producto_bod.php?insertar', datosFormulario).pipe(
        catchError(error => {
          console.error('Error al enviar la solicitud:', error);
          return throwError(error);
        })
      );
    }

    consultarProductoId(id: any): Observable<any[]> {
      const data = { id_bodega_param: id }; // Crear el objeto de datos a enviar
      return this.clienteHttp.post<any[]>(this.APIP + "producto_bod.php?consultarProductoBodega", data)
        .pipe(
          tap((nuevosProductos: any[]) => {
            this.productoSubject.next(nuevosProductos);
          })
        );
    }
    
    actualizarProducto(datosP: any): Observable<any> {
      const url = `${this.APIP}producto_bod.php?actualizarP`;
      return this.clienteHttp.post(url, datosP);
    }

    obternerProductos(id:any):Observable<any>{
      const data = { id_bodega_param: id };
      return this.clienteHttp.post(this.APIP+"producto_bod.php?consultarProductoBodega=",data);
    }
  
    obternerInventario(id:any): Observable<any[]> {
      const data = { id_bodega_param: id };
      return this.clienteHttp.post<any[]>(this.APIP +'producto_bod.php?listaInventario=',data);
    }
  
    updateProductoStatus(id: number, estado: { estatus: number }): Observable<any> {
      return this.clienteHttp.post(this.APIP+"?actualizarEstatus="+id,estado);;
    }

    consultarProductosJ(idProducto: number | null): Observable<any[]> {
      const url = `${this.APIP}producto_bod.php?consultarProductoId`;
      return this.clienteHttp.post<any[]>(url, { id_pro_param: idProducto });
    }

    obtenerListaProduct(dateInicio: any, dateFin: any, idGym: any): Observable<any> {
      const url = `${this.APIP}producto_bod.php?consultarVentasPorFecha`;
      const body = { gimnasioId: idGym, fechaInicioParam: dateInicio, fechaFinParam: dateFin };
      return this.clienteHttp.post(url, body);
    }
    
}
