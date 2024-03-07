import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ArchivoService {

//Servicio para guardar archivos.
API: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/superAdministrador/archivos.php';

constructor(private clienteHttp: HttpClient) {
}

guardarArchivos(formData: FormData) {
  return this.clienteHttp.post(this.API, formData);
}

}