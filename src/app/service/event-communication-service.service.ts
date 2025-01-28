import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventCommunicationServiceService {

  private eventSubject = new Subject<{ modalId: string, data?: any }>();

  // Observable al que los componentes se suscriben
  eventTriggered$ = this.eventSubject.asObservable();

  // Método para emitir eventos
  triggerEvent(modalId: string, data?: any) {
    //console.log(`Evento emitido por: ${modalId}`, data); // Log para depuración
    this.eventSubject.next({ modalId, data });
  }
}