


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EntradaProducto } from '../models/entradas';
import { ListaProductos } from '../models/listaProductos';

@Injectable({
  providedIn: 'root',
})
export class EntradasService {
  //Servicio que sirve para dar entrada a productos
  //API: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/administrador/entradas.php';
  API: string = 'http://localhost/plan/producto_bod.php';
  constructor(private clienteHttp: HttpClient) {}

  agregarEntradaProducto(entradaProductos:any):Observable<any>{
    console.log("entradaProductos", entradaProductos);
    return this.clienteHttp.post(this.API+"?insertarBodegaPro",entradaProductos);
  }
  
  listaProductos(): Observable<any> {
    return this.clienteHttp.get<any>(this.API + '?getProBodPre');
  }

}
