import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

   API2: string =  'https://olympus.arvispace.com/panelAdmin/conf/joinDetalleProducto.php';
   API: string ='https://olympus.arvispace.com/puntoDeVenta/conf/productoSucursal.php';
   //API2: string = 'http://localhost/plan/joinDetalleProducto.php'


    constructor(private clienteHttp:HttpClient) {
    }
  
    consultarProductosJ(idProducto: number | null): Observable<any[]> {
      const url = `${this.API2}?idProducto=${idProducto}`;
      return this.clienteHttp.get<any[]>(url);
    }
  
    actualizarProducto(id: any, datosP: any): Observable<any> {
      const url = `${this.API}?actualizar=${id}`;
      return this.clienteHttp.post(url, datosP);
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
  

    consultarProductoId(id:any):Observable<any>{
      return this.clienteHttp.get(this.API+"?listaProductoGym="+id);
    }
    
    creaProducto(datosFormulario: any): Observable<any> {
      console.log("los datos", datosFormulario);
      console.error(datosFormulario.error);
      return this.clienteHttp.post(this.API+'?creaProducto',datosFormulario);
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
}
