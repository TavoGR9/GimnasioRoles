


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EntradaProducto } from '../models/entradas';
import { ListaProductos } from '../models/listaProductos';

@Injectable({
  providedIn: 'root',
})
export class EntradasService {
  API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';

  constructor(private clienteHttp: HttpClient) {}

  agregarEntradaProducto(entradaProductos:any):Observable<any>{
    console.log("entradaProductos", entradaProductos);
    return this.clienteHttp.post(this.API+"producto_bod.php?insertarBodegaPro",entradaProductos);
  }
  
  listaProductos(): Observable<any> {
    return this.clienteHttp.get<any>(this.API+'producto_bod.php?getProBodPre');
  }

}
