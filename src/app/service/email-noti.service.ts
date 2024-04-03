import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class notificaciones {
 
  API: string ='https://olympus.arvispace.com/gimnasioRoles/configuracion/EnviarMail/';
  
  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private clienteHttp: HttpClient) {}

  enviarMail(nombre: string, texto: string, archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('texto', texto);
    formData.append('archivo', archivo);
    return this.clienteHttp.post(this.API+"enviarNotificacion.php", formData);
  }

  enviarMailTrabajadores(nombre: string, texto: string, archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('texto', texto);
    formData.append('archivo', archivo);
    return this.clienteHttp.post(this.API+"enviarNotificacionTrabajador.php", formData);
  }
}