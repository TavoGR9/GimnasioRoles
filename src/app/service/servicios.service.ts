import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { plan } from '../models/plan';
import { ConnectivityService } from './connectivity.service';
import { IndexedDBService } from './indexed-db.service';
import { tap } from 'rxjs/operators';
import { catchError, of } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class serviciosService {
 
  API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';

  isConnected: boolean = true;

  // APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  // APIv3: string = 'http://localhost/olimpusGym/conf/';
  // API: String = '';

 
 
  public idService: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public seleccionado: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public confirmButton: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
 
  services: any[] = [];
  data: any = {};
  
  constructor(private clienteHttp:HttpClient, private connectivityService: ConnectivityService,private indexedDBService:IndexedDBService) {
    // this.comprobar();
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

  ///************************SERVICIOS */

  newService(data: any): Observable<any> {
    return this.clienteHttp.post(this.API+"servicesMembresia.php?insertarservicio", data).pipe(
      tap(dataResponse => {
      console.log("Data Response Service: ", dataResponse);
      }),
      catchError(error => {
        console.log("Datos Almacenados en cache");
        this.saveDataToIndexedDB(data);
        const resultData = { success: '2' };
        return of(resultData);        
      })
    );
  }

  private saveDataToIndexedDB(data: any) {
    // Guarda los datos en IndexedDB
    this.indexedDBService.saveAgregarServicioData('AgregarServicio', data);
  }

  updateService(data: any): Observable<any> {
    return this.clienteHttp.post(this.API+"servicesMembresia.php?actualizarServicio", data);
  }

  getService(id: number): Observable<any> {
    return this.clienteHttp.get(this.API+"servicesMembresia.php?getServicio="+id);
  }

  agregarServicios(datoService: any):Observable<any>{
    return this.clienteHttp.post(this.API+"servicesMembresia.php?insertar", datoService);
  }

}
