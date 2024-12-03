import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject  } from 'rxjs';
import { ConnectivityService } from './connectivity.service';
import { tap } from 'rxjs/operators';
import { catchError, of } from 'rxjs';
import { IndexedDBService } from './indexed-db.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  isConnected: boolean = true;


  // APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  // APIv3: string = 'http://localhost/olimpusGym/conf/';
  // API: String = '';
  //API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  API: string = 'http://localhost/serviciosGimnasio/';
  API2: string = 'http://localhost/serviciosGym/';

  public confirmButton: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public seleccionado: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public idMarca: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor(private clienteHttp:HttpClient, private connectivityService: ConnectivityService,private indexedDBService:IndexedDBService) {
  }

  idGym = new BehaviorSubject<number>(0);

  // Método para actualizar el idGym
  setIdGym(idGym: number): void {
    this.idGym.next(idGym);
  }

  // comprobar(){
  //   this.connectivityService.checkInternetConnectivity().subscribe((isConnected: boolean) => {
  //     this.isConnected = isConnected;
  //     if (isConnected) {
  //       //console.log("La red WiFi tiene acceso a Internet.");
  //       this.API = this.APIv2;
  //     } else {
  //       //console.log("La red WiFi no tiene acceso a Internet.");
  //       this.API = this.APIv3;
  //     }
  //   });
  // }

  agregarSubCategoria(datosSubCategoria:any):Observable<any>{
    return this.clienteHttp.post(this.API+"categoria.php?insertarSubC=1",datosSubCategoria).pipe(
      tap(dataResponse => {
      }),
      catchError(error => {
        this.saveDataToIndexedDB(datosSubCategoria);
        const resultData = { success: '2' };
        return of(resultData);
      })
    );
  }

  private saveDataToIndexedDB(data: any) {
    // Guarda los datos en IndexedDB
    this.indexedDBService.saveAgregarCategoriaData('AgregarCategoria', data);
  }

  agregarCategoria(datosCategoria:any):Observable<any>{
    return this.clienteHttp.post(this.API+"categoria.php?insertar=1",datosCategoria);
  }


  agregarMarca(datosMarca:any):Observable<any>{
    return this.clienteHttp.post(this.API+"categoria.php?insertarMarca=1",datosMarca);
  }

  agregarMarcaSer(datosMarca:any):Observable<any>{
    return this.clienteHttp.post(this.API+"categoria.php?insertarMarcaSer=1",datosMarca);
  }

  obtenerCategoria():Observable<any>{
    return this.clienteHttp.get(this.API+"categoria.php?consultarCategorias");
  }

  obtenerSubCategoria(id: any):Observable<any>{
    return this.clienteHttp.get(this.API+"categoria.php?consultarSubCategorias="+id);
  }

  obtenerMarcas():Observable<any>{
    return this.clienteHttp.get(this.API+"categoria.php?consultarMarcas");
  }

  obtenerMarcasSer():Observable<any>{
    return this.clienteHttp.get(this.API+"categoria.php?consultarMarcasSer");
  }


  obtenerMarcasServiciosIdGym(idGym: string | number): Observable<any> {
    // Validar si el usuario tiene conexión antes de realizar la solicitud
    if (!this.isConnected) {
      return of({ success: 0, message: 'No hay conexión a Internet' });
    }

    console.log('Consultando marcas con idGym:', idGym);

    // Realizar la solicitud HTTP y capturar errores si ocurren
    return this.clienteHttp.get(`${this.API}categoria.php?consultarMarcasSerGim=${idGym}`).pipe(
      catchError((error) => {
        console.error('Error al obtener marcas y servicios:', error);
        return of({ success: 0, message: 'Error al obtener datos del servidor' });
      })
    );
  }



  updateMarcaService(data: any): Observable<any> {
    // Llamada POST al archivo PHP para actualizar marca y servicio
    return this.clienteHttp.post(this.API + "categoria.php?updateMarcaServ=true", data).pipe(
      catchError((error) => {
        console.error('Error al actualizar la marca y servicio:', error);
        return of({ success: 0, message: 'Error al actualizar la marca y servicio' });
      })
    );
  }

  getMarcaService(id: number, idGimnasio: number): Observable<any> {
    return this.clienteHttp.get(`${this.API}categoria.php?getMarcaServicio=${id}&idGimnasio=${idGimnasio}`);
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

  // REEMPLAZAR POR MARCAS

  // lista de marcas de un gimnasio
  obtenerMarcasServiciosIdGym2(idGym: string | number): Observable<any> {
    return this.clienteHttp.get(`${this.API2}getMarcasServB.php?idGimnasio=${idGym}`).pipe(
      catchError((error) => {
        console.error('Error al obtener marcas y servicios:', error);
        return of({ success: 0, message: 'Error al obtener datos del servidor' });
      })
    );
  }

  // crear marca para un gimnasio
  agregarMarcaSer2(datosMarca:any):Observable<any>{
    return this.clienteHttp.post(this.API2+"addMarcaServ.php?insertarMarcaServ=1",datosMarca);
  }

  // obtener una marca por el idMarca
  getMarcaService2(id: number): Observable<any> {
    return this.clienteHttp.get(`${this.API2}getMarcaServId.php?id_marcas=${id}`);
}

// actualizar marca
updateMarcaService2(data: any): Observable<any> {
  return this.clienteHttp.post(this.API2 + "updateMarcaServ.php?updateMarcaServ=1", data);
}

// eliminar marca
deleteMarcaServ(idM: any): Observable<any> {
  const data ={id: idM}
  return this.clienteHttp.post(this.API2+"deleteMarcaServ.php?eliminarMarcaServ", data);
}


// PARA LA SECCION DE PRODUCTOS
obtenerCategoria2():Observable<any>{
  return this.clienteHttp.get(this.API2+"getCategorias.php?consultarCategorias=");
}

obtenerSubCategoria2(id: any):Observable<any>{
  return this.clienteHttp.get(this.API2+"listarProductosCategoriaPro.php?id_categoria="+id);
}

obtenerCategoriaPorNombre2(nombre:string):Observable<any>{
  return this.clienteHttp.get(this.API2+"getCategoriaNombre.php?categoriaName="+nombre);
}

obtenerSubCategoriaPorNombre2(nombre:string, id:any):Observable<any>{
  return this.clienteHttp.get(this.API2+"getSubCategorisNombre.php?SubcategoriaName="+nombre+"&id="+id);
}

obtenerMarcaPorNombre2(nombre:string):Observable<any>{
  return this.clienteHttp.get(this.API2+"getMarcaNombre.php?marcaName="+nombre);
}

}
