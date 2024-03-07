import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { horario } from '../models/horario';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  API: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/superAdministrador/ConsultasHome.php' 
  
  constructor(private clienteHttp:HttpClient) {
  }

  consultarHome(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"?consultasHome="+id);
  }

  getAnalyticsData(sucursalId: any): Observable<any> {
    return this.clienteHttp.get(this.API+"?consultarProductosVendidos="+sucursalId);
  }

  getARecientesVentas(sucursalId: any): Observable<any> {
    return this.clienteHttp.get(this.API+"?consultarVentasVendidas="+sucursalId);
  }


}
