import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { listaEmpleados, msgResult, registrarEmpleado } from '../models/empleado';

@Injectable({
    providedIn: 'root'
})

export class ColaboradorService {

    API: string = 'https://olympus.arvispace.com/gimnasioRoles/configuracion/recepcion/empleado.php';
    constructor(private clienteHttp:HttpClient) {
    }
    
    //servicio correspondiente a llenado de los datos del combo nombre Gym
    comboDatosGym(gimID: any){
        return this.clienteHttp.get(this.API+"?nomGym="+gimID);
    }

    comboDatosAllGym(){
        return this.clienteHttp.get(this.API+"?nomAllGym");
    }

    //servicio correspondiente al registro-alta de nuevo colaborador
    agregarEmpleado(datosEmpleado: registrarEmpleado):Observable<any>{
        let headers: any = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        return this.clienteHttp.post<msgResult>(this.API+"?addEmpleado",datosEmpleado, {headers});
    }

    //servicio correspondiente a llenar tabla lista de colaboradores
    listaColaboradores():Observable<any>{
        return this.clienteHttp.get<listaEmpleados>(this.API+"?tEmp");
    }

    listaRecepcionistas(idGym: any):Observable<any>{
        return this.clienteHttp.get<listaEmpleados>(this.API+"?tEmpRec="+idGym);
    }

    //servicio correspondiente a traer datos para la actualizacion de empleado
    consultarIdEmpleado(id: any):Observable<any>{
        return this.clienteHttp.get<listaEmpleados>(this.API+"?obtEmp="+id);
    }

    //servicio correspondiente a la actualizacion del empleado
    actualizaEmpleado(id: any, datosEmpleado: listaEmpleados):Observable<any>{
        let headers: any = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        return this.clienteHttp.post<msgResult>(this.API+"?actEmp="+id,datosEmpleado, {headers});
    }
    
  }
  