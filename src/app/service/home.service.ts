import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { horario } from '../models/horario';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  API: string = 'http://localhost/plan/' 
  
  constructor(private clienteHttp:HttpClient) {
  }

  consultarHome(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"ConsultasHome.php?consultasHome="+id);
  }

  getAnalyticsData(sucursalId: any): Observable<any> {
    return this.clienteHttp.get(this.API+"ConsultasHome.php?consultarProductosVendidos="+sucursalId);
  }

  getARecientesVentas(sucursalId: any): Observable<any> {
    return this.clienteHttp.get(this.API+"ConsultasHome.php?consultarVentasVendidas="+sucursalId);
  }


}
