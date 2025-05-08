import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrlService } from './api-url.service';

@Injectable({
  providedIn: 'root'
})
export class RolService {

  // private apiUrl = 'http://localhost/gimnasioServicios/';
  private apiUrl = 'http://localhost/serviciosGym/';
  constructor(private http: HttpClient,
              private apiUrlService: ApiUrlService) {
    this.apiUrl = this.apiUrlService.getBaseUrl(); // Obtiene la URL de la API desde el servicio ApiUrlService
  }


  insertarRol(rol: { usu: string }): Observable<any> {
    const url = `${this.apiUrl}addRol.php`;
    return this.http.post(url, rol); // Realiza la petición HTTP
  }
}
