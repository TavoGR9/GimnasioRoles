import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { msgResult } from '../models/empleado';
import { ConnectivityService } from './connectivity.service';
import { IndexedDBService } from './indexed-db.service';
import { catchError, tap } from 'rxjs/operators';
import { forkJoin,of  } from 'rxjs';
import { filter, map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class PagoMembresiaEfectivoService {
  
  isConnected: boolean = true;
  
  API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  // APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  // APIv3: string = 'http://localhost/olimpusGym/conf/';
  // API: String = '';

  constructor(private clienteHttp:HttpClient, private connectivityService: ConnectivityService, private indexedDBService: IndexedDBService) { }
  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });


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

  ticketPagoInfo(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"Usuario.php?infoTicketMembresia="+id);
  }

  obtenerActivos(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"Usuario.php?obtenerVista="+id).pipe(
      tap(dataResponse => {
        this.saveDataToIndexedDB2(dataResponse);
      }),
      catchError(error => {
        
        const resultData = { success: '2' }; // Objeto que indica éxito
        return forkJoin([
          this.getServiceDatos().pipe(
            filter(data => data !== null)
            
          ),
          this.getServiceDatosInsert().pipe(

           filter((data: any) => Array.isArray(data)),
            map((data: any[]) => data.map(item => item.data)) 
          ),
          of(resultData) // Convierte el objeto en un observable
        ]);
      })
    );
  }

  private saveDataToIndexedDB2(data: any) {
    // Guarda los datos en IndexedDB
    this.indexedDBService.saveObtenerActivosData('ObtenerActivos', data);
  }
  
  getServiceDatos() {
    return new Observable(observer => {
      this.indexedDBService.getObtenerActivosData('ObtenerActivos').then(data => {
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
        this.indexedDBService.getAgregarRegistroData('AgregarRegistro').then(data => {
            observer.next(data); // Emitir los datos obtenidos de IndexedDB
            observer.complete();
        }).catch(error => {
            observer.error(error); // Emitir un error si no se pueden obtener los datos de IndexedDB
        });
    });
}


  obtenerClientes(inicioDate: any, finDate: any, idGym: any): Observable<any> {
    const params = {
      GYMid: idGym,
      fechaInicio: inicioDate,
      fechaFin: finDate
    };
    return this.clienteHttp.get(this.API + 'Usuario.php', { params });
  }
  

  membresiasLista(idSucu: any):Observable<any>{
    const params = {
      id_bodega: idSucu
    };
    return this.clienteHttp.get(this.API+"Usuario.php?listaMembre=", { params }).pipe(
      tap(dataResponse => {
        this.saveDataToIndexedDB(dataResponse);
      }),
      catchError(error => {
        return this.getDataFromIndexedDB();
      })
    );

  }

  getDataFromIndexedDB() {
    // Intenta obtener los datos de IndexedDB
    return new Observable(observer => {
        this.indexedDBService.getMembresiaIdData('AgregarMemId').then(data => {
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


  private saveDataToIndexedDB(data: any) {
    // Guarda los datos en IndexedDB
    this.indexedDBService.saveMembresiaIdData('AgregarMemId', data);
  }
  
  membresiasInfo(idMemb: any):Observable<any>{
    const params = {
      id_mem: idMemb
    };
    return this.clienteHttp.get(this.API+"Usuario.php?infoMembre=", { params });
  }

  actualizacionMemebresia(idCli:any,idMem:any, fecha: any, detMemID: any, precio: any, fechaFormateadaFin: any):Observable<any>{
    const params = new HttpParams().set('consultClienteId', idCli).set('consultMemId', idMem).set('fechaActual',fecha).set('detMemID',detMemID).set('precio',precio).set('fechaFormateadaFin',fechaFormateadaFin);

    return this.clienteHttp.get(this.API+"Usuario.php", { params });
  }

  histoClienteMemb(id:any):Observable<any>{
    const params = {
      idCliente: id
    };
    return this.clienteHttp.get(this.API+"Usuario.php?histoCliente=", { params });
  }

  actualizaDatosCliente(data: any): Observable<any> {
    return this.clienteHttp.post<msgResult>(this.API+"Usuario.php?updatePersonalData", data, { headers: this.httpHeaders });
  }
}