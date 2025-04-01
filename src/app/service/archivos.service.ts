import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiUrlService } from './api-url.service';

@Injectable({
  providedIn: 'root',
})
export class ArchivoService {

//API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
//API: string = 'http://localhost/serviciosGimnasio/'

// API: string = 'http://localhost/gimnasioServicios/';


//API: string = 'http://localhost/serviciosGym/';
API: string 

constructor(private clienteHttp: HttpClient
, private apiUrlService: ApiUrlService) {

  this.API = this.apiUrlService.getBaseUrl(); // Obtiene la URL de la API desde el servicio ApiUrlService
}

guardarArchivos(formData: FormData) {
  return this.clienteHttp.post(this.API+"archivos.php", formData);
}

}
