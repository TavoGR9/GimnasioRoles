import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SucursalService {
  private actualizarDatosSource = new BehaviorSubject<boolean>(false);  // Emite cuando se debe actualizar la tabla
  actualizarDatos$ = this.actualizarDatosSource.asObservable();

  // Método para emitir el evento de actualización
  actualizarDatos() {
    this.actualizarDatosSource.next(true);
  }
}
