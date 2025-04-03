// postal-code.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import axios from 'axios';
import { ConnectivityService } from './connectivity.service';
import { ApiUrlService } from './api-url.service';

@Injectable({
  providedIn: 'root',
})
export class PostalCodeService {

  isConnected: boolean = true;
  //Servicio que obtiene los datos mediante el codigo postal
  // APIv2: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/administrador/';
  // APIv3: string = 'http://localhost/olimpusGym/conf/';
  // API: String = '';

  //API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  //API: string = 'http://localhost/serviciosGimnasio/';
  API: string = 'https://olympus.arvispace.com/ServiciosGym/';


  constructor(
    private http: HttpClient, 
    private connectivityService: ConnectivityService,
    private apiUrlService: ApiUrlService
  ) { 

    this.API = this.apiUrlService.getBaseUrl(); // Obtiene la URL de la API desde el servicio ApiUrlService
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




  consultarCodigoPostal(codigoPostal: string): Observable<any> {
    const url = `${this.API}cp.php?consultarCodigoP=${codigoPostal}`;
    return this.http.get<any>(url);
  }


}
