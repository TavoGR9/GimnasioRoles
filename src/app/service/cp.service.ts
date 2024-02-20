// postal-code.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class PostalCodeService {
  /*private nominatimUrl = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) {}

  getAddressByPostalCode(postalCode: string): Observable<any> {
    const params = {
      format: 'json',
      postalcode: postalCode,
      country: 'MX', // Replace with the appropriate country code
    };

    return this.http.get<any[]>(this.nominatimUrl, { params });
  }

  private apiUrl = 'https://api.correosdemexico.gob.mx/v1';

  // Ejemplo de función para obtener información de una sucursal por código postal
  getSucursalByCodigoPostal(codigoPostal: string): Observable<any> {
    const url = `${this.apiUrl}/sucursales?codigo_postal=${codigoPostal}`;

    return new Observable(observer => {
      axios.get(url)
        .then(response => {
          observer.next(response.data);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }*/

  private apiUrl = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/administrador/cp.php';

  constructor(private http: HttpClient) { }

  consultarCodigoPostal(codigoPostal: string): Observable<any> {
    console.log(codigoPostal, "codigoPostal");
    const url = `${this.apiUrl}?consultarCodigoP=${codigoPostal}`;
    console.log(url, "url");
    return this.http.get<any>(url);
  }

}
