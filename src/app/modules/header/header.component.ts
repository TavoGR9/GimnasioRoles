import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { SidebarService } from '../../service/sidebar.service';
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  constructor(private auth: AuthService, 
  public dialog: MatDialog,private sidebarService: SidebarService) {}
  isConnected: boolean = true;
  mostrarElementoA: boolean = true;
  private lastIsConnected: boolean | null = null;
  public isBarraLateralVisible: boolean = true;

  toggleSidebar() {
    this.sidebarService.toggleMostrarBarraLateral();
    this.isBarraLateralVisible = !this.isBarraLateralVisible;
  }

  ngOnInit(): void {
        // interval(30000).pipe(
        //   switchMap(() => this.connectivityService.checkInternetConnectivity())
        // ).subscribe((isConnected: boolean) => {
        //   this.isConnected = isConnected;
        //   this.mostrarElementoA = isConnected;
        //   if (this.lastIsConnected !== isConnected) {
        //     this.updateConnectivityStatus(isConnected);
        //     this.lastIsConnected = isConnected;
        //   }
        // });
  }


  // private updateConnectivityStatus(isConnected: boolean): void {
  //   const mode = isConnected ? 'online' : 'offline';
  //   const dialogRef = this.dialog.open(MensajeEmergentesComponent, {
  //     data: `Estás en modo ${mode}.`,
  //     disableClose: true
  //   });
  
  //   dialogRef.afterClosed().subscribe((cerrarDialogo: boolean) => {
  //     if (cerrarDialogo) {
  //       dialogRef.close(); // Cerrar el diálogo actual
  //     }
  //   });
  // }
  

  Online() {
    const dialogRef = this.dialog.open(MensajeEmergentesComponent, {
      data: `"Estás en modo online."`,
      disableClose: true
    });
  
    dialogRef.afterClosed().subscribe((cerrarDialogo: boolean) => {
      if (cerrarDialogo) {
        dialogRef.close(); // Cerrar el diálogo
      }
    });
  }

  Offline() {
    const dialogRef = this.dialog.open(MensajeEmergentesComponent, {
      data: `"Estás en modo offline."`,
      disableClose: true
    });
  
    dialogRef.afterClosed().subscribe((cerrarDialogo: boolean) => {
      if (cerrarDialogo) {
        dialogRef.close(); // Cerrar el diálogo actual
      }
    });
  }
  
  logoutBS(): void {
    this.auth.logoutBS();
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
}
