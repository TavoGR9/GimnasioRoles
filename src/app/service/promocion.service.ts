import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { membresia } from '../models/membresia';
import { tap } from 'rxjs/operators';
import { catchError, of, BehaviorSubject, Observable} from 'rxjs';
import { ConnectivityService } from './connectivity.service';
import { IndexedDBService } from './indexed-db.service';
@Injectable({
  providedIn: 'root'
})
export class PromocionService {

  isConnected: boolean = true;
  private datosPlan: any;
  data: any = {};

  //API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  API: string = 'http://localhost/serviciosGym/';

  constructor(private clienteHttp:HttpClient, private connectivityService: ConnectivityService, private indexedDBService:IndexedDBService) {
  }

  public optionShow: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private saveDataToIndexedDBP(data: any) {
    this.indexedDBService.saveAgregarPlanData('AgregarPlan', data);
  }

  private saveDataToIndexedDB2(data: any) {
    this.indexedDBService.savePlanData('Plan', data);
  }

  consultarPlanIdPlan2(): Observable<any> {
    return this.clienteHttp.get(`${this.API}getInfoPromociong.php`).pipe(
      tap(dataResponse => {
        this.saveDataToIndexedDB2(dataResponse);
      }),
      catchError(error => {
        console.error("Error al obtener la promoción:", error);
        return this.getServiceDatos();
      })
    );
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
        console.error("Error al obtener datos de IndexedDB:", error);
        observer.next(null); // Emitir null en caso de error
        observer.complete();
      });
    });
  }

  agregarPlan(datosPlan: membresia): Observable<any> {
    console.log("Datos que se envían a la API:", datosPlan);  // Muestra los datos an
    return this.clienteHttp.post(this.API + "addPromocionPaquete.php", datosPlan).pipe(
      tap(dataResponse => {
        console.log("Respuesta de la API:", dataResponse);

      }),
      catchError(error => {
        console.error("Error en la solicitud:", error);
       // this.saveDataToIndexedDBP(datosPlan);
        const resultData = { success: '2' };
        return of(resultData);
      })
    );
  }


/*
agregarPlan(datosPlan: any): Observable<any> {
  console.log("Datos que se envían a la API:", datosPlan);  // Muestra los datos antes de enviarlos a la API

  return this.clienteHttp.post(this.API + "addPromocionPaquete.php", datosPlan).pipe(
    catchError(error => {
      console.error("Error en la solicitud:", error);

      // Retornar el error tal cual sin modificarlo
      throw error;  // Lanza el error para que se pueda manejar fuera de esta función
    })
  );
}
*/

}


