import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map , throwError} from 'rxjs';
import { membresia } from '../models/membresia';
import { catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class MembresiaService {
 
  API: string ="https://olympus.arvispace.com/gimnasioRoles/configuracion/administrador/membresia.php";
  //API: string = "https://olympus.arvispace.com/puntoDeVenta/conf/Membresia.php";  
  
  constructor(private clienteHttp:HttpClient) {
  }

  private datosPlan: any;

  setDatosPlan(datos: any): void {
    console.log(datos, "datos")
    this.datosPlan = datos;
  }

  getDatosPlan(): any {
    console.log(this.datosPlan, "this.datosPlan");
    return this.datosPlan;
  }

  agregarPlan(datosPlan:membresia):Observable<any>{
    return this.clienteHttp.post(this.API+"?insertarplan",datosPlan);
  }

  agregarPlanMem(datosPlanM:any):Observable<any>{
    return this.clienteHttp.post(this.API+"?insertarPlanM",datosPlanM);
  }

  obternerPlan(){
    return this.clienteHttp.get(this.API)
  }

  consultarPlan(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"?consultar="+id);
  }

  consultarPlanId(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"?consultarGYM="+id);
  }

  consultarPlanIdMem(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"?consultarGYMMem="+id);
  }

  consultarPlanIdPlan(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"?consultarGYMPlan="+id);
  }

  borrarPlan(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"?borrar="+id)
  }

  actualizarPlan(id:any,datosPlan:any):Observable<any>{
    console.log(id, "id", datosPlan, "datos");
    return this.clienteHttp.post(this.API+"?actualizar="+id,datosPlan);
  }  

  borrarPlanM(id:any):Observable<any>{
    console.log("el id", id);
    return this.clienteHttp.get(this.API+"?eliminarPlanM="+id)
    //this.message = "¡Error al eliminar!, Restricción en la base de datos";
  }


  updateMembresiaStatus(id: number, estado: { status: number }): Observable<any> {
    console.log("status",estado,"id",id);
    return this.clienteHttp.post(this.API+"?actualizarEstatus="+id,estado);;
  }

  eliminarEInsertarNuevoPlanM(planData: any): Observable<any> {
    console.log(planData, "planData");
    return this.clienteHttp.post(`${this.API}/membresia.php`, planData);
  }

}
