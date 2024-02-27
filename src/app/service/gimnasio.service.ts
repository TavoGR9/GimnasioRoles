import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { dataGym, gimnasio } from '../models/gimnasio';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GimnasioService {

  private gymSubject = new BehaviorSubject<any[]>([]);

  gimnasioSeleccionado = new BehaviorSubject<number>(0);
  botonEstado = new Subject<{respuesta: boolean, idGimnasio: any}>();
  optionSelected = new BehaviorSubject<number>(0);
  Api_home: string =
    'https://olympus.arvispace.com/gimnasioRoles/configuracion/superAdministrador/espacioCliente.php';
  API: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/superAdministrador/gimnasio2.php'
  APIGym: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/superAdministrador/gimnasio.php'
  APISERVICE: string = 'https://olympus.arvispace.com/puntoDeVenta/conf/serviciosGym.php';

  //para guardar los headers que manda el API
  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private clienteHttp: HttpClient) {}

  //Listar gimansios de manera general ----------------------------- Roghelio
  gimnasiosLista(): Observable<any> {
    return this.clienteHttp.get<dataGym>(this.Api_home + '?listaGym');
  }

  obternerPlan(): Observable<any[]>{
    return this.clienteHttp.get<any[]>(this.API+"?consultarGimnasios")
    .pipe(
      tap((nuevosGym: any[]) => {
        // Emite el valor al subject después de recibir la respuesta
        this.gymSubject.next(nuevosGym);
      })
    );
  }

  getCategoriasSubject() {
    return this.gymSubject.asObservable();
  }

  // Angular service method
  agregarSucursal(datosGym: gimnasio):Observable<any>{
    return this.clienteHttp.post(this.API+"?insertar", datosGym);
  }

  consultarArchivos(id: any):Observable<any>{
    return this.clienteHttp.get(this.API+"?consultarArchivos="+id);
  }

  actualizarPlan(id:any,datosPlan:any):Observable<any>{
    return this.clienteHttp.post(this.APIGym+"?actualizar="+id,datosPlan);
  }

  actualizarSucursal(datosGym: gimnasio):Observable<any>{
    return this.clienteHttp.post(this.API+"?actualizar", datosGym);
  }

  consultarPlan(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"?consultar="+id);
  }

  borrarSucursal(id:any):Observable<any>{
    console.log("si entro aca") 
    return this.clienteHttp.get(this.API+"?borrar="+id)
    //this.message = "¡Error al eliminar!, Restricción en la base de datos";
  }

  actualizarPlanes(id:any,datosPlan:any):Observable<any>{
    console.log("datosPlan",id,datosPlan);

    // Crear los datos como x-www-form-urlencoded
    let body = new URLSearchParams();
    body.set('nombreGym', datosPlan.nombreGym);
    body.set('codigoPostal', datosPlan.codigoPostal);
    body.set('estado', datosPlan.estado);
    body.set('ciudad', datosPlan.ciudad);
    body.set('colonia', datosPlan.colonia);
    body.set('calle', datosPlan.calle);
    body.set('numExt', datosPlan.numExt);
    body.set('numInt', datosPlan.numInt);
    body.set('telefono', datosPlan.telefono);
    body.set('tipo', datosPlan.tipo);
    body.set('Franquicia_idFranquicia', datosPlan.Franquicia_idFranquicia);
    body.set('casilleros', datosPlan.casilleros);
    body.set('estacionamiento', datosPlan.estacionamiento);
    body.set('regaderas', datosPlan.regaderas);
    body.set('bicicletero', datosPlan.bicicletero);
    body.set('estatus', datosPlan.estatus);

    // Crear las opciones de la solicitud
    let options = {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    };

    return this.clienteHttp.post(this.API+"?actualizar="+id, body.toString(), options);
  } 

  actualizarEstatus(idGimnasio: any, estatus: any): Observable<any> {
    // Crear los datos como x-www-form-urlencoded
    let body = new URLSearchParams();
    body.set('idGimnasio', idGimnasio);
    body.set('estatus', estatus.toString());
    body.set('actualizarEstatus', '1');
  
    // Crear las opciones de la solicitud
    let options = {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    };
  
    return this.clienteHttp.post(this.API, body.toString(), options);
}

getAllServices(): Observable<any> {
  return this.clienteHttp.get(this.APISERVICE);
}

getServicesForId(id: any): Observable<any> {
  return this.clienteHttp.post(this.APISERVICE, { id: id });
}



}
