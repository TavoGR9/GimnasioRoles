import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordService {

  API: string ='olympus.arvispace.com/olimpusGym/EnviarMail/nuevaContra.php/';

  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private clienteHttp: HttpClient) {}

  enviarMail(email: string): Observable<any> {
    console.log(this.API + '?solicitaNuevaPass', email);
    
    return this.clienteHttp.post(this.API + '?solicitaNuevaPass', email);
  }

  validaToken(id: string, token: string): Observable<any> {
    return this.clienteHttp.post(
      this.API + '?consultaToken' + '&id=' + id + '&token=' + token,
      {
        headers: this.httpHeaders,
      }
    );
  }

  actualizaPassword(id: string, token: string, nuevaPass: string) : Observable<any> {
    return this.clienteHttp.post(
      this.API + '?actualizarPass' + '&id=' + id + '&token=' + token,
      nuevaPass,
      {
        headers: this.httpHeaders,
      }
    );
  }
}
