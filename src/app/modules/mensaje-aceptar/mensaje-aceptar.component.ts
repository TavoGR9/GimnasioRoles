import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-mensaje-aceptar',
  templateUrl: './mensaje-aceptar.component.html',
  styleUrls: ['./mensaje-aceptar.component.css']
})
export class MensajeAceptarComponent {
  constructor(
    public dialogRef: MatDialogRef<MensajeAceptarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mensaje: string, cliente: string, membresia: string }
  ) {}

  // Método para cerrar el diálogo sin confirmar
  cerrarDialogo(): void {
    this.dialogRef.close(false);
  }

  // Método para cerrar el diálogo y confirmar
  confirmado(): void {
    this.dialogRef.close(true);
  }

}
