// postal-code.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostalCodeService {
  private nominatimUrl = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) {}

  getAddressByPostalCode(postalCode: string): Observable<any> {
    const params = {
      format: 'json',
      postalcode: postalCode,
      country: 'MX', // Replace with the appropriate country code
    };

    return this.http.get<any[]>(this.nominatimUrl, { params });
  }
}
