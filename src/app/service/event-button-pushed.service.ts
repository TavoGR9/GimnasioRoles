import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventButtonPushedService {
  private eventoActualizacion = new Subject<{ origen: string }>();

  // Observable para escuchar eventos
  evento$ = this.eventoActualizacion.asObservable();

  // Método para emitir eventos
  emitirEvento(origen: string) {
    this.eventoActualizacion.next({ origen });
  }
}
