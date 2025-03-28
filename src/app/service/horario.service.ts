import { Injectable, Pipe } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, catchError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { horario } from '../models/horario';
import { ConnectivityService } from './connectivity.service';
@Injectable({
  providedIn: 'root'
})
export class HorarioService {

  isConnected: boolean = true;

  // APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  // APIv3: string = 'http://localhost/olimpusGym/conf/';
  // API: String = '';

  //API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  //API: string = 'http://localhost/serviciosGimnasio/';

  // API: string = 'http://localhost/gimnasioServicios/';
  API: string = 'https://olympus.arvispace.com/ServiciosGym/';

  constructor(private clienteHttp:HttpClient, private connectivityService: ConnectivityService) {
  }

  agregarHorario(datosHorario: horario):Observable<any>{
    return this.clienteHttp.post(this.API+"horario.php?insertar", datosHorario).pipe(
      tap(dataResponse => {
        //console.log("DATOS ENVIADOS DESDE LA API: ",dataResponse);
      }),
      catchError(error => {
        //console.error("ERROR DE LA API: ",error)
        return error;
      })
    );
  }

  actualizarHorario(id: any, datosPlan: any): Observable<any> {
    //console.log("datosPlan", datosPlan);

    const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json' // Especifica el tipo de contenido como JSON
          })
        };

    const datos = {
      ...datosPlan,
      id : id
    }

   // console.log("Datos a enviar: ",datos)

    return this.clienteHttp.post(`${this.API}horario.php?actualizar`, datos, httpOptions).pipe(
      tap(dataResponse => {
        //console.log("RESPUESTA DE API ",dataResponse);
      }),
      catchError(error => {
        //console.error("ERROR DE LA API: ",error)
        return error;
      })
    );
  }

  consultarHorario(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"horario.php?consultar="+id).pipe(
      tap(dataResponse => {
        //console.log("DATOS ENVIADOS DESDE LA API: ",dataResponse);
      }),
      catchError(error => {
        //console.error("ERROR DE LA API: ",error)
        return error;
      })
    );
  }

}
