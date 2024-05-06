import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { VentasComponent } from '../ventas/ventas.component';
import { MatDialog } from "@angular/material/dialog";
import { EntradasComponent } from '../entradas/entradas.component';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { JoinDetalleVentaService } from "../../service/JoinDetalleVenta";
import { HomeService } from '../../service/home.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SyncService } from '../../service/sync.service';
import { NgxSpinnerService } from "ngx-spinner";
import { IndexedDBService } from './../../service/indexed-db.service';
import { Observable, map , throwError} from 'rxjs';
//////////////////////////////
import { serviciosService } from '../../service/servicios.service';
import { ColaboradorService } from './../../service/colaborador.service';
import { MembresiaService } from "../../service/membresia.service";
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  currentUser: string = '';
  detallesCaja: any[] = [];
  fechaFiltro: string = "";
  idGym: number = 0;
  fechaActual: Date = new Date();
  totalVentas: number = 0;
  totalProductosVendidos: number = 0;
  datosProductosVendidos: any;
  datosRecientesVentas: any;
  datosClientesActivos: any;
  clientesActivos: any;
  homeCard: any;
  tablaHTML: SafeHtml | null = null;
  tablaHTMLVentas: SafeHtml | null = null;
  isLoading: boolean = true; 
  
  constructor(private homeService: HomeService, private sanitizer: DomSanitizer, private spinner: NgxSpinnerService,
    private auth: AuthService, public dialog: MatDialog, 
    private router: Router, private joinDetalleVentaService: JoinDetalleVentaService, 
    private syncService: SyncService, private indexedDBService: IndexedDBService,
    private http: ColaboradorService,
    public membresiaService: MembresiaService,
    /////////////////
      private servicio: serviciosService ) {
  }

  ngOnInit(): void {
    // this.auth.comprobar();
    // this.homeService.comprobar();

   
      this.currentUser = this.auth.getCurrentUser();
      if(this.currentUser){
        this.getSSdata(JSON.stringify(this.currentUser));
      }
      this.auth.idGym.subscribe((data) => {
        if(data) {
          this.idGym = data;
          this.listaTablas();
        }
      });
    this.loadData();
  }

  loadData() {
    setTimeout(() => {
      // Una vez que los datos se han cargado, establece isLoading en false
      this.isLoading = false;
    }, 1000); // Este valor representa el tiempo de carga simulado en milisegundos
  }

  sync() {
    this.syncService.getLocalUsers().subscribe(localData => {
      this.syncService.getRemoteUsers().subscribe(remoteData => {
        this.compareAndUpdate(localData.usuarios, remoteData.usuarios);
      });
    });
  }

  compareAndUpdate(localUsers: any[], remoteUsers: any[]) {
    // Actualizar o insertar usuarios remotos basados en los usuarios locales
    localUsers.forEach(localUser => {
      const remoteUser = remoteUsers.find(user => user.email === localUser.email);
      if (remoteUser) {
        if (new Date(localUser.fecha_registro) > new Date(remoteUser.fecha_registro)) {
          this.syncService.updateRemoteUser(localUser).subscribe({
            error: error => console.error(`Error updating remote user ${localUser.email}`, error)
          });
        }
      } else {
        // Si no existe en remoto, insertar
        this.syncService.updateRemoteUser(localUser).subscribe({
          error: error => console.error(`Error adding new remote user ${localUser.email}`, error)
        });
      }
    });
    // Actualizar o insertar usuarios locales basados en los usuarios remotos
    remoteUsers.forEach(remoteUser => {
      const localUser = localUsers.find(user => user.email === remoteUser.email);
      if (localUser) {
        if (new Date(remoteUser.fecha_registro) > new Date(localUser.fecha_registro)) {
          this.syncService.updateLocalUser(remoteUser).subscribe({
            error: error => console.error(`Error updating local user ${remoteUser.email}`, error)
          });
        }
      } else {
        // Si no existe en local, insertar
        this.syncService.updateLocalUser(remoteUser).subscribe({
          error: error => console.error(`Error adding new local user ${remoteUser.email}`, error)
        });
      }
    });
  }
  
  getSSdata(data: any){
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
          this.auth.role.next(resultData.rolUser);
          this.auth.userId.next(resultData.id);
          this.auth.idGym.next(resultData.idGym);
          this.auth.nombreGym.next(resultData.nombreGym);
          this.auth.email.next(resultData.email);
          this.auth.encryptedMail.next(resultData.encryptedMail);
      }, error: (error) => { console.log(error); }
    });
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }
  
  isSupadmin(): boolean {
    return this.auth.isSupadmin();
  }

  isRecep(): boolean {
    return this.auth.isRecepcion();
  }

  ventas(): void {
    const dialogRef = this.dialog.open(VentasComponent, {
      width: '80%',
      height: '90%',     
    });
  }

  entradas(): void {
    const dialogRef = this.dialog.open(EntradasComponent, {
      width: '75%',
      height: '90%',
      disableClose: true,
    });
  }

  listaTablas() {
    this.homeService.consultarHome(this.idGym).subscribe(respuesta => {
      this.homeCard = respuesta
    });

    this.homeService.getAnalyticsData(this.idGym).subscribe((data) => {
    this.tablaHTML = this.sanitizer.bypassSecurityTrustHtml(`<table class="mi-tabla">${data.tablaHTML}</table>`);
    });
    this.homeService.getARecientesVentas(this.idGym).subscribe((data) => {
      this.tablaHTMLVentas = this.sanitizer.bypassSecurityTrustHtml(`<table class="mi-tabla">${data.tablaHTMLVentas}</table>`);
    });
  }





  Sincronizar() {
    this.indexedDBService.getAgregarEmpleadoData('AgregarEmpleado').then(data => {
      if (data && data.length > 0) {
        let maxId = -1;
        let lastData: any;
        data.forEach((record: any) => {
          this.http.agregarEmpleado(record.data).subscribe({
          });
          console.log(record.data);
        });
        this.indexedDBService.VaciarAgregarEmpleadoData();
        //observer.next(lastData); // Emitir el último dato encontrado
      } else {
        console.log("No hay datos"); // Emitir null si no hay datos en IndexedDB
      }
    });


    this.indexedDBService.getAgregarServicioData('AgregarServicio').then(data => {
      if (data && data.length > 0) {
        let maxId = -1;
        let lastData: any;
        data.forEach((record: any) => {
          this.servicio.newService(record.data).subscribe({
          });
          console.log(record.data);
        });
        this.indexedDBService.VaciarAgregarServicioData();
        
        //observer.next(lastData); // Emitir el último dato encontrado
      } else {
        console.log("No hay datos"); // Emitir null si no hay datos en IndexedDB
      }
    });



    this.indexedDBService.getAgregarMembresiaData('AgregarMembresia').then(data => {
      if (data && data.length > 0) {
        let maxId = -1;
        let lastData: any;
        data.forEach((record: any) => {
          this.membresiaService.agregarMem(record.data).subscribe({
          });
          console.log(record.data);
        });
        this.indexedDBService.VaciarAgregarMembresiaData();
        
        //observer.next(lastData); // Emitir el último dato encontrado
      } else {
        console.log("No hay datos"); // Emitir null si no hay datos en IndexedDB
      }
    });


    this.indexedDBService.getAgregarPlanData('AgregarPlan').then(data => {
      if (data && data.length > 0) {
        let maxId = -1;
        let lastData: any;
        data.forEach((record: any) => {
          this.membresiaService.agregarPlan(record.data).subscribe({
          });
          console.log(record.data);
        });
        this.indexedDBService.VaciarAgregarPlanData();
        
        //observer.next(lastData); // Emitir el último dato encontrado
      } else {
        console.log("No hay datos en planes"); // Emitir null si no hay datos en IndexedDB
      }
    });



    this.indexedDBService.getAgregarRegistroData('AgregarRegistro').then(data => {
      if (data && data.length > 0) {
        let maxId = -1;
        let lastData: any;
        data.forEach((record: any) => {
          this.http.agregarUsuario(record.data).subscribe({
          });
          console.log(record.data);
        });
        this.indexedDBService.VaciarAgregarRegistroData();
        
        //observer.next(lastData); // Emitir el último dato encontrado
      } else {
        console.log("No hay datos en planes"); // Emitir null si no hay datos en IndexedDB
      }
    });
 
 }


 
}
