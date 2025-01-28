import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { ConnectivityService } from './connectivity.service';

@Injectable({
  providedIn: 'root'
})
export class inventarioService {

  isConnected: boolean = true;

  // APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  // APIv3: string = 'http://localhost/olimpusGym/conf/';
  // API: String = '';

  //API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  // API: string = 'http://localhost/serviciosGimnasio/';
  // API: string ='http://localhost/serviciosGym/';
  API: string = 'http://localhost/gimnasioServicios/'


  constructor(private clienteHttp:HttpClient, private connectivityService: ConnectivityService) {
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

  obtenerProductoPorId(id: any, idGimnasio: any): Observable<any> {
    let params = new HttpParams().set('consultar', id).set('idGimnasio', idGimnasio);
    return this.clienteHttp.get(this.API+"producto_bod.php", { params: params });
  }


  buscarProductoPorNombre( idGym: number): Observable<any> {
    // Crear los parámetros de la solicitud
    const params = new HttpParams()
      .set('idGym', idGym);

    return this.clienteHttp.get<any>(this.API+"producto_bod.php", { params });
  }


  //Lista Historial
  HistorialInventario(dateInicio: any, dateFin: any, idGym: any): Observable<any> {
    const url = `${this.API}verHistorialPedido.php`;
    const body = {id_bodega_param: idGym, fechaInicio_param: dateInicio, fechaFin_param: dateFin};
    // console.log("DATOS ENVIADOS AL API: ",body);
    return this.clienteHttp.post(url, body).pipe(
      tap(dataResponse => {
        // console.log('RESPUESTA DE LA API: ', dataResponse);

      }),
      catchError(error => {
        console.error('ERROR EN LA API: ',error);
        return error;

      })
    );
  }


  //Lista del Historial para la nueva BD
  HistorialInventarioLista(dateInicio: any, dateFin: any, idGym: any): Observable<any> {
    const url = `${this.API}obtenerHistorialExistencias.php?listaHistorialExistencia`;
    const body = {id_bodega_param: idGym, fechaInicio_param: dateInicio, fechaFin_param: dateFin};
    return this.clienteHttp.post(url,body);
  }


  //OBTENER PRODUCTO PARA EDICION Y PARA PUNTO DE VENTA POR IDPROBOB Y IDBODEGA
  obtenerProductoPorIdYIdBodega(id: any, idGimnasio: any): Observable<any> {
    let params = new HttpParams().set('consultar', id).set('idGimnasio', idGimnasio);
    return this.clienteHttp.get(this.API+"obtenerProductoIdYBodega.php", { params: params });
  }

  //OBTENER PRODUCTO PARA PUNTO DE VENTA POR NOMBRE Y IDBODEGA
  buscarProductoPorNombreYIdBodega( idGym: number): Observable<any> {
    const params = new HttpParams()
      .set('idGym', idGym);

    return this.clienteHttp.get<any>(this.API+"obtenerProductoNombre.php", { params });
  }
}
