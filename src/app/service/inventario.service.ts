import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConnectivityService } from './connectivity.service';

@Injectable({
  providedIn: 'root'
})
export class inventarioService {

  isConnected: boolean = true;

  // APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  // APIv3: string = 'http://localhost/olimpusGym/conf/';
  // API: String = '';

  API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  
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

  HistorialInventario(dateInicio: any, dateFin: any, idGym: any): Observable<any> {
    const url = `${this.API}producto_bod.php?obtenerHistorialInventario`;
    const body = {id_bodega_param: idGym, fechaInicio_param: dateInicio, fechaFin_param: dateFin};
    return this.clienteHttp.post(url, body);
  }
}
