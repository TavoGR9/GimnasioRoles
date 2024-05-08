import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError} from 'rxjs';
import { membresia } from '../models/membresia';
import { tap } from 'rxjs/operators';
import { catchError } from 'rxjs';
import { ConnectivityService } from './connectivity.service';
import { IndexedDBService } from './indexed-db.service';
import { forkJoin,of  } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MembresiaService {

  isConnected: boolean = true;

  API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';

  // APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  // APIv3: string = 'http://localhost/olimpusGym/conf/';
  // API: String = '';
  
  constructor(private clienteHttp:HttpClient, private connectivityService: ConnectivityService, private indexedDBService:IndexedDBService) {
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

  private datosPlan: any;
  data: any = {};

  /////////////////////************************Membresia */

  private saveDataToIndexedDBM(data: any) {
    // Guarda los datos en IndexedDB
    this.indexedDBService.saveAgregarMembresiaData('AgregarMembresia', data);
  }

  agregarMem(datosPlan:any):Observable<any>{
    return this.clienteHttp.post(this.API+"membresias.php?insertar",datosPlan).pipe(
      tap(dataResponse => {
      }),
      catchError(error => {
        this.saveDataToIndexedDBM(datosPlan);
        const resultData = { success: '2' };
        return of(resultData);        
      })
    );  }







  updateMembresia(formData: any): Observable<any>{ 
    return this.clienteHttp.put(this.API+"membresias.php", formData);
  }

  updateMembresiaStatus(id: number, estado: { status: number }): Observable<any> {
    return this.clienteHttp.post(this.API+"membresias.php?actualizarEstatus="+id,estado);
  }

  consultarPlanGym(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"membresias.php?consultarMembresia="+id);
  }


  //////////******************PLAN */
  public optionShow: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public showServices: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public dataToUpdate: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public section: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private saveDataToIndexedDBP(data: any) {
    this.indexedDBService.saveAgregarPlanData('AgregarPlan', data);
  }

  agregarPlan(datosPlan:membresia):Observable<any>{
    return this.clienteHttp.post(this.API+"membresias.php?insertarplan",datosPlan).pipe(
      tap(dataResponse => {
      }),
      catchError(error => {
        this.saveDataToIndexedDBP(datosPlan);
        const resultData = { success: '2' };
        return of(resultData);        
      })
    );
  }



  consultarPlanIdMem(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"membresias.php?consultarGYMMem="+id).pipe(
      tap(dataResponse => {
        this.saveDataToIndexedDB(dataResponse);
      }),
      catchError(error => {
        //return this.getMembresiaDatos();
        const resultData = { success: '2' }; // Objeto que indica éxito
        return forkJoin([
          this.getMembresiaDatos().pipe(
            filter(data => data !== null) // Ignora el observable si es null
          ),
          this.getMemDatosInsert().pipe(
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
    this.indexedDBService.saveMembresiaData('membresia', data);
  }
  
  getMembresiaDatos() {
    return new Observable(observer => {
      this.indexedDBService.getMembresiaData('membresia').then(data => {
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
  
  getMemDatosInsert() {
    return new Observable(observer => {
        this.indexedDBService.getAgregarMembresiaData('AgregarMembresia').then(data => {
            observer.next(data); // Emitir los datos obtenidos de IndexedDB
            observer.complete();
        }).catch(error => {
            observer.error(error); // Emitir un error si no se pueden obtener los datos de IndexedDB
        });
    });
  }

  consultarPlanIdPlan2(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"membresias.php?consultarGYMPlanT="+id).pipe(
      tap(dataResponse => {
        this.saveDataToIndexedDB2(dataResponse);
      }),
      catchError(error => {
        return this.getServiceDatos();
      })
    );
  }

  private saveDataToIndexedDB2(data: any) {
    // Guarda los datos en IndexedDB
    this.indexedDBService.savePlanData('Plan', data);
  }
  
  getServiceDatos() {
    return new Observable(observer => {
      this.indexedDBService.getPlanData('Plan').then(data => {
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
  




  setDataToupdate(id:number, tipo_membresia: number){
    this.data = {
     id: id,
     tipo_membresia: tipo_membresia
   }
   if(this.data){
     this.dataToUpdate.next(this.data);
   }
   }

   getDataToUpdate(): Observable<any> {
    return this.dataToUpdate.asObservable();
  }

  consultarPlan(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"membresias.php?consultarPlanes="+id);
  }

  agregarPlanMem(datosPlanM:any):Observable<any>{
    return this.clienteHttp.post(this.API+"membresias.php?insertarPlanM",datosPlanM);
  }

  consultarPlanId(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"membresias.php?consultarGYM="+id);
  }

  actualizarPlan(id:any,datosPlan:any):Observable<any>{
    return this.clienteHttp.post(this.API+"membresias.php?actualizarPlan="+id,datosPlan);
  }  

}
