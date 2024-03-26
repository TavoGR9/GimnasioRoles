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

   
   //API2: string = 'http://localhost/plan/joinDetalleProducto.php'

    constructor(private clienteHttp:HttpClient) {}
  
    creaProducto(datosFormulario: any): Observable<any> {
      return this.clienteHttp.post(this.APIP + '?insertar', datosFormulario).pipe(
        catchError(error => {
          // Manejar el error aquí
          console.error('Error al enviar la solicitud:', error);
          // Puedes lanzar el error nuevamente o devolver un valor predeterminado
          return throwError(error); // Lanzar el error nuevamente para que el componente pueda manejarlo
          // return of({ success: false }); // Devolver un valor predeterminado
        })
      );
    }

    consultarProductoId(id:any):Observable<any[]>{
      return this.clienteHttp.get<any[]>(this.API+"?listaProductoGym="+id)
      .pipe(
        tap((nuevosProductos: any[]) => {
          this.productoSubject.next(nuevosProductos);
        })
      );
    }

    getCategoriasSubject() {
      return this.productoSubject.asObservable();
    }

    actualizarProducto(id: any, datosP: any): Observable<any> {
      const url = `${this.API}?actualizar=${id}`;
      return this.clienteHttp.post(url, datosP);
    }

    obternerProductos(id:any):Observable<any>{
      return this.clienteHttp.get(this.API+"?listaProductosRecepcion="+id);
    }
  
    obternerInventario(id:any): Observable<any[]> {
      return this.clienteHttp.get<any[]>(this.API +'?listaInventario='+id);
    }

    obternerProducto(){
      return this.clienteHttp.get(this.API)
    }

    consultarProducto(id:any):Observable<any>{
      return this.clienteHttp.get(this.API+"?consultar="+id);
    }
  
    borrarProducto(id:any):Observable<any>{
      return this.clienteHttp.get(this.API+"?borrar="+id)
    }

    subirImagenes(imagenes: File[]): Observable<any> {
      const formData: FormData = new FormData();
      // !es muy importante que el nombre tenga llaves files[] , de lo contrario php no lo reconoce
      for (let i = 0; i < imagenes.length; i++) {
        formData.append('files[]', imagenes[i]);
      }
      // Imprime el contenido de formData en la consola
      console.log('Datos de las imagenes tipo formData:');
      formData.forEach((value, key) => {
        console.log(key, value);
      });
      return this.clienteHttp.post(this.API + '?subirImagenes', formData);
    }
  
    getProductosAdmin(): Observable<any[]> {
      return this.clienteHttp.get<any[]>(this.API + '?listaProductosAdmin');
    }
  
    inventarioGlobal(): Observable<any> {
      return this.clienteHttp.get(this.API + '?inventarioGlobal');
    }
  
    getProductosSeleccionados() {
      return this.productoSubject.asObservable();
    }
  
    setProductosSeleccionados(productos: Producto[]) {
       // Crear una copia de la lista
      this.productoSubject.next([...productos]);
    }
  
    clearProductosSeleccionados() {
      this.productoSubject.next([]);
    }

    borrarProductoInventario(idInv: any, usuaId: any): Observable<any>{
      const params = new HttpParams().set('invenID',idInv).set('userID',usuaId);
      return this.clienteHttp.get(this.API, {params});
    }

    updateProductoStatus(id: number, estado: { estatus: number }): Observable<any> {
      console.log("status",estado,"id",id);
      return this.clienteHttp.post(this.API+"?actualizarEstatus="+id,estado);;
    }

    consultarProductosJ(idProducto: number | null): Observable<any[]> {
      const url = `${this.API2}?idProducto=${idProducto}`;
      return this.clienteHttp.get<any[]>(url);
    }

    consultarProductos(idProducto: number | null): Observable<any[]> {
      const url = `${this.API4}?idProducto=${idProducto}`;
      return this.clienteHttp.get<any[]>(url);
    }

    consultarsabores(idGym:any):Observable<any>{
      return this.clienteHttp.get(this.API+"?consultarSabores="+idGym);
    }

}
