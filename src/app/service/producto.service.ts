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

   API2: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/administrador/joinDetalleProducto.php';
   API: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/administrador/productoSucursal.php';
   API4: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/administrador/ventaProductos.php';
   APIP: string = 'http://localhost/plan/producto_bod.php';

    constructor(private clienteHttp:HttpClient) {
    }
    creaProducto(datosFormulario: any): Observable<any> {
      return this.clienteHttp.post(this.APIP + '?insertar', datosFormulario).pipe(
        catchError(error => {
          console.error('Error al enviar la solicitud:', error);
          return throwError(error);
        })
      );
    }

    consultarProductoId(id: any): Observable<any[]> {
      const data = { id_bodega_param: id }; // Crear el objeto de datos a enviar
      return this.clienteHttp.post<any[]>(this.APIP + "?consultarProductoBodega", data)
        .pipe(
          tap((nuevosProductos: any[]) => {
            this.productoSubject.next(nuevosProductos);
          })
        );
    }
    
    actualizarProducto(datosP: any): Observable<any> {
      const url = `${this.APIP}?actualizarP`;
      return this.clienteHttp.post(url, datosP);
    }

    obternerProductos(id:any):Observable<any>{
      const data = { id_bodega_param: id };
      return this.clienteHttp.post(this.APIP+"?consultarProductoBodega=",data);
    }
  
    obternerInventario(id:any): Observable<any[]> {
      const data = { id_bodega_param: id };
      return this.clienteHttp.post<any[]>(this.APIP +'?listaInventario=',data);
    }
  
    updateProductoStatus(id: number, estado: { estatus: number }): Observable<any> {
      return this.clienteHttp.post(this.API+"?actualizarEstatus="+id,estado);;
    }

    consultarProductosJ(idProducto: number | null): Observable<any[]> {
      const url = `${this.APIP}?consultarProductoId`;
      return this.clienteHttp.post<any[]>(url, { id_pro_param: idProducto });
    }

    obtenerListaProduct(dateInicio: any, dateFin: any, idGym: any): Observable<any> {
      const url = `${this.APIP}?consultarVentasPorFecha`;
      const body = { gimnasioId: idGym, fechaInicioParam: dateInicio, fechaFinParam: dateFin };
      return this.clienteHttp.post(url, body);
    }
    
}
