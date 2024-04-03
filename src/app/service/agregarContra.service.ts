import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class agregarContra {

  API: string ='https://olympus.arvispace.com/gimnasioRoles/configuracion/EnviarMail/';

  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private clienteHttp: HttpClient) {
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
