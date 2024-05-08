import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GimnasioService } from '../../service/gimnasio.service';

@Component({
  selector: 'app-mensaje-desactivar',
  templateUrl: './mensaje-desactivar.component.html',
  styleUrls: ['./mensaje-desactivar.component.css']
})
export class MensajeDesactivarComponent {
  idGimnasio: any; // Asegúrate de inicializar este valor correctamente

  constructor(
    private gimnasioService: GimnasioService,
    public dialogo: MatDialogRef<MensajeDesactivarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idGimnasio = data.idGimnasio;
  }

  confirmado(): void {
    this.dialogo.close(true);
    this.gimnasioService.botonEstado.next({ respuesta: true, idGimnasio: this.idGimnasio });
  }
  
  cerrarDialogo(): void {
    this.dialogo.close(false);
    this.gimnasioService.botonEstado.next({ respuesta: false, idGimnasio: this.idGimnasio });
  }
  


  ngOnInit() {
  }

}

