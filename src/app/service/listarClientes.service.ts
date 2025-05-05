import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { caja } from '../models/caja';
import { ApiUrlService } from './api-url.service';

@Injectable({
  providedIn: 'root'
})
export class listarClientesService {
 API: string ;


  constructor(private clienteHttp:HttpClient, 
     private apiUrlService: ApiUrlService) {
      this.API = this.apiUrlService.getBaseUrl(); // Obtiene la URL de la API desde el servicio ApiUrlService
  }

  obternerCliente(){
    return this.clienteHttp.get(this.API)
  }

  consultarCliente(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"?consultar="+id);
  }



// Obtener pedidos por bodega
getPedidosPorBodega(bodegaId: number): Observable<any> {
  const url = `${this.API}getClientesMembresias.php?action=getPedidosPorBodega&bodegaId=${bodegaId}`;
  return this.clienteHttp.get(url);
}

// Ejecutar el procedimiento testProcedure
ObtenerPedidosFechas(param1: string, param2: string, param3: string): Observable<any> {
  const url = `${this.API}getClientesMembresias.php?action=test_procedure&param1=${param1}&param2=${param2}&param3=${param3}`;
  return this.clienteHttp.get(url);
}

// Obtener membresías de un cliente
getClienteMembresias(param1: number, param2: number): Observable<any> {
  const url = `${this.API}getClientesMembresias.php?action=getClienteMembresias&param1=${param1}&param2=${param2}`;
  return this.clienteHttp.get(url);
}






}
