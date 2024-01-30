import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EntradaProducto } from '../models/entradas';
import { ListaProductos } from '../models/listaProductos';

@Injectable({
  providedIn: 'root',
})
export class EntradasService {
  API: string = 'https://olympus.arvispace.com/puntoDeVenta/conf/entradas.php';
  constructor(private clienteHttp: HttpClient) {}

  /**
   * Metodo para insertar una entrada de producto
   * @param datosEntradaProducto datos del modelo
   * @returns un observable de tipo any
   */


  agregarEntradaProducto(entradaProductos:any):Observable<any>{
    console.log("entradaProductos", entradaProductos);
    return this.clienteHttp.post(this.API+"?registraEntrada",entradaProductos);
  }
  
  listaProductos(): Observable<ListaProductos> {
    return this.clienteHttp.get<ListaProductos>(this.API + '?listaProductos');
  }

}
