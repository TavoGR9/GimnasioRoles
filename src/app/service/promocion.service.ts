import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { catchError, of, BehaviorSubject, Observable} from 'rxjs';

import { ConnectivityService } from './connectivity.service';
import { IndexedDBService } from './indexed-db.service';
import { Promocion } from '../models/promocion';

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

  //////////******************PLAN */
  public optionShow: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public showServices: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public dataToUpdate: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public section: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  //LISTA DE LOS PLANES
  listaPlanes(idGym: any): Observable<any> {
    const url = `${this.API}getProductosPromoPaquetes.php?idGym=${idGym}`;  // Incluye idGym en la URL
    return this.clienteHttp.get<any>(url).pipe(
      tap((dataResponse: any) => {
        //console.log("Respuesta de la API: ", dataResponse);
        this.saveDataToIndexedDB2(dataResponse);
      }),
      catchError(error => {
        //console.error("Error al obtener la promoción:", error);
        return this.getServiceDatos();
      })
    );
  }

  private saveDataToIndexedDB2(data: any) {
    if (Array.isArray(data)) {
      //console.log("Guardando los datos en IndexedDB promo:", data);
      this.indexedDBService.savePlanData('Plan', data);
    } else {
     // console.error("Los datos no son un array válido promo:", data);
    }
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



  //AGREGAR UN NUEVO PLAN
  agregarPlan(datosPlan: Promocion): Observable<any> {
    // Extraer solo los id_producto de las membresías
    const membresiaIds = datosPlan.membresias.map(membresia => membresia.idProbob);

    // Crear el objeto con los datos que se van a enviar, reemplazando el arreglo de miembros con solo los ids
    const datosAEnviar = {
      ...datosPlan,
      membresias: membresiaIds  // Solo enviamos los IDs de las membresías
    };

    console.log("Datos que se envían a la API:", datosAEnviar);

    return this.clienteHttp.post(this.API + "addPromocionPaquete.php", datosAEnviar).pipe(
      tap(dataResponse => {
        console.log("Respuesta de la API:", dataResponse);
      }),
      catchError(error => {
        console.error("Error en la solicitud:", error);
        this.saveDataToIndexedDBP(datosPlan);
        const resultData = { success: '0' };
        console.log("Respuesta del error: ", resultData);
        return of(resultData);
      })
    );
  }

  private saveDataToIndexedDBP(data: any) {
    this.indexedDBService.saveAgregarPlanData('AgregarPlan', data);
  }


  //EDICION DE PLANES Y MEMBRESIAS
  updatePlanesMem(datosPlan: Promocion): Observable<any> {
    // Extraer solo los id_producto de las membresías
    const membresiaIds = datosPlan.membresias.map(membresia => membresia.idProbob);

    // Crear el objeto con los datos que se van a enviar, reemplazando el arreglo de miembros con solo los ids
    const datosAEnviar = {
      ...datosPlan,
      membresias: membresiaIds  // Solo enviamos los IDs de las membresías
    };

    console.log("Datos que se envían a la API:", datosAEnviar);

    return this.clienteHttp.post(this.API + "updatePromocion.php", datosAEnviar).pipe(
      tap(dataResponse => {
        console.log("Respuesta de la API:", dataResponse);
      }),
      catchError(error => {
        console.error("Error en la solicitud:", error);
        this.saveDataToIndexedDBP(datosPlan);
        const resultData = { success: '0' };
        console.log("Respuesta del error: ", resultData);
        return of(resultData);
      })
    );
  }

  // Método para actualizar el estado de una promoción
  updateStatus(idProm: number, estado: { status: number }): Observable<any> {
    console.log("ID PARA ACTUALIZAR: ", idProm, " Nuevo estado: ", estado);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json' // Especifica el tipo de contenido como JSON
      })
    };

    // Enviar los datos como el cuerpo de la solicitud POST
    const body = {
      idProm: idProm,
      status: estado.status
    };

    return this.clienteHttp.post<any>(`${this.API}deletePromocion.php?estado`, body, httpOptions).pipe(
      tap(dataResponse => {
        console.log("Respuesta de la API:", dataResponse);
      }),
      catchError(error => {
        console.log("Respuesta del error: ", error);
        return of(error);
      })
    );
  }




  //ELIMINACION DE PLAN
  deletePlan(id: number): Observable<any> {
    console.log("ID PARA ELIMINAR: ", id);

    // Configuración de las opciones HTTP
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json' // Especifica el tipo de contenido como JSON
      }),
      params: new HttpParams().set('delete', id.toString()) // Parámetro para la solicitud GET
    };

    return this.clienteHttp.post<any>(`${this.API}deletePromocion.php`, { idProm: id }, httpOptions).pipe(
      tap(dataResponse => {
        console.log("Respuesta de la API:", dataResponse);
      }),
      catchError(error => {
        console.log("Respuesta del error: ", error);
        return of(error);
      })
    );
  }

  //EDICION DE PLANES
  setDataToupdate(id_promocion:number){
    this.data = {
     id: id_promocion
    }
    if(this.data){
      this.dataToUpdate.next(this.data);
    }
   }

   getDataToUpdate(): Observable<any> {
    console.log("IDS: ",this.dataToUpdate);
    return this.dataToUpdate.asObservable();

  }


}


