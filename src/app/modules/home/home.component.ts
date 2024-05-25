import { Component, ViewChild} from '@angular/core';
import { OnInit } from '@angular/core';
import { VentasComponent } from '../ventas/ventas.component';
import { MatDialog } from "@angular/material/dialog";
import { EntradasComponent } from '../entradas/entradas.component';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { HomeService } from '../../service/home.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SyncService } from '../../service/sync.service';
import { NgxSpinnerService } from "ngx-spinner";
import { IndexedDBService } from './../../service/indexed-db.service';
import { serviciosService } from '../../service/servicios.service';
import { ColaboradorService } from './../../service/colaborador.service';
import { MembresiaService } from "../../service/membresia.service";
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';


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
  homeCard2: any;
  tablaHTML: SafeHtml | null = null;
  tablaHTMLVentas: SafeHtml | null = null;
  isLoading: boolean = true; 
  asistencia: any;
  
  constructor(private homeService: HomeService, private sanitizer: DomSanitizer, private spinner: NgxSpinnerService,
    private auth: AuthService, public dialog: MatDialog, 
    private router: Router,
    private syncService: SyncService, private indexedDBService: IndexedDBService,
    private http: ColaboradorService,
    public membresiaService: MembresiaService,
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
          this.consultarAsistencia();
        }
      });
   
    
  }

  loadData() {
    setTimeout(() => {
      this.isLoading = false;
      this.dataSource.paginator = this.paginator;
    }, 1000); 
  }

  sync() {
    this.syncService.getLocalUsers().subscribe(localData => {
      this.syncService.getRemoteUsers().subscribe(remoteData => {
        this.compareAndUpdate(localData.usuarios, remoteData.usuarios);
      });
    });
  }

  compareAndUpdate(localUsers: any[], remoteUsers: any[]) {
    localUsers.forEach(localUser => {
      const remoteUser = remoteUsers.find(user => user.email === localUser.email);
      if (remoteUser) {
        if (new Date(localUser.fecha_registro) > new Date(remoteUser.fecha_registro)) {
          this.syncService.updateRemoteUser(localUser).subscribe({
            error: error => console.error(`Error updating remote user ${localUser.email}`, error)
          });
        }
      } else {
        this.syncService.updateRemoteUser(localUser).subscribe({
          error: error => console.error(`Error adding new remote user ${localUser.email}`, error)
        });
      }
    });
    remoteUsers.forEach(remoteUser => {
      const localUser = localUsers.find(user => user.email === remoteUser.email);
      if (localUser) {
        if (new Date(remoteUser.fecha_registro) > new Date(localUser.fecha_registro)) {
          this.syncService.updateLocalUser(remoteUser).subscribe({
            error: error => console.error(`Error updating local user ${remoteUser.email}`, error)
          });
        }
      } else {
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


    this.homeService.consultarHome2(this.idGym).subscribe(respuesta => {
      this.homeCard2 = respuesta
    });

    this.homeService.getAnalyticsData(this.idGym).subscribe((data) => {
    this.tablaHTML = this.sanitizer.bypassSecurityTrustHtml(`<table class="mi-tabla">${data.tablaHTML}</table>`);
    });
    this.homeService.getARecientesVentas(this.idGym).subscribe((data) => {
      this.tablaHTMLVentas = this.sanitizer.bypassSecurityTrustHtml(`<table class="mi-tabla">${data.tablaHTMLVentas}</table>`);
    });
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource: any;
  displayedColumns: string[] = ['title', 'details','price', 'rol'];


  consultarAsistencia(){ 
    this.homeService.consultarAsistencias(this.idGym).subscribe(respuesta =>{
      this.asistencia =  respuesta;
      this.dataSource = new MatTableDataSource(this.asistencia);
      this.loadData();
   
    })
  }

  Sincronizar() {
    this.indexedDBService.getAgregarEmpleadoData('AgregarEmpleado').then(data => {
      if (data && data.length > 0) {
        let maxId = -1;
        let lastData: any;
        data.forEach((record: any) => {
          this.http.agregarEmpleado(record.data).subscribe({
          });
        });
        this.indexedDBService.VaciarAgregarEmpleadoData();
      } else {
      }
    });

    this.indexedDBService.getAgregarServicioData('AgregarServicio').then(data => {
      if (data && data.length > 0) {
        let maxId = -1;
        let lastData: any;
        data.forEach((record: any) => {
          this.servicio.newService(record.data).subscribe({
          });
        });
        this.indexedDBService.VaciarAgregarServicioData();
      } else {
      }
    });

    this.indexedDBService.getAgregarMembresiaData('AgregarMembresia').then(data => {
      if (data && data.length > 0) {
        let maxId = -1;
        let lastData: any;
        data.forEach((record: any) => {
          this.membresiaService.agregarMem(record.data).subscribe({
          });
        });
        this.indexedDBService.VaciarAgregarMembresiaData();
      } else {
      }
    });

    this.indexedDBService.getAgregarPlanData('AgregarPlan').then(data => {
      if (data && data.length > 0) {
        let maxId = -1;
        let lastData: any;
        data.forEach((record: any) => {
          this.membresiaService.agregarPlan(record.data).subscribe({
          });
        });
        this.indexedDBService.VaciarAgregarPlanData();
      } else {
      }
    });

    this.indexedDBService.getAgregarRegistroData('AgregarRegistro').then(data => {
      if (data && data.length > 0) {
        let maxId = -1;
        let lastData: any;
        data.forEach((record: any) => {
          this.http.agregarUsuario(record.data).subscribe({
          });
        });
        this.indexedDBService.VaciarAgregarRegistroData();
      } else {
      }
    });
 }
}
