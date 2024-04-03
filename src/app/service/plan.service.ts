import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { plan } from '../models/plan';
@Injectable({
  providedIn: 'root'
})
export class PlanService {
 
  API: string ="http://localhost/plan/";

  public optionShow: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public showServices: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public dataToUpdate: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public idService: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public seleccionado: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public confirmButton: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public section: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  services: any[] = [];
  data: any = {};
  
  constructor(private clienteHttp:HttpClient) {
  }

  agregarPlan(datosPlan:plan):Observable<any>{
    return this.clienteHttp.post(this.API+"membresias.php?insertar",datosPlan);
  }

  obternerPlan(){
    return this.clienteHttp.get(this.API+"membresias.php")
  }
  
  consultarPlan(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"membresias.php?consultarPlan="+id);
  }

  consultarPlanM():Observable<any>{
    return this.clienteHttp.get(this.API+"membresias.php?consultarPlanM");
  }

  consultarPlanIdMem(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"membresias.php?consultarGYMMem="+id);
  }

  consultarPlanIdPlan2(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"membresias.php?consultarGYMPlanT="+id);
  }

  consultarPlanGym(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"membresias.php?consultarMembresia="+id);
  }

  consultarPlanId(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"membresias.php?consultarGYM="+id);
  }

  actualizarPlan(id:any,datosPlan:any):Observable<any>{
    return this.clienteHttp.post(this.API+"membresias.php?actualizar="+id,datosPlan);
  }  

  updateMembresiaStatus(id: number, estado: { status: number }): Observable<any> {
    console.log("status",estado,"id",id);
    return this.clienteHttp.post(this.API+"membresias.php?actualizarEstatus="+id,estado);
  }

  agregarServicios(datoService: any):Observable<any>{
    //return this.clienteHttp.post(this.API3+"?insertar=1", datoService, { headers: { 'Content-Type': 'application/json' } });  }
    return this.clienteHttp.post(this.API+"servicesMembresia.php?insertar", datoService);
}

showService(): Observable<any> {
  return this.showServices.asObservable();
}

setDataToupdate(id:number, tipo_membresia: number){
   this.data = {
    id: id,
    tipo_membresia: tipo_membresia
  }

  if(this.data){
    console.log("DATA TO UPDATE FROM SERVICE", this.data)
    this.dataToUpdate.next(this.data);
  }
}

getDataToUpdate(): Observable<any> {
  return this.dataToUpdate.asObservable();
}

updateMembresia(formData: any): Observable<any>{ 
  return this.clienteHttp.put(this.API+"membresias.php", formData);
}

newService(data: any): Observable<any> {
  return this.clienteHttp.post(this.API+"servicesMembresia.php?insertarservicio", data);
}

getService(id: number): Observable<any> {
  return this.clienteHttp.get(this.API+"servicesMembresia.php?getServicio="+id);
}

updateService(data: any): Observable<any> {
  return this.clienteHttp.post(this.API+"servicesMembresia.php?actualizarServicio", data);
}

}
