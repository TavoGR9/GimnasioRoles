import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { gimnasio } from '../models/gimnasio';
import { BehaviorSubject, Observable, Subject, catchError } from 'rxjs';
import { ConnectivityService } from './connectivity.service';
import { tap } from 'rxjs/operators';
import { IndexedDBService } from './indexed-db.service';
import { throwError  } from 'rxjs';
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

  //API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  //API: string = 'http://localhost/serviciosGimnasio/';
    // API: string = 'http://localhost/serviciosGym/';
    API: string = 'http://localhost/gimnasioServicios/'

  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private clienteHttp: HttpClient, private connectivityService: ConnectivityService, private indexedDBService:IndexedDBService) {}

  ///CONSULTAR DATOS DE LA BODEGA
  consultarPlan(correo: string):Observable<any>{
    const url = `${this.API}getUsuarioActual.php?correo=${correo}`;
    //console.log("Dato: ",url)
    return this.clienteHttp.get<any>(url).pipe(
      tap((dataResponse: any) => {
        //console.log("Respuesta de la API: ",dataResponse);
      }),
      catchError(error => {
        console.error("Error en la API: ", error);
        return throwError(() => error);
      })
    );
  }


  obternerPlan(){
    return this.clienteHttp.get<any[]>(this.API+"getBodega.php").pipe(
      tap(dataResponse => {
       // console.log("Respuesta de la API: ",dataResponse);
          this.saveDataToIndexedDB1(dataResponse);
      }),
      catchError(error => {
          // Intenta obtener los datos de IndexedDB en caso de error
          //console.error("DATOS NO OBTENIDOS: ",error);
          return this.getDataFromIndexedDB();
      })
    );
  }

  private saveDataToIndexedDB1(data: any) {
    // Guarda los datos en IndexedDB
    this.indexedDBService.saveSucursalesData('Sucursales', data);
}

getDataFromIndexedDB() {
  // Intenta obtener los datos de IndexedDB
  return new Observable(observer => {
      this.indexedDBService.getSucursalesData('Sucursales').then(data => {
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

  obtenerPlan(): Observable<any> {
    const url = `${this.API}getbodegass`;
    //console.log('URL para obtener bodegas:', url);  // Verificar URL
    return this.clienteHttp.get<any>(url).pipe(
      catchError((error) => {
        //console.error('Error al obtener los datos de las sucursales:', error);
        return throwError(() => new Error('Error al obtener los datos'));
      })
    );
  }

  obtenerBodegaById(idBodega: number): Observable<any> {
    const url = `${this.API}getBodegaById.php?id_bodega=${idBodega}`;
   // console.log('URL para obtener bodega por ID:', url);  // Verificar URL
    return this.clienteHttp.get<any>(url).pipe(

      catchError((error) => {
       // console.error('Error al obtener la bodega:', error);
        return throwError(() => new Error('Error al obtener la bodega'));
      })
    );
  }



  getCategoriasSubject() {
    return this.gymSubject.asObservable();
  }

  agregarSucursal(datosGym: gimnasio):Observable<any>{
    return this.clienteHttp.post(this.API+"addBodega.php", datosGym);
  }

  consultarArchivos(id: any): Observable<any> {
    return this.clienteHttp.get(this.API + "getArchivos.php?id_bodega=" + id);
}


  // actualizarSucursal(datosGym: any):Observable<any>{
  //   return this.clienteHttp.post(this.API+"bodega.php?actualizar", datosGym);
  // }

  // actualizarEstatus(idGimnasio: any, estatus: any): Observable<any> {
  //   let body = new URLSearchParams();
  //   body.set('idBodega', idGimnasio);
  //   body.set('estatus', estatus.toString());
  //   body.set('actualizarEstatus', '1');
  //   let options = {
  //     headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
  //   };
  //   return this.clienteHttp.post(this.API+"bodega.php?actualizaEstatus", body.toString(), options);
  // }

  actualizarSucursal(datosGym: any):Observable<any>{
    return this.clienteHttp.post(`${this.API}updateBodega.php?insertar`, datosGym).pipe(
      tap(dataResponse => {
        //console.log("DATOS ENVIADOS DESDE LA API: ",dataResponse);
      }),
      catchError(error => {
       // console.error("ERROR DE LA API: ",error)
        return error;
      })
    );
  }



  actualizarEstatus(idGimnasio: any, estatus: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json' // Especifica el tipo de contenido como JSON
      })
    };

    const body = {
      idGim: idGimnasio,
      status: estatus
    };

    console.log("DATOS A ENVIAR, ESTATUS: ",body);

    return this.clienteHttp.post<any>(`${this.API}updateBodega.php?estatus`,body, httpOptions).pipe(
      tap(dataResponse => {
        //console.log("DATOS ENVIADOS DESDE LA API: ",dataResponse);
      }),
      catchError(error => {
        //console.error("ERROR DE LA API: ",error)
        return error;
      })
    );
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

        return this.getServiceDatos();
      /*  const resultData = { success: '2' }; // Objeto que indica éxito
        return forkJoin([
          this.getServiceDatos().pipe(
            filter(data => data !== null) // Ignora el observable si es null
          ),
          this.getServiceDatosInsert().pipe(
            filter((data: any) => Array.isArray(data)), // Filtra solo los arrays
            map((data: any[]) => data.map(item => item.data)) // Obtén solo los datos de cada elemento del array
          ),
          of(resultData) // Convierte el objeto en un observable
        ]);*/
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

consultarFoto(id:any):Observable<any>{
  return this.clienteHttp.get(this.API+"bodega.php?consultarFoto="+id);
}

getInfoBodega(id_bodega: any): Observable<any> {
  const url = `${this.API}/getInfoBodega.php?id_bodega=${id_bodega}`;  // Concatenamos la URL base con el endpoint
  return this.clienteHttp.get(url);
}



}
