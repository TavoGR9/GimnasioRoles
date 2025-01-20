import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private apiUrl = 'http://localhost/serviciosGym/'; // Reemplaza con tu URL real

  constructor(private http: HttpClient) {}

  insertarRol(rol: { usu: string }): Observable<any> {
    const url = `${this.apiUrl}addRol.php?insertar`;
    return this.http.post(url, rol); // Realiza la petición HTTP
  }
}
