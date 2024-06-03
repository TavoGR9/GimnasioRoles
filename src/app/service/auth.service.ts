import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';
import { tap,map } from 'rxjs/operators';
import { of, from  } from 'rxjs'; 
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User, dataChart, dataLogin, listaSucursal } from '../models/User';
import { msgResult } from '../models/empleado';
import { ConnectivityService } from './connectivity.service';
import { IndexedDBService } from './indexed-db.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //Servicio para la autentificacion
  //Trabajar con BehaviourSubjects
  public loggedIn = new BehaviorSubject<boolean>(false);
  public role = new BehaviorSubject<string>('');
  public idUser = new BehaviorSubject<number>(0);
  public email = new BehaviorSubject<string>('');
  public idGym = new BehaviorSubject<number>(0);
  public nombreGym = new BehaviorSubject<string>('');
  public encryptedMail = new BehaviorSubject<string>(''); // Varible a utilizar en Sesion Storage
  private readonly USER_KEY = 'olympus'; // Manejar la sesion por Sesion Storage
  usuarioRegistrado: any[] = [];
  public ubicacion!: string;
  userRole: string = '';

  isConnected: boolean = true;


  //API: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/superAdministrador/loginRolev2.php/';
  //APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';

  API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';

  // APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  // APIv3: string = 'http://localhost/olimpusGym/conf/';
  // API: String = '';

  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private router: Router, private clienteHttp: HttpClient, private connectivityService: ConnectivityService, private indexedDBService:IndexedDBService) {
    const encryptedMail = sessionStorage.getItem(this.USER_KEY);
    if (encryptedMail) {
      this.encryptedMail.next(encryptedMail);
    }
  }

  comprobar(): Observable<any> {
    return this.connectivityService.checkInternetConnectivity().pipe(
      map((isConnected: boolean) => {
        if (isConnected) {
          return { status: true, message: "Conectado a Internet" };
        } else {
          return { status: false, message: "Sin conexión a Internet" };
        }
      }),
      catchError(error => {
        console.error("Error al verificar la conectividad:", error);
        // Manejar el error según sea necesario
        return of({ status: false, message: "Error al verificar la conectividad" });
      })
    );
  }

  loginBS(data: User): Observable<any> {
  const url = `${this.API}login.php?email=${data.email}&pass=${data.pass}`;
  return this.clienteHttp.request('GET', url, {responseType:'json'})
      .pipe(
        catchError((err: any) => {
          if (err.status == 0) {
            const errorMessage = err.error;
            return throwError(() => errorMessage);
            
          } else if (err.status === 401) {
            const errorMessage = err.error.message;
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
    return this.clienteHttp.get<listaSucursal>(this.API + 'sucursales.php');
  }

  //Consultar informacion de sucursales
  chart_sucursales(data: any):Observable<any> {
    return this.clienteHttp.post<dataChart>(this.API + 'chart_sucursales.php', data, { headers: this.httpHeaders }).pipe(
      tap(dataResponse => {
          this.saveDataToIndexedDB1(dataResponse);
      }),
      catchError(error => {
          // Intenta obtener los datos de IndexedDB en caso de error
          return this.getDataFromIndexedDB();
      })
  );
  }

  private saveDataToIndexedDB1(data: any) {
    this.indexedDBService.saveReporte1Data('Reporte1DataTable', data);
  }

  getDataFromIndexedDB() {
    // Intenta obtener los datos de IndexedDB
    return new Observable(observer => {
        this.indexedDBService.getReporte1Data('Reporte1DataTable').then(data => {
            if (data && data.length > 0) {
                let maxId = -1;
                let lastData: any;
                data.forEach((record: any) => {
                  if (record.id > maxId) {
                    maxId = record.id;
                    lastData = record.data;
                  }
                });
                observer.next(lastData); // Emitir el último dato encontrado
              } else {
                observer.next(null); // Emitir null si no hay datos en IndexedDB
              }
              observer.complete();
            }).catch(error => {
              observer.error(error); // Emite un error si no se pueden obtener los datos de IndexedDB
            });
        });
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
    return this.clienteHttp.post(this.API + 'fingerprintSave.php', data, { headers: this.httpHeaders });
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
  // dataUser(data: any): Observable<any> {
  //   return this.clienteHttp.post<dataLogin>(this.API + 'datosSSTorage.php?datos', data, { headers: this.httpHeaders});
  // }

  dataUser(data: any): Observable<any> {
    return this.clienteHttp.post<dataLogin>(this.API + 'datosSSTorage.php?datos', data, { headers: this.httpHeaders }).pipe(
      tap(dataResponse => {
        this.saveDataToIndexedDB(dataResponse);
      }),
      catchError(error => {
        return this.getUserDatos();
      })
    );
  }

  private saveDataToIndexedDB(data: any) {
    // Guarda los datos en IndexedDB
    this.indexedDBService.saveUserData('userData', data);
  }

  getUserDatos() {
    return new Observable(observer => {
      this.indexedDBService.getUserData('userData').then(data => {
        if (data && data.length > 0) {
            let maxId = -1;
            let lastData: any;
            data.forEach((record: any) => {
              if (record.id > maxId) {
                maxId = record.id;
                lastData = record.data;
              }
            });
            observer.next(lastData); // Emitir el último dato encontrado
          } else {
            observer.next(null); // Emitir null si no hay datos en IndexedDB
          }
          observer.complete();
        }).catch(error => {
          observer.error(error); // Emite un error si no se pueden obtener los datos de IndexedDB
        });
  });
  }

  hasAnyRole(expectedRoles: string[]): boolean {
    const userRole = this.role.getValue();
    return expectedRoles.includes(userRole);
  }

}
