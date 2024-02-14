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

  private categoriasSubject = new BehaviorSubject<any[]>([]);

  API: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/administrador/categoria.php'
  constructor(private clienteHttp:HttpClient) {
  }

  //categoriaActualizada: EventEmitter<void> = new EventEmitter<void>();

  agregarCategoria(datosCategoria:proveedor):Observable<any>{
    return this.clienteHttp.post(this.API+"?insertar=1",datosCategoria);
  }

  obternerCategoria(){
    return this.clienteHttp.get(this.API)
  }

  obternerCategorias(): Observable<Categorias[]>{
    return this.clienteHttp.get<Categorias[]>(this.API)
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
