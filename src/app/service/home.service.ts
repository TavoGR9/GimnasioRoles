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

  //API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  API: string ='http://localhost/serviciosGym/';


  constructor(private clienteHttp:HttpClient,private connectivityService: ConnectivityService, private indexedDBService:IndexedDBService ) {
  }


   //HOME
  // llamada HTTP a la API REST, para obtener el total de ventas del día
  consultarHome(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"obtenerSumaPedidos.php?idGim="+id).pipe(
      tap(dataResponse => {
        this.saveDataToIndexedDB(dataResponse);
      }),
      catchError(error => {
       return this.getServiceDatos();
      })
    )
  }

  consultarAsistenciasTotal(idGym: number): Observable<any> {
    const data = { idGim: idGym }; // Formato esperado por el backend
    return this.clienteHttp.post(this.API + "ObtenerAsistenciasFechaActualTotal.php", data).pipe(
      tap((dataResponse) => {
        this.saveDataToIndexedDB(dataResponse); // Si estás manejando un IndexedDB
      }),
      catchError((error) => {
        console.error('Error en la solicitud:', error);
        return this.getServiceDatos(); // Método para manejar errores
      })
    );
}

consultarAsistenciasPersonal(idGym: number): Observable<any> {
  const data = { idGim: idGym }; // Formato esperado por el backend
  return this.clienteHttp.post(this.API + "ObtenerAsistenciasRol.php", data).pipe(
    tap((dataResponse) => {
      this.saveDataToIndexedDB(dataResponse); // Si estás manejando un IndexedDB
    }),
    catchError((error) => {
      return this.getServiceDatos(); // Método para manejar errores
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

  //HOME
  // llamada HTTP a la API REST, para obtener los productos más vendidos
  getAnalyticsData(sucursalId: any): Observable<any> {
    return this.clienteHttp.get(this.API+"ProductosMasComprados.php?consultarProductosVendidos="+sucursalId).pipe(
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

  consultarAsistencias(idGim: any) {
    const data = { idGim: idGim }; // Formato esperado por el backend
    return this.clienteHttp.post(this.API + "ObtenerAsistenciasFechaActual.php", data);
  }

  graficas(idGim:any){
    return this.clienteHttp.get(this.API+"ConsultaGraficas.php?mes1="+idGim);
  }

  graficas2(idGim:any){
    return this.clienteHttp.get(this.API+"ConsultaGraficas.php?mes2="+idGim);
  }

  graficas1Visita(idGim:any){
    return this.clienteHttp.get(this.API+"ConsultaGraficas.php?mes1Visita="+idGim);
  }

  graficas2Visita(idGim:any){
    return this.clienteHttp.get(this.API+"ConsultaGraficas.php?mes2Visita="+idGim);
  }

  graficas1Quincena(idGim:any){
    return this.clienteHttp.get(this.API+"ConsultaGraficas.php?mes1Quincena="+idGim);
  }

  graficas2Quincena(idGim:any){
    return this.clienteHttp.get(this.API+"ConsultaGraficas.php?mes2Quincena="+idGim);
  }

  consultasFechaMensualidad(idGim: any, fecha: any) {
    return this.clienteHttp.get(this.API + "ConsultasHome.php", {
        params: {
            idGim: idGim,
            fecha: fecha
        }
    });
  }

  consultasFechaVisita(idGim: any, fecha: any) {
    return this.clienteHttp.get(this.API + "ConsultasHome.php", {
        params: {
          idGimVisita: idGim,
          fechaVisita: fecha
        }
    });
  }

  consultasFechaQuincena(idGim: any, fecha: any) {
    return this.clienteHttp.get(this.API + "ConsultasHome.php", {
        params: {
            idGimQuincena: idGim,
            fechaQuincena: fecha
        }
    });
  }

ConsultarPedidosMembresias(id_bodega: any ){
  return  this.clienteHttp.get(this.API+'pedidosMembresias.php?id_bodega='+ id_bodega)
}

}
