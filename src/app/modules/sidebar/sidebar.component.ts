import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { SidebarService } from '../../service/sidebar.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatDrawerMode } from '@angular/material/sidenav';
import { RegistroComponent } from '../registro/registro.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { EmergenteAccesosComponent } from '../emergente-accesos/emergente-accesos.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  mostrarBarraLateral = false;
  mobileQuery: MediaQueryList;

  private _mobileQueryListener: () => void;


  constructor(private auth: AuthService, public dialog: MatDialog, private router: Router, private sidebarService: SidebarService,private mediaMatcher: MediaMatcher) {

    this.mobileQuery = mediaMatcher.matchMedia('(max-width: 900px)');
    this._mobileQueryListener = () => {
      this.mostrarBarraLateral = !this.mobileQuery.matches;
    };
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
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

  navigateToServicios() {
    this.router.navigate(['/misServicios']);
  }
  navigateToMembresias(){
    this.router.navigate(['/misMembresias']);

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
          // Aquí puedes realizar acciones si se desea cerrar el diálogo
        } else {
          // Aquí puedes realizar acciones si se cancela el cierre del diálogo
        }
      });
  }

  abrirAcceso() {
    this.dialog
      .open(EmergenteAccesosComponent, {
        //data: `Membresía agregada exitosamente`,
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
  }

}
