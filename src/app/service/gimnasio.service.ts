import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { gimnasio } from '../models/gimnasio';
import { BehaviorSubject, Observable, Subject, catchError } from 'rxjs';
import { ConnectivityService } from './connectivity.service';
import { tap } from 'rxjs/operators';
import { IndexedDBService } from './indexed-db.service';
import { forkJoin,of  } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GimnasioService {

  private gymSubject = new BehaviorSubject<any[]>([]);
  gimnasioSeleccionado = new BehaviorSubject<number>(0);
  botonEstado = new Subject<{respuesta: boolean, idGimnasio: any}>();
  optionSelected = new BehaviorSubject<number>(0);

  isConnected: boolean = true;

  // APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  // APIv3: string = 'http://localhost/olimpusGym/conf/';
  // API: String = '';

  API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';

  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private clienteHttp: HttpClient, private connectivityService: ConnectivityService, private indexedDBService:IndexedDBService) {}

  // comprobar(){
  //   this.connectivityService.checkInternetConnectivity().subscribe((isConnected: boolean) => {
  //     this.isConnected = isConnected;
  //     if (isConnected) {
  //       this.API = this.APIv2;
  //     } else {
  //       this.API = this.APIv3;
  //     }
  //   });
  // }

  obternerPlan(): Observable<any[]>{
    return this.clienteHttp.get<any[]>(this.API+"bodega.php?consultar");
  }

  getCategoriasSubject() {
    return this.gymSubject.asObservable();
  }

  agregarSucursal(datosGym: gimnasio):Observable<any>{
    return this.clienteHttp.post(this.API+"bodega.php?insertar", datosGym);
  }

  consultarArchivos(id: any):Observable<any>{
    return this.clienteHttp.get(this.API+"bodega.php?consultarArchivos="+id);
  }

  actualizarSucursal(datosGym: any):Observable<any>{
    return this.clienteHttp.post(this.API+"bodega.php?actualizar", datosGym);
  }

  consultarPlan(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"bodega.php?consultarB="+id);
  }

  actualizarEstatus(idGimnasio: any, estatus: any): Observable<any> {
    let body = new URLSearchParams();
    body.set('idBodega', idGimnasio);
    body.set('estatus', estatus.toString());
    body.set('actualizarEstatus', '1');
    let options = {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    };
    return this.clienteHttp.post(this.API+"bodega.php?actualizaEstatus", body.toString(), options);
  }

  getAllServices(): Observable<any> {
    return this.clienteHttp.get(this.API+"serviciosGym.php");
  }

  getServicesForId(id: any): Observable<any> {
    return this.clienteHttp.post(this.API + "serviciosGym.php", { id: id }).pipe(
      tap(dataResponse => {
        this.saveDataToIndexedDB(dataResponse);
      }),
      catchError(error => {
        const resultData = { success: '2' }; // Objeto que indica éxito
        return forkJoin([
          this.getServiceDatos().pipe(
            filter(data => data !== null) // Ignora el observable si es null
          ),
          this.getServiceDatosInsert().pipe(
            filter((data: any) => Array.isArray(data)), // Filtra solo los arrays
            map((data: any[]) => data.map(item => item.data)) // Obtén solo los datos de cada elemento del array
          ),
          of(resultData) // Convierte el objeto en un observable
        ]);
      })
    );
  }

  private saveDataToIndexedDB(data: any) {
    // Guarda los datos en IndexedDB
    this.indexedDBService.saveServiceData('service', data);
  }
  
  getServiceDatos() {
    return new Observable(observer => {
      this.indexedDBService.getServiceData('service').then(data => {
        if (data && data.length > 0) {
          let maxId = -1;
          let lastData: any;
          data.forEach((record: any) => {
            if (record.id > maxId) {
              maxId = record.id;
              lastData = record.data;
            }
          });
          observer.next(lastData); // Emitir el último dato encontrado
        } else {
          observer.next(null); // Emitir null si no hay datos en IndexedDB
        }
        observer.complete();
      }).catch(error => {
        observer.error(error); // Emite un error si no se pueden obtener los datos de IndexedDB
      });
  });
  }

  getServiceDatosInsert() {
    return new Observable(observer => {
        this.indexedDBService.getAgregarServicioData('AgregarServicio').then(data => {
            observer.next(data); // Emitir los datos obtenidos de IndexedDB
            observer.complete();
        }).catch(error => {
            observer.error(error); // Emitir un error si no se pueden obtener los datos de IndexedDB
        });
    });
}

}
