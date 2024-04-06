import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordService {

  API: string ='https://olympus.arvispace.com/olimpusGym/EnviarMail/';

  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private clienteHttp: HttpClient) {}

  enviarMail(email: string): Observable<any> {
    console.log(this.API + 'nuevaContra.php?solicitaNuevaPass', email);
    
    return this.clienteHttp.post(this.API + 'nuevaContra.php?solicitaNuevaPass', email);
  }

  validaToken(id: string, token: string): Observable<any> {
    return this.clienteHttp.post(
      this.API + 'nuevaContra.php?consultaToken' + '&id=' + id + '&token=' + token,
      {
        headers: this.httpHeaders,
      }
    );
  }

  actualizaPassword(id: string, token: string, nuevaPass: string) : Observable<any> {
    return this.clienteHttp.post(
      this.API + 'nuevaContra.php?actualizarPass' + '&id=' + id + '&token=' + token,
      nuevaPass,
      {
        headers: this.httpHeaders,
      }
    );
  }
}
