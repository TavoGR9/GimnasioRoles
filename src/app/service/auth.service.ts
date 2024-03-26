import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';

//para conectarse al api
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User, dataChart, dataLogin, listaSucursal } from '../models/User';
import { msgResult } from '../models/empleado';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //Servicio para la autentificacion
  //Trabajar con BehaviourSubjects
  public loggedIn = new BehaviorSubject<boolean>(false);
  public role = new BehaviorSubject<string>('');
  public userId = new BehaviorSubject<number>(0);
  public email = new BehaviorSubject<string>('');
  public idGym = new BehaviorSubject<number>(0);
  public nombreGym = new BehaviorSubject<string>('');
  public encryptedMail = new BehaviorSubject<string>(''); // Varible a utilizar en Sesion Storage
  private readonly USER_KEY = 'olympus'; // Manejar la sesion por Sesion Storage
  usuarioRegistrado: any[] = [];
  public ubicacion!: string;
  idUsuario:number =0;
  
   //variable que guarda el endpoint en el srver API: string = 'conf/';
   API: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/superAdministrador/loginRolev2.php/';
  // APIv2: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/superAdministrador/api/';
  //APIv2: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/superAdministrador/';
    APIv2: string = 'http://localhost/plan/';
   //para guardar los headers que manda el API
   httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private router: Router, private clienteHttp: HttpClient) {
    const encryptedMail = sessionStorage.getItem(this.USER_KEY);
    if (encryptedMail) {
      this.encryptedMail.next(encryptedMail);
    }
  }

  //Metodos de login usando BehaviourSubject
  /*loginBS(data: User): Observable<any> {
    console.log(data, "dataa");
    console.log('login.php' + data)
    return this.clienteHttp.post<dataLogin>(this.APIv2 + 'login.php' + data, { headers: this.httpHeaders })
    .pipe(
     catchError((err: any) => {
       if (err.status === 401) {
         const errorMessage = err.error.message;
         // this.toastr.error(errorMessage,'Error');
         //  alert(`Error 401: ${errorMessage}`);
         return throwError(() => errorMessage);
       } else {
         return throwError(() => 'Error desconocido');
       }
     })
   );
 }*/

 loginBS(data: User): Observable<any> {

  const url = `${this.APIv2}login.php?email=${data.email}&pass=${data.pass}`;
  console.log("url", url);

  // Realiza la solicitud POST con la URL construida
  return this.clienteHttp.request('GET', url, {responseType:'json'})
  //return this.clienteHttp.post<dataLogin>(url, data)
      .pipe(
        catchError((err: any) => {
          console.log("err", err);
          console.log("err", err.status);
          if (err.status == 0) {
            console.log(throwError, "throwError");
            const errorMessage = err.error;
            // Maneja el caso en que el servidor devuelve "0"
            return throwError(() => errorMessage);
            
          } else if (err.status === 401) {
            // Maneja el error 401 si es necesario
            const errorMessage = err.error.message;
            return throwError(() => errorMessage);
           
          } else {
            // Maneja otros errores desconocidos
            return throwError(() => 'Error desconocido');
          }
        })
      );
  }




 logoutBS(): void {
  this.loggedIn.next(false);
  this.role.next('');
  this.clearCurrentUser();  // Borrar informacion de usuario en sesion storage
  this.router.navigate(['login'], { replaceUrl: true });
}

isLoggedInBS(): boolean {
  return this.loggedIn.getValue();
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

getRole(): string {
  return this.role.getValue();
}

//Graficas *** Graficas *** Graficas *** Graficas *** Graficas *** Graficas *** Graficas ***
//Traer lista de sucursales
list_sucursales():Observable<any> {
  return this.clienteHttp.get<listaSucursal>(this.APIv2 + 'sucursales.php');
}

//Consultar informacion de sucursales
chart_sucursales(data: any):Observable<any> {
  return this.clienteHttp.post<dataChart>(this.APIv2 + 'chart_sucursales.php', data, { headers: this.httpHeaders });
}

getUserData(): any | null {
  const localData = localStorage.getItem('userData');
  if (localData != null) {
    return JSON.parse(localData);
  }
  return null;
}

logout() {
  localStorage.removeItem('userData');
  this.router.navigate(['login']);
  localStorage.removeItem('lastInsertedId'); // Aquí eliminas lastInsertedId al cerrar sesión
}

// Guardar huella dactilar en BD
saveFingerprint(data: any): Observable<any>{
  return this.clienteHttp.post(this.APIv2 + 'fingerprintSave.php', data, { headers: this.httpHeaders });
}

// Almacenar información del usuario en sessionStorage
setCurrentUser(userData: { olympus: string } ): void {
  this.encryptedMail.next(userData.olympus);
  sessionStorage.setItem(this.USER_KEY, JSON.stringify(userData));
}

// Obtener información del usuario desde sessionStorage
getCurrentUser(): string {
  const userString = sessionStorage.getItem(this.USER_KEY);
  return userString ? JSON.parse(userString) : null;
}

// Limpiar información del usuario al cerrar sesión
clearCurrentUser(): void {
  sessionStorage.removeItem(this.USER_KEY);
}

// Traer datos de usuario logeaddo
dataUser(data: any): Observable<any> {
  console.log("dataaaaaaaaaaaaa", data);
  return this.clienteHttp.post<dataLogin>(this.APIv2 + 'datosSStorage.php?datos', data, { headers: this.httpHeaders});
}

// Valiodar huella
testSpringBoot(data: any):Observable<any> {
  return this.clienteHttp.post<msgResult>(this.APIv2 + 'fingerAuth.php', data, { headers: this.httpHeaders});
}

hasAnyRole(expectedRoles: string[]): boolean {
  const userRole = this.role.getValue();
  return expectedRoles.includes(userRole);
}

}
