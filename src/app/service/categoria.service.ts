import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject  } from 'rxjs';
import { proveedor } from '../models/proveedor';
import { Categorias } from '../models/categorias';
import { tap } from 'rxjs/operators';
import { ConnectivityService } from './connectivity.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  isConnected: boolean = true;
  //API: string = 'https://olympus.arvispace.com/olimpusGym/conf/'

  APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  APIv3: string = 'http://localhost/olimpusGym/conf/';
  API: String = '';

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
  agregarSubCategoria(datosSubCategoria:any):Observable<any>{
    return this.clienteHttp.post(this.API+"categoria.php?insertarSubC=1",datosSubCategoria);
  }

  agregarCategoria(datosCategoria:any):Observable<any>{
    return this.clienteHttp.post(this.API+"categoria.php?insertar=1",datosCategoria);
  }

  agregarMarca(datosMarca:any):Observable<any>{
    return this.clienteHttp.post(this.API+"categoria.php?insertarMarca=1",datosMarca);
  }

  obtenerCategoria():Observable<any>{
    return this.clienteHttp.get(this.API+"categoria.php?consultarCategorias");
  }

  obtenerSubCategoria():Observable<any>{
    return this.clienteHttp.get(this.API+"categoria.php?consultarSubCategorias");
  }

  obtenerMarcas():Observable<any>{
    return this.clienteHttp.get(this.API+"categoria.php?consultarMarcas");
  }

  obtenerCategoriaPorNombre(nombre:string):Observable<any>{
    return this.clienteHttp.get(this.API+"categoria.php?categoriaName="+nombre);
  }

  obtenerSubCategoriaPorNombre(nombre:string, id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"categoria.php?SubcategoriaName="+nombre+"&id="+id);
  }

  obtenerMarcaPorNombre(nombre:string):Observable<any>{
    return this.clienteHttp.get(this.API+"categoria.php?marcaName="+nombre);
  }  
}
