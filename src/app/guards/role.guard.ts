import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { timer } from 'rxjs';
import { delay } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})

export class RoleGuard implements CanActivate {

  private rol: string = '';

  constructor(private authService: AuthService, private router: Router) {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.getSSdata(JSON.stringify(currentUser));
    }
    this.authService.role.subscribe((data) => {
    this.rol = data;
    });
  }

  getSSdata(data: any) {
    this.authService.dataUser(data).subscribe({
      next: (resultData) => {
        this.authService.loggedIn.next(true);
        this.authService.role.next(resultData.rolUser);
        this.authService.idUser.next(resultData.id);
        this.authService.idGym.next(resultData.idGym);
        this.authService.nombreGym.next(resultData.nombreGym);
        this.authService.email.next(resultData.email);
        this.authService.encryptedMail.next(resultData.encryptedMail);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return of(null).pipe(
      delay(1000),
      switchMap(() => {
        const userRole = this.authService.getRole(); // Obtiene el rol del usuario.
        const expectedRole = (route.data as { userRole: string }).userRole; // Obtiene el rol esperado de la ruta.
  
        if (!userRole) {
          // Si el rol del usuario no está disponible, redirige a la página de inicio.
          this.router.navigate(['/']);
          return of(false);
        }
  
        if (userRole === 'SuperAdmin') {
          // Si el usuario es SuperAdmin, verifica si la ruta es exclusivamente para ellos.
          if (expectedRole === 'SuperAdmin') {
            return of(true); // Permite el acceso a rutas de SuperAdmin.
          } else {
            this.router.navigate(['/listaSucursales']); // Redirige si intenta acceder a otras rutas.
            return of(false);
          }
        }
  
        // Permite el acceso si el rol del usuario coincide con el rol esperado.
        if (userRole === expectedRole) {
          return of(true);
        }
  
        // Reglas adicionales para roles específicos.
        if (expectedRole === 'Administrador' && userRole === 'Administrador') {
          return of(true);
        }
  
        if (expectedRole === 'Recepcionista' && (userRole === 'Administrador' || userRole === 'Recepcionista')) {
          return of(true);
        }
  
        // Redirige al home si no tiene acceso.
        if (userRole === 'Administrador' || userRole === 'Recepcionista') {
          this.router.navigate(['/home']);
        } else if (userRole === 'SuperAdmin') {
          this.router.navigate(['/listaSucursales']);
        }
        return of(false);
      })
    );
  }
  

}







