import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiUrlService } from './api-url.service';

@Injectable({
  providedIn: 'root',
})
export class agregarContra {

  API: string ;
 // API: string ='https://olympus.arvispace.com/olimpusGym/EnviarMail/';

  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private clienteHttp: HttpClient,
    private apiUrlService: ApiUrlService
  ) {

    this.API = this.apiUrlService.getBaseUrl(); // Obtiene la URL de la API desde el servicio ApiUrlService
  }

  enviarMail(username: string): Observable<any> {
  const data = { username: username };
  return this.clienteHttp.post<any>(`${this.API}agregarPass.php?solicitaPass`, data);
  }

  validaToken(id: string, token: string): Observable<any> {
    return this.clienteHttp.post(
      this.API + 'agregarPass.php?consultaToken' + '&id=' + id + '&token=' + token,
      {
        headers: this.httpHeaders,
      }
    );
  }

  actualizaPassword(id: string, token: string, nuevaPass: string) : Observable<any> {
    return this.clienteHttp.post(
      this.API + 'agregarPass.php?actualizarPass' + '&id=' + id + '&token=' + token,
      nuevaPass,
      {
        headers: this.httpHeaders,
      }
    );
  }
}
