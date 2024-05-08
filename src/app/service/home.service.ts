import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { horario } from '../models/horario';
import { ConnectivityService } from './connectivity.service';
import { IndexedDBService } from './indexed-db.service';
import { tap, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  isConnected: boolean = true;

  // APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  // APIv3: string = 'http://localhost/olimpusGym/conf/';
  // API: String = '';
  
  API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';

  constructor(private clienteHttp:HttpClient,private connectivityService: ConnectivityService, private indexedDBService:IndexedDBService ) {
  }

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

  consultarHome(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"ConsultasHome.php?consultasHome="+id).pipe(
      tap(dataResponse => {
        this.saveDataToIndexedDB(dataResponse);
      }),
      catchError(error => {
        return this.getServiceDatos();
      })
    );
  }

  private saveDataToIndexedDB(data: any) {
    // Guarda los datos en IndexedDB
    this.indexedDBService.saveHomeData('consultarHome', data);
  }
  
  getServiceDatos() {
    return new Observable(observer => {
      this.indexedDBService.getHomeData('consultarHome').then(data => {
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

  getAnalyticsData(sucursalId: any): Observable<any> {
    return this.clienteHttp.get(this.API+"ConsultasHome.php?consultarProductosVendidos="+sucursalId).pipe(
      tap(dataResponse => {
        this.saveDataToIndexedDB2(dataResponse);
      }),
      catchError(error => {
        return this.getServiceDatos2();
      })
    );
  }

  private saveDataToIndexedDB2(data: any) {
    // Guarda los datos en IndexedDB
    this.indexedDBService.saveAnalyticsData('Analytics', data);
  }
  
  getServiceDatos2() {
    return new Observable(observer => {
      this.indexedDBService.getAnalyticsData('Analytics').then(data => {
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

  getARecientesVentas(sucursalId: any): Observable<any> {
    return this.clienteHttp.get(this.API+"ConsultasHome.php?consultarVentasVendidas="+sucursalId).pipe(
      tap(dataResponse => {
        this.saveDataToIndexedDB3(dataResponse);
      }),
      catchError(error => {
        return this.getServiceDatos3();
      })
    );
  }

  private saveDataToIndexedDB3(data: any) {
    // Guarda los datos en IndexedDB
    this.indexedDBService.saveRecientesVentasData('RecientesVentas', data);
  }
  
  getServiceDatos3() {
    return new Observable(observer => {
      this.indexedDBService.getRecientesVentasData('RecientesVentas').then(data => {
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

}
