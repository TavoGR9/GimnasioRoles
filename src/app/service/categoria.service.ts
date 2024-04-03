import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject  } from 'rxjs';
import { proveedor } from '../models/proveedor';
import { Categorias } from '../models/categorias';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  API2: string = 'https://olympus.arvispace.com/olimpusGym/conf/'

  constructor(private clienteHttp:HttpClient) {
  }

  agregarSubCategoria(datosSubCategoria:any):Observable<any>{
    return this.clienteHttp.post(this.API2+"categoria.php?insertarSubC=1",datosSubCategoria);
  }

  agregarCategoria(datosCategoria:any):Observable<any>{
    return this.clienteHttp.post(this.API2+"categoria.php?insertar=1",datosCategoria);
  }

  agregarMarca(datosMarca:any):Observable<any>{
    return this.clienteHttp.post(this.API2+"categoria.php?insertarMarca=1",datosMarca);
  }

  obtenerCategoria():Observable<any>{
    return this.clienteHttp.get(this.API2+"categoria.php?consultarCategorias");
  }

  obtenerSubCategoria():Observable<any>{
    return this.clienteHttp.get(this.API2+"categoria.php?consultarSubCategorias");
  }

  obtenerMarcas():Observable<any>{
    return this.clienteHttp.get(this.API2+"categoria.php?consultarMarcas");
  }

  obtenerCategoriaPorNombre(nombre:string):Observable<any>{
    return this.clienteHttp.get(this.API2+"categoria.php?categoriaName="+nombre);
  }

  obtenerSubCategoriaPorNombre(nombre:string, id:any):Observable<any>{
    return this.clienteHttp.get(this.API2+"categoria.php?SubcategoriaName="+nombre+"&id="+id);
  }

  obtenerMarcaPorNombre(nombre:string):Observable<any>{
    return this.clienteHttp.get(this.API2+"categoria.php?marcaName="+nombre);
  }  
}
