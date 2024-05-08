import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConnectivityService } from './connectivity.service';
import { IndexedDBService } from './indexed-db.service';
import { tap, catchError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class JoinDetalleVentaService {


  isConnected: boolean = true;
  
  API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';

  // APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  // APIv3: string = 'http://localhost/olimpusGym/conf/';
  // API: String = '';

  constructor(private clienteHttp:HttpClient, private connectivityService: ConnectivityService, private indexedDBService: IndexedDBService) {
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

  consultarProductosVentas(Gimnasio_idGimnasio: number | null): Observable<any> {
    const body = { Gimnasio_idGimnasio };
    const url = `${this.API}venta_detalleVenta.php?ventasDetalle`;
    return this.clienteHttp.post(url, body).pipe(
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
    this.indexedDBService.saveVentasData('Ventas', data);
  }
  
  getServiceDatos() {
    return new Observable(observer => {
      this.indexedDBService.getVentasData('Ventas').then(data => {
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





  consultarProductosGimnasio(idGimnasio: number | null): Observable<any[]> {
    const url = `${this.API}venta_detalleVenta.php?consultar=true&Gimnasio_idGimnasio=${idGimnasio}`;
    return this.clienteHttp.get<any[]>(url);
  }

}
