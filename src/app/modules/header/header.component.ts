import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { RegistroComponent } from '../registro/registro.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  constructor(private auth: AuthService, public dialog: MatDialog,) {}

  ngOnInit(): void {}

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

   // Dentro de tu componente
AbrirRegistro() {
  const dialogConfig = new MatDialogConfig();
  dialogConfig.data = `Empleado agregado correctamente.`;
  dialogConfig.disableClose = true; // Bloquea el cierre del diálogo haciendo clic fuera de él

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
}
