import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private onlineSubject = new BehaviorSubject<boolean>(navigator.onLine);

  constructor() {
    const online$ = fromEvent(window, 'online').pipe(mapTo(true));
    const offline$ = fromEvent(window, 'offline').pipe(mapTo(false));

    // Actualizar el estado cuando cambie la conexión
    merge(online$, offline$).subscribe(this.onlineSubject);
  }

  // Obtener el estado actual como un Observable
  get isOnline$(): Observable<boolean> {
    return this.onlineSubject.asObservable();
  }

  // Obtener el estado actual directamente
  get isOnline(): boolean {
    return this.onlineSubject.value;
  }
}