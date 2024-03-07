import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class agregarContra {

  //Servicio para mandar correo una vez que el usuario se registre y agregar su contraseña
  
  API: string ='https://olympus.arvispace.com/gimnasioRoles/configuracion/EnviarMail/agregarPass.php';

  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private clienteHttp: HttpClient) {

  }

  enviarMail(username: string): Observable<any> {
  const data = { username: username };
  return this.clienteHttp.post<any>(`${this.API}?solicitaPass`, data);
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
