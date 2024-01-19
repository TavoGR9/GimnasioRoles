import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';

//para conectarse al api
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User, dataLogin } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //Trabajar con BehaviourSubjects
  public loggedIn = new BehaviorSubject<boolean>(false);
  public role = new BehaviorSubject<string>('');
  public userId = new BehaviorSubject<number>(0);

   //variable que guarda el endpoint en el srver API: string = 'conf/';
   API: string = 'https://olympus.arvispace.com/puntoDeVenta/conf/loginRolev2.php/';
   APIv2: string = 'https://olympus.arvispace.com/puntoDeVenta/conf/api/';
   //para guardar los headers que manda el API
   httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private router: Router, private clienteHttp: HttpClient) {}

  //Metodos de login usando BehaviourSubject
  loginBS(data: User): Observable<any> {
    return this.clienteHttp.post<dataLogin>(this.APIv2 + 'login.php', data, { headers: this.httpHeaders })
    .pipe(
     catchError((err: any) => {
       if (err.status === 401) {
         this.router.navigate(['/login']);
         const errorMessage = err.error.message;
         // this.toastr.error(errorMessage,'Error');
         //  alert(`Error 401: ${errorMessage}`);
         return throwError(() => errorMessage);
       } else {
         return throwError(() => 'Error desconocido');
       }
     })
   );
 }

 logoutBS(): void {
  this.loggedIn.next(false);
  this.role.next('');
}

isLoggedInBS(): boolean {
  return this.loggedIn.getValue()
}

isAdmin(): boolean {
  return this.role.getValue() === 'Administrador';
}

isRecepcion(): boolean {
  return this.role.getValue() === 'Recepcionista';
}

isSupadmin():boolean {
  return this.role.getValue() === 'SuperAdmin';
}

 
}
