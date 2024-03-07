// postal-code.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class PostalCodeService {

  //Servicio que obtiene los datos mediante el codigo postal
  private apiUrl = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/administrador/cp.php';

  constructor(private http: HttpClient) { }

  consultarCodigoPostal(codigoPostal: string): Observable<any> {
    const url = `${this.apiUrl}?consultarCodigoP=${codigoPostal}`;
    return this.http.get<any>(url);
  }

}
