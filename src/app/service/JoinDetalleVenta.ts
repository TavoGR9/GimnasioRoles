import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConnectivityService } from './connectivity.service';

@Injectable({
  providedIn: 'root'
})
export class JoinDetalleVentaService {


  isConnected: boolean = true;
  //API: string = 'https://olympus.arvispace.com/olimpusGym/conf/'

  APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  APIv3: string = 'http://localhost/olimpusGym/conf/';
  API: String = '';

  constructor(private clienteHttp:HttpClient, private connectivityService: ConnectivityService) {
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

  consultarProductosVentas(Gimnasio_idGimnasio: number | null): Observable<any[]> {
    const body = { Gimnasio_idGimnasio };
    const url = `${this.API}venta_detalleVenta.php?ventasDetalle`;
    return this.clienteHttp.post<any[]>(url, body);
  }

  consultarProductosGimnasio(idGimnasio: number | null): Observable<any[]> {
    const url = `${this.API}venta_detalleVenta.php?consultar=true&Gimnasio_idGimnasio=${idGimnasio}`;
    return this.clienteHttp.get<any[]>(url);
  }

}
