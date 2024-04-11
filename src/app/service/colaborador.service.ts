import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject  } from 'rxjs';
import { listaEmpleados, msgResult, registrarEmpleado } from '../models/empleado';
import { tap } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ConnectivityService } from './connectivity.service';

@Injectable({
    providedIn: 'root'
})

export class ColaboradorService {

    isConnected: boolean = true;

    //Servicio para la manipulacion de datos de un colaborador.

    private categoriasSubject = new BehaviorSubject<any[]>([]);
    APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
    APIv3: string = 'http://localhost/olimpusGym/conf/';
    API: String = '';

    constructor(private clienteHttp:HttpClient, private connectivityService: ConnectivityService) {
        //this.comprobar();
    }
    comprobar(){
        this.connectivityService.checkInternetConnectivity().subscribe((isConnected: boolean) => {
          this.isConnected = isConnected;
          if (isConnected) {
            this.API = this.APIv2;
          } else {
            this.API = this.APIv3;
          }
        });
      }
    
    //servicio correspondiente a llenado de los datos del combo nombre Gym
    comboDatosGym(gimID: any){
        return this.clienteHttp.get(this.API+"empleado.php?nomGym="+gimID);
    }

    comboDatosGymByNombre(gimName: any){
        return this.clienteHttp.get(this.API+"empleado.php?nameGym="+gimName);
    }

    agregarEmpleado(datosEmpleado: any): Observable<any> {
        return this.clienteHttp.post(this.API + "empleado.php?insertar=1", datosEmpleado);
    }

    agregarUsuario(datosEmpleado: any): Observable<any> {
        return this.clienteHttp.post(this.API + "empleado.php?insertarUsuario", datosEmpleado);
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






    MostrarRecepcionistas(idGym: any) {
        let headers: any = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        let params = 'idGym=' + idGym;
        return this.clienteHttp.post(this.API + 'ser_mostrar_Recepcionistas.php', params, { headers });
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
  }
  