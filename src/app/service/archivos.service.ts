import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ArchivoService {
API: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/superAdministrador/archivos.php';

constructor(private clienteHttp: HttpClient) {}

/*guardarArchivos(formData: FormData): Observable<any> {
  const url = `${this.API}?insertarDoc`;  

  return this.clienteHttp.post<any>(url, formData)
    .pipe(
      catchError(error => {
        console.error('Error en la solicitud:', error);
        return throwError('Error en la solicitud. Consulta la consola para más detalles.');
      })
    );
}*/

guardarArchivos(formData: FormData) {
  return this.clienteHttp.post(this.API, formData);
}

}