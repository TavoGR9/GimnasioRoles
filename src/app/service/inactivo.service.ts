import { Injectable } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { takeUntil, tap, mapTo} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  
  private destroy$ = new Subject<void>();
  private activityDetected$ = new Subject<void>();

  constructor() { }

  startWatchingInactivity(maxInactiveTime: number): Observable<void> {
    return timer(maxInactiveTime).pipe(
      takeUntil(this.destroy$),
      tap(() => {
        console.log('Usuario inactivo');
        this.activityDetected$.next(); // Notificar que se ha detectado inactividad
      }),
      mapTo(undefined) // Transformar el valor emitido por timer a void
    );
  }

  resetTimer(maxInactiveTime: number): void {
    this.destroy$.next(); // Detener temporizador actual si lo hay
    this.destroy$.complete(); // Completar el Subject para limpiarlo

    this.startWatchingInactivity(maxInactiveTime).subscribe(() => {
      console.log('Temporizador de inactividad activado');
      window.location.reload();

      // Verificar si se ha detectado actividad durante el temporizador
      this.activityDetected$.pipe(
        takeUntil(timer(1)) // Esperar 1 ms para verificar la actividad
      ).subscribe(() => {
        console.log('Actividad detectada, no se recarga la página');
      }, () => {
        console.log('No se detectó actividad, se recarga la página');
        window.location.reload(); // Recargar la página solo si no hubo actividad
      });
    });

    // Re-inicializar el Subject destroy$
    this.destroy$ = new Subject<void>();
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Detener temporizador actual si lo hay
    this.destroy$.complete(); // Completar el Subject para limpiarlo
  }
}
