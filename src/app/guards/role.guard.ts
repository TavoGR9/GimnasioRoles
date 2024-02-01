import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const expectedRole = route.data['expectedRole']; // Accede a 'expectedRole' con ['expectedRole']

    // Aquí obtén el rol del usuario utilizando el método getRole de AuthService
    const userRole = this.authService.getRole();

    if (expectedRole === 'Administrador' || expectedRole === 'Recepcionista') {
      // Permitir acceso para 'Administrador' y 'Recepcionista' a la ruta específica
      return true;
    } else {
      // Lógica normal para otros roles
      if (!this.checkRole(userRole, expectedRole)) {
        // El usuario no tiene el rol esperado, redirigir a una página de acceso no autorizado o a la página principal
        this.router.navigate(['/home']);
        return false;
      }

      return true;
    }
  }

  private checkRole(userRole: string, expectedRole: string): boolean {
    // Aquí puedes personalizar la lógica de comparación según tus necesidades
    // Puedes considerar implementar una lógica más avanzada aquí
    return userRole === expectedRole;
  }
}
