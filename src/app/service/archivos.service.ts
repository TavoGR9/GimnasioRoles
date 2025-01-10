import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ArchivoService {

//API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
//API: string = 'http://localhost/serviciosGimnasio/'
API: string = 'http://localhost/serviciosGym/'

constructor(private clienteHttp: HttpClient) {
}

guardarArchivos(formData: FormData) {
  return this.clienteHttp.post(this.API+"archivos.php", formData);
}

descargarArchivo(archivo: string): Observable<Blob> {
  const url = `${this.API}descargarArchivo.php?archivo=${archivo}`;
  return this.clienteHttp.get(url, { responseType: 'blob' });
}

downloadFile(nombreArchivo: string): Observable<Blob> {
  if (!nombreArchivo) {
    console.error('El nombre del archivo no está definido');
  }

  return this.clienteHttp.get(`http://localhost/serviciosGym/descargarArchivo.php?archivo=${nombreArchivo}`, {
    responseType: 'blob'
  });
}

}
