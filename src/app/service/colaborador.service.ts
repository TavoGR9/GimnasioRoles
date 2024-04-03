import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject  } from 'rxjs';
import { listaEmpleados, msgResult, registrarEmpleado } from '../models/empleado';
import { tap } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';


@Injectable({
    providedIn: 'root'
})

export class ColaboradorService {

    //Servicio para la manipulacion de datos de un colaborador.

    private categoriasSubject = new BehaviorSubject<any[]>([]);

    API: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/recepcion/empleado.php';
    API2: string = 'http://localhost/plan/empleado.php';
    API3: string = 'http://localhost/plan/BodegaEmpleado.php';

    APIL: string = 'http://localhost/plan/';

    constructor(private clienteHttp:HttpClient) {
    }
    
    //servicio correspondiente a llenado de los datos del combo nombre Gym
    comboDatosGym(gimID: any){
        return this.clienteHttp.get(this.API+"?nomGym="+gimID);
    }

    comboDatosGymByNombre(gimName: any){
        return this.clienteHttp.get(this.API+"?nameGym="+gimName);
    }

    agregarEmpleado(datosEmpleado: any): Observable<any> {
        return this.clienteHttp.post(this.API2 + "?insertar=1", datosEmpleado);
    }

    agregarUsuario(datosEmpleado: any): Observable<any> {
        return this.clienteHttp.post(this.API2 + "?insertarUsuario", datosEmpleado);
    }

    agregarUsuarioBodega(datosEmpleado: any): Observable<any> {
        return this.clienteHttp.post(this.API2 + "?insertarUsuarioBodega", datosEmpleado);
    }

    agregarBodegaEmpleado(datosEmpleado: any): Observable<any> {
        return this.clienteHttp.post(this.API3 + "?insertar=1", datosEmpleado);
    }
      
    comboDatosAllGym(){
        return this.clienteHttp.get(this.API+"?nomAllGym");
    }

    listaColaboradores():Observable<any[]>{
        return this.clienteHttp.get<any[]>(this.API+"?tEmp");   
    }

    getCategoriasSubject() {
        return this.categoriasSubject.asObservable();
    }

    listaRecepcionistas(idGym: any):Observable<any[]>{
        return this.clienteHttp.get<any[]>(this.API+"?tEmpRec="+idGym)
        .pipe(
            tap((nuevasCategorias: any[]) => {
              this.categoriasSubject.next(nuevasCategorias);
            })
          );
    }

    //servicio correspondiente a traer datos para la actualizacion de empleado
    consultarIdEmpleado(id: any):Observable<any>{
        return this.clienteHttp.get<listaEmpleados>(this.API2+"?obtEmp="+id);
    }

    //servicio correspondiente a la actualizacion del empleado
    actualizaEmpleado(id: any, datosEmpleado: listaEmpleados):Observable<any>{
        let headers: any = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        return this.clienteHttp.post<msgResult>(this.API+"?actEmp="+id,datosEmpleado, {headers});
    }   






    MostrarRecepcionistas(idGym: any) {
        let headers: any = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        let params = 'idGym=' + idGym;
        return this.clienteHttp.post(this.APIL + 'ser_mostrar_Recepcionistas.php', params, { headers });
      }

    InfoIdEmpleado(idEmp: any) {
        let headers: any = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        let params = 'idEmp=' + idEmp;
        return this.clienteHttp.post(this.APIL + 'ser_mostrar_Recepcionistas.php', params, { headers });
      }

      ActualizarColaborador(pid_bodega: number, pnombreCompleto: String, pCorreoEmpleado: String, ptelefono: String, pidEmp: String) {
        let headers: any = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        let params = 'pid_bodega=' + pid_bodega + '&pnombreCompleto=' + pnombreCompleto + '&pCorreoEmpleado=' + pCorreoEmpleado + '&ptelefono=' + ptelefono + '&pidEmp=' + pidEmp;
        return this.clienteHttp.post(this.APIL + 'ser_mostrar_Recepcionistas.php', params, { headers });
      }
  }
  