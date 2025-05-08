import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiUrlService {
  
 //private readonly baseUrl: string = 'https://gimnasios.arvispace.com/ServiciosGym/';

private readonly baseUrl: string = 'http://localhost/serviciosGym/';


  constructor() {}

  getBaseUrl(): string {
    return this.baseUrl;
  }
}
