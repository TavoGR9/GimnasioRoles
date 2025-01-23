import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private onlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  constructor() {
    const online$ = fromEvent(window, 'online').pipe(map(() => true));
    const offline$ = fromEvent(window, 'offline').pipe(map(() => false));

    merge(online$, offline$).subscribe(this.onlineSubject);
  }

  // Verifica acceso real a un servidor
  checkInternetAccess(): Observable<boolean> {
    return timer(0, 30000).pipe( // Comprueba cada 30 segundos
      switchMap(() => fetch('https://www.google.com', { method: 'HEAD' })
        .then(() => true)
        .catch(() => false)
      ),
      catchError(() => of(false))
    );
  }

  get isOnline$(): Observable<boolean> {
    return this.onlineSubject.asObservable();
  }

  get isOnline(): boolean {
    return this.onlineSubject.value;
  }
}