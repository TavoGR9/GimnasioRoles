import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private onlineSubject = new BehaviorSubject<boolean>(navigator.onLine);

  constructor() {
    // Se escuchan los eventos 'online' y 'offline' del navegador
    const online$ = fromEvent(window, 'online').pipe(map(() => true));
    const offline$ = fromEvent(window, 'offline').pipe(map(() => false));
    merge(online$, offline$).subscribe(status => this.onlineSubject.next(status));
  }

  // Verificación real de acceso a internet mediante una petición HEAD a Google
  checkInternetAccess(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      fetch('https://api.ipify.org?format=json', { method: 'GET' })
        .then(response => {
          // Si la respuesta es exitosa, se asume que hay conexión
          if (response.ok) {
            observer.next(true);
          } else {
            observer.next(false);
          }
          observer.complete();
        })
        .catch(() => {
          observer.next(false);
          observer.complete();
        });
    }).pipe(
      catchError(() => of(false))
    );
  }
  
  

  // Observable combinado: si el navegador dice que está online, se realiza la verificación real;
  // de lo contrario, se emite false inmediatamente
  get combinedOnline$(): Observable<boolean> {
    return this.onlineSubject.asObservable().pipe(
      switchMap(isOnline => {
        if (!isOnline) {
          return of(false);
        }
        return this.checkInternetAccess();
      })
    );
  }

  // Observable que expone el estado online según el navegador
  get isOnline$(): Observable<boolean> {
    return this.onlineSubject.asObservable();
  }

  // Valor actual del estado online (según el navegador)
  get isOnline(): boolean {
    return this.onlineSubject.value;
  }
}