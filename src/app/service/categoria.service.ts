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

  //Servicio para obtener y manipular valores de las categorias
  private categoriasSubject = new BehaviorSubject<any[]>([]);

  API: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/administrador/categoria.php'
  API2: string = 'http://localhost/plan/categoria.php'

  constructor(private clienteHttp:HttpClient) {
  }

  agregarSubCategoria(datosSubCategoria:any):Observable<any>{
    return this.clienteHttp.post(this.API2+"?insertarSubC=1",datosSubCategoria);
  }

  agregarCategoria(datosCategoria:any):Observable<any>{
    return this.clienteHttp.post(this.API2+"?insertar=1",datosCategoria);
  }

  agregarMarca(datosMarca:any):Observable<any>{
    return this.clienteHttp.post(this.API2+"?insertarMarca=1",datosMarca);
  }

  obtenerCategoria():Observable<any>{
    return this.clienteHttp.get(this.API2+"?consultarCategorias");
  }

  obtenerSubCategoria():Observable<any>{
    return this.clienteHttp.get(this.API2+"?consultarSubCategorias");
  }

  obtenerMarcas():Observable<any>{
    return this.clienteHttp.get(this.API2+"?consultarMarcas");
  }

  obtenerCategoriaPorNombre(nombre:string):Observable<any>{
    return this.clienteHttp.get(this.API2+"?categoriaName="+nombre);
  }

  obtenerSubCategoriaPorNombre(nombre:string, id:any):Observable<any>{
    console.log(nombre, id);
    console.log(this.API2+"?SubcategoriaName="+nombre+"&id"+id, "url");
    return this.clienteHttp.get(this.API2+"?SubcategoriaName="+nombre+"&id="+id);
  }

  obtenerMarcaPorNombre(nombre:string):Observable<any>{
    return this.clienteHttp.get(this.API2+"?marcaName="+nombre);
  }

  obternerCategoria(){
    return this.clienteHttp.get(this.API)
  }

  consultarCategoria(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"?consultar="+id);
  }
  
  borrarCategoria(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"?borrar="+id)
  }

  actualizarCategoria(id:any,datosCategoria:any):Observable<any>{
    return this.clienteHttp.post(this.API+"?actualizar="+id,datosCategoria);
  }  

  updateMembresiaStatus(id: number, estado: { estatus: number }): Observable<any> {
    return this.clienteHttp.post(this.API+"?actualizarEstatus="+id,estado);;
  }

  consultarCategoriaGym(id: any): Observable<any[]> {
    return this.clienteHttp.get<any[]>(this.API + "?consultarGym=" + id)
      .pipe(
        tap((nuevasCategorias: any[]) => {
          this.categoriasSubject.next(nuevasCategorias);
        })
      );
  }

  getCategoriasSubject() {
    return this.categoriasSubject.asObservable();
  }

  consultarListaCategoria(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"?consultarCategoriaId="+id); 
  }
}
