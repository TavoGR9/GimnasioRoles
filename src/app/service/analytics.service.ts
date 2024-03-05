import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private apiUrl = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/administrador/estadisticasGym.php';  // 

  constructor(private http: HttpClient) {}

  getAnalyticsData(sucursalId: any): Observable<any> {
    return this.http.get(this.apiUrl+"?consultarProductosVendidos="+sucursalId);
  }

  getARecientesVentas(sucursalId: any): Observable<any> {
    return this.http.get(this.apiUrl+"?consultarVentasVendidas="+sucursalId);
  }

  getClientesActivos(sucursalId: any): Observable<any> {
    return this.http.get(this.apiUrl+"?consultarClientesActivos="+sucursalId);
  }
}
