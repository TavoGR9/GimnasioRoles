import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { horario } from '../models/horario';
import { ConnectivityService } from './connectivity.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  isConnected: boolean = true;

  //API: string = 'https://olympus.arvispace.com/olimpusGym/conf/'

  APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  APIv3: string = 'http://localhost/olimpusGym/conf/';
  API: String = '';
  
  constructor(private clienteHttp:HttpClient,private connectivityService: ConnectivityService ) {
  }

  comprobar(){
    this.connectivityService.checkInternetConnectivity().subscribe((isConnected: boolean) => {
      this.isConnected = isConnected;
      if (isConnected) {
        this.API = this.APIv2;
      } else {
        this.API = this.APIv3;
      }
    });
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
