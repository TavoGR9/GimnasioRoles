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

  constructor(private router: Router, private clienteHttp: HttpClient) {
  
  }
  public idGym!: number;
  usuarioRegistrado: any[] = [];
  public ubicacion!: string;
  idUsuario:number =0;
  

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

//Graficas *** Graficas *** Graficas *** Graficas *** Graficas *** Graficas *** Graficas ***
chart_sucursales(data: any):Observable<any> {
  return this.clienteHttp.post(this.APIv2 + 'login.php', data, { headers: this.httpHeaders });
}

getUserData(): any | null {
  const localData = localStorage.getItem('userData');
  if (localData != null) {
    return JSON.parse(localData);
  }
  return null;
}
getIdGym():number{
  this.usuarioRegistrado = this.getUserData();
  this.idGym=this.usuarioRegistrado[0].idGym;
  return this.idGym;
}

getUbicacion(): string {
  this.usuarioRegistrado = this.getUserData();
  this.ubicacion = this.usuarioRegistrado[0].nombreGym;
  return this.ubicacion;
}
getIdUsuario():number{
  this.usuarioRegistrado = this.getUserData();
  this.idUsuario = this.usuarioRegistrado[0].idUsuarios;
  return this.idUsuario;
}

}
