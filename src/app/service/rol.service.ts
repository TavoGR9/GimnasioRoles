import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolService {

  // private apiUrl = 'http://localhost/gimnasioServicios/';
  private apiUrl = 'https://olympus.arvispace.com/ServiciosGym/';

  constructor(private http: HttpClient) {}

  insertarRol(rol: { usu: string }): Observable<any> {
    const url = `${this.apiUrl}addRol.php`;
    return this.http.post(url, rol); // Realiza la petición HTTP
  }
}
