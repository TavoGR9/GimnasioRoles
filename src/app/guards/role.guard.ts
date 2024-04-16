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
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  
    const expectedRole = route.data['expectedRole'];
    const userRole = this.authService.getRole();

    if (  expectedRole === 'Administrador'||   expectedRole === 'Recepcionista') {
      // Permitir acceso para 'Administrador' y 'Recepcionista' a la ruta específica
      return true;
    } 

    else {
      if( userRole === 'Administrador'||  userRole === 'Recepcionista'){
        this.router.navigate(['/home']);
        // El usuario no tiene el rol esperado, redirigir a una página de acceso no autorizado o a la página principal
        return false;
         // Añade este retorno si el acceso es permitido
      } else {
        return true;
      }
    }
  }
}
  
  



