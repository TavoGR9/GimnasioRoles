import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { plan } from '../models/plan';
@Injectable({
  providedIn: 'root'
})
export class PlanService {
 
  //API: string ="http://localhost/plan/membresia.php";
  API: string ="https://olympus.arvispace.com/gimnasioRoles/configuracion/administrador/membresia.php";
  API2: string = "https://olympus.arvispace.com/conPrincipal/Membresia.php";
  API3: string = "https://olympus.arvispace.com/conPrincipal/servicesMembresia.php";

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
    return this.clienteHttp.post(this.API2+"?insertar",datosPlan);
  }

  obternerPlan(){
    return this.clienteHttp.get(this.API)
  }



  consultarPlan(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"?consultar="+id);
  }

  consultarPlanM():Observable<any>{
    return this.clienteHttp.get(this.API+"?consultarPlanM");
  }

  consultarPlanIdMem(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"?consultarGYMMem="+id);
  }

  consultarPlanIdPlan(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"?consultarGYMPlan="+id);
  }




  consultarPlanIdPlan2(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"?consultarGYMPlanT="+id);
  }

  consultarPlanGym(id:any):Observable<any>{
    return this.clienteHttp.get(this.API2+"?consultarMembresia="+id);
  }

  consultarPlanId(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"?consultarGYM="+id);
  }

  borrarPlan(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"?borrar="+id)
  }

  actualizarPlan(id:any,datosPlan:any):Observable<any>{
    return this.clienteHttp.post(this.API+"?actualizar="+id,datosPlan);
  }  

  updateMembresiaStatus(id: number, estado: { status: number }): Observable<any> {
    console.log("status",estado,"id",id);
    return this.clienteHttp.post(this.API+"?actualizarEstatus="+id,estado);
  }

  agregarServicios(datoService: any):Observable<any>{
    //return this.clienteHttp.post(this.API3+"?insertar=1", datoService, { headers: { 'Content-Type': 'application/json' } });  }
    return this.clienteHttp.post(this.API3+"?insertar", datoService);
}

/*getServices(services: any) {
  this.services = services;
  if(services){
    console.log("SERVICIOS FROM SERVICE",this.services);
    this.showServices.next(this.services);
  }else {
    console.log("NO HAY SERVICIOS");
  }
}*/

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
  return this.clienteHttp.put(this.API2, formData);
}

newService(data: any): Observable<any> {
  return this.clienteHttp.post(this.API3+"?insertarservicio", data);
}

getService(id: number): Observable<any> {
  return this.clienteHttp.get(this.API3+"?getServicio="+id);
}

updateService(data: any): Observable<any> {
  return this.clienteHttp.post(this.API3+"?actualizarServicio", data);
}

}
