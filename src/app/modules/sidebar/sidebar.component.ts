import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { SidebarService } from '../../service/sidebar.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatDrawerMode } from '@angular/material/sidenav';
import { RegistroComponent } from '../registro/registro.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { combineLatest } from 'rxjs';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  url: string = ``;     //    ValidacionHuella
  mostrarBarraLateral = false;
  mobileQuery: MediaQueryList;
  currentUser: string = '';
  idGym: number = 0;
  idUser: number = 0;
  nombreGym: string = '';

  private _mobileQueryListener: () => void;

  constructor(private auth: AuthService, public dialog: MatDialog, private router: Router, private sidebarService: SidebarService,private mediaMatcher: MediaMatcher) {

    this.mobileQuery = mediaMatcher.matchMedia('(max-width: 900px)');
    this._mobileQueryListener = () => {
      this.mostrarBarraLateral = !this.mobileQuery.matches;
    };
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  isRouteActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }

  get modoBarraLateral(): MatDrawerMode {
    return this.mobileQuery.matches ? 'over' : 'side';
  }

  ngOnInit() {
    this.sidebarService.mostrarBarraLateral$.subscribe((mostrar) => {
      this.mostrarBarraLateral = mostrar;
    });

    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }

    combineLatest([this.auth.idGym, this.auth.idUser, this.auth.nombreGym]).subscribe(([idGym, idUser, nombreGym]) => {
      if (idGym && idUser) {
        this.idGym = idGym;
        this.idUser = idUser; 
        this.nombreGym = nombreGym;
        this.url = `HuellaTorniquete://?idSucursal=${this.idGym}`;
      }
    });
  }

  getSSdata(data: any){
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
          this.auth.role.next(resultData.rolUser);
          this.auth.idUser.next(resultData.clave);
          this.auth.idGym.next(resultData.idGym);
          this.auth.nombreGym.next(resultData.direccion);
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

  logoutBS(): void {
    this.auth.logoutBS();
  }

  AbrirRegistro() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = `Empleado agregado correctamente.`;
    dialogConfig.disableClose = true; // Bloquea el cierre del diálogo haciendo clic fuera de él
    dialogConfig.width = '75%';
    dialogConfig.height = '95%';
    this.dialog.open(RegistroComponent, dialogConfig)
      .afterClosed()
      .subscribe((cerrarDialogo: Boolean) => {
        if (cerrarDialogo) {
        } else {
        }
      });
  }

  /*abrirAcceso() {
    this.dialog
      .open(EmergenteAccesosComponent, {
        //data: `Membresía agregada exitosamente`,
        width: '500px',
        height: '500px',
        disableClose: true
      })
      .afterClosed()
      .subscribe((cerrarDialogo: Boolean) => {
        if (cerrarDialogo) {
          //this.router.navigateByUrl('/admin/listaMembresias');
        } else {
        }
      });
  }*/

 /* openSerialPage(){
    this.dialog
      .open(EmergenteAperturaPuertoSerialComponent, {
        data: {
          clienteID: `45`
        },
        width: '500px',
        height: '500px',
      })
      .afterClosed()
      .subscribe((cerrarDialogo: Boolean) => {
        if (cerrarDialogo) {
          //this.router.navigateByUrl('/admin/listaMembresias');
        } else {
        }
      });
  }*/

}
