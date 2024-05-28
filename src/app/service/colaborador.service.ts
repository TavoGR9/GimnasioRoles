import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject  } from 'rxjs';
import { listaEmpleados, msgResult, registrarEmpleado } from '../models/empleado';
import { tap } from 'rxjs/operators';
import { catchError, of } from 'rxjs';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ConnectivityService } from './connectivity.service';
import { IndexedDBService } from './indexed-db.service';

@Injectable({
    providedIn: 'root'
})

export class ColaboradorService {

    isConnected: boolean = true;

    //Servicio para la manipulacion de datos de un colaborador.

    private categoriasSubject = new BehaviorSubject<any[]>([]);
    // APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
    // APIv3: string = 'http://localhost/olimpusGym/conf/';
    // API: String = '';

    API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';

    constructor(private clienteHttp:HttpClient, private connectivityService: ConnectivityService, private indexedDBService:IndexedDBService) {
        //this.comprobar();
    }
    // comprobar(){
    //     this.connectivityService.checkInternetConnectivity().subscribe((isConnected: boolean) => {
    //       this.isConnected = isConnected;
    //       if (isConnected) {
    //         this.API = this.APIv2;
    //       } else {
    //         this.API = this.APIv3;
    //       }
    //     });
    //   }
    
    //servicio correspondiente a llenado de los datos del combo nombre Gym
    comboDatosGym(gimID: any){
        return this.clienteHttp.get(this.API+"empleado.php?nomGym="+gimID);
    }

    comboDatosGymByNombre(gimName: any){
        return this.clienteHttp.get(this.API+"empleado.php?nameGym="+gimName);
    }

    agregarPersonal(datos: any): Observable<any> {
      const data ={nombre: datos}
      return this.clienteHttp.post(this.API + "empleado.php?insertarPersonal=1", data);
    }

    obtenerPersonalPorNombre(nombre:any):Observable<any>{

      return this.clienteHttp.get(this.API+"empleado.php?personalName="+nombre);
    }  

    getPersonal(): Observable<any> {
      return this.clienteHttp.get(this.API + "empleado.php?consultarPersonal");
    }

    agregarEmpleado(datosEmpleado: any): Observable<any> {
        return this.clienteHttp.post(this.API + "empleado.php?insertarRep=1", datosEmpleado).pipe(
            tap(dataResponse => {
            }),
            catchError(error => {
              this.saveDataToIndexedDB(datosEmpleado);
              const resultData = { success: '2' };
              return of(resultData);        
            })
          );
    }

    agregarEmpleadoA(datosEmpleado: any): Observable<any> {
        return this.clienteHttp.post(this.API + "empleado.php?insertar=1", datosEmpleado).pipe(
            tap(dataResponse => {
            }),
            catchError(error => {
              this.saveDataToIndexedDB(datosEmpleado);
              const resultData = { success: '2' };
              return of(resultData);        
            })
          );
    }

        private saveDataToIndexedDB(data: any) {
            // Guarda los datos en IndexedDB
            this.indexedDBService.saveAgregarEmpleadoData('AgregarEmpleado', data);
        }



    correoEmpleado(correo: string): Observable<any> {
        return this.clienteHttp.post<any>(this.API + "empleado.php?consultarCorreo", { correo });
    }

    private saveDataToIndexedDBC(data: any) {
        // Guarda los datos en IndexedDB
        this.indexedDBService.saveAgregarRegistroData('AgregarRegistro', data);
    }

    agregarUsuario(datosEmpleado: any): Observable<any> {
        return this.clienteHttp.post(this.API + "empleado.php?insertarUsuario", datosEmpleado).pipe(
            tap(dataResponse => {
            }),
            catchError(error => {
              this.saveDataToIndexedDBC(datosEmpleado);
              const resultData = { success: '2' };
              return of(resultData);        
            })
          );
    }

    agregarUsuarioBodega(datosEmpleado: any): Observable<any> {
        return this.clienteHttp.post(this.API + "empleado.php?insertarUsuarioBodega", datosEmpleado);
    }

    agregarBodegaEmpleado(datosEmpleado: any): Observable<any> {
        return this.clienteHttp.post(this.API + "BodegaEmpleado.php?insertar=1", datosEmpleado);
    }
      
    comboDatosAllGym(){
        return this.clienteHttp.get(this.API+"empleado.php?nomAllGym");
    }

    listaColaboradores():Observable<any[]>{
        return this.clienteHttp.get<any[]>(this.API+"empleado.php?tEmp");   
    }

    getCategoriasSubject() {
        return this.categoriasSubject.asObservable();
    }

    listaRecepcionistas(idGym: any):Observable<any[]>{
        return this.clienteHttp.get<any[]>(this.API+"empleado.php?tEmpRec="+idGym)
        .pipe(
            tap((nuevasCategorias: any[]) => {
              this.categoriasSubject.next(nuevasCategorias);
            })
          );
    }

    //servicio correspondiente a traer datos para la actualizacion de empleado
    consultarIdEmpleado(id: any):Observable<any>{
        return this.clienteHttp.get<listaEmpleados>(this.API+"empleado.php?obtEmp="+id);
    }

    //servicio correspondiente a la actualizacion del empleado
    actualizaEmpleado(id: any, datosEmpleado: listaEmpleados):Observable<any>{
        let headers: any = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        return this.clienteHttp.post<msgResult>(this.API+"empleado.php?actEmp="+id,datosEmpleado, {headers});
    }   






    // MostrarRecepcionistas(idGym: any) {
    //     let headers: any = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    //     let params = 'idGym=' + idGym;
    //     return this.clienteHttp.post(this.API + 'ser_mostrar_Recepcionistas.php', params, { headers });
    //   }
    MostrarRecepcionistas(idGym: any) {
        let headers: any = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        let params = 'idGym=' + idGym;
        return this.clienteHttp.post(this.API + 'ser_mostrar_Recepcionistas.php', params, { headers }).pipe(
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
        // Guarda los datos en IndexedDB
        this.indexedDBService.saveData('receptionists', data);
    }
    
     getDataFromIndexedDB() {
        // Intenta obtener los datos de IndexedDB
        return new Observable(observer => {
            this.indexedDBService.getData('receptionists').then(data => {
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




    
    InfoIdEmpleado(idEmp: any) {
        let headers: any = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        let params = 'idEmp=' + idEmp;
        return this.clienteHttp.post(this.API + 'ser_mostrar_Recepcionistas.php', params, { headers });
      }

      ActualizarColaborador(pid_bodega: number, pnombreCompleto: String, pCorreoEmpleado: String, ptelefono: String, pidEmp: String) {
        let headers: any = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        let params = 'pid_bodega=' + pid_bodega + '&pnombreCompleto=' + pnombreCompleto + '&pCorreoEmpleado=' + pCorreoEmpleado + '&ptelefono=' + ptelefono + '&pidEmp=' + pidEmp;
        return this.clienteHttp.post(this.API + 'ser_mostrar_Recepcionistas.php', params, { headers });
      }

      actualizarEstatus(idGimnasio: any, estatus: any, correo:any): Observable<any> {
        let body = new URLSearchParams();
        body.set('idEmpleado', idGimnasio);
        body.set('correo', correo);
        body.set('estatus', estatus.toString());
        body.set('actualizarEstatus', '1');
        let options = {
          headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
        };
        return this.clienteHttp.post(this.API+"empleado.php?actualizaEstatus", body.toString(), options);
      }
  }
  