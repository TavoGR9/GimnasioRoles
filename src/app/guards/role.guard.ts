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
        this.authService.userId.next(resultData.id);
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
        const userRole = this.authService.getRole();
        const expectedRole = (route.data as { userRole: string }).userRole;

        if (!userRole) {
          // Si el rol del usuario no está disponible, redirige a la página de inicio o a una página de acceso no autorizado.
          this.router.navigate(['/']);
          return of(false);
        } else if (userRole === expectedRole) {
          // Si el rol del usuario coincide con el rol requerido para la ruta, permite el acceso.
          return of(true);
        } else {
          // Verifica si el usuario tiene acceso a las rutas compartidas entre "Administrador" y "Recepcionista"
          if ((userRole === "Administrador" || userRole === "Recepcionista") && 
              (expectedRole == "Administrador" || expectedRole == "Recepcionista")) {
            return of(true);
          }
          // Verifica si el usuario es "SuperAdmin"
          else if (userRole === "SuperAdmin" && expectedRole === "SuperAdmin") { 
            this.router.navigate(['/listaSucursales']);
            return of(false);
          }
          // Si el rol del usuario no coincide con el rol requerido para la ruta, redirige a otra página.
          else {
            if(userRole === "Administrador" || userRole === "Recepcionista"){
              this.router.navigate(['/home']);
            }
             else if (userRole === "SuperAdmin"){ 
              this.router.navigate(['/listaSucursales']);
            }
            return of(false);
          }
        }
      })
    );
}

}


  
  



