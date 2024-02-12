import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/service/auth.service';
/*import {
  FingerprintReader,
  SampleFormat,
  DeviceConnected,
  DeviceDisconnected,
  SamplesAcquired,
  AcquisitionStarted,
  AcquisitionStopped,
  QualityReported
} from '@digitalpersona/devices';*/

@Component({
  selector: 'app-emergente-capturar-huellas',
  templateUrl: './emergente-capturar-huellas.component.html',
  styleUrls: ['./emergente-capturar-huellas.component.css']
})
export class EmergenteCapturarHuellasComponent implements OnInit {
  // Manejar objeto para envio de id e imagen base64 de huella capturada
  archivo = {
    id: 0,
    base64textString: ''
  }
  // Manejar estado de existencia de huella dactilar en BD
  existsHuella: boolean = false;
  // Manejar estado/existencia de huella capturada
  lecturaHuella: boolean = false;

  // Huella leida en b64
  currentImageFingerFixed: any;

  constructor( private toastr: ToastrService, private service: AuthService, 
    public dialogo: MatDialogRef<EmergenteCapturarHuellasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.archivo.id = this.data.clienteID;
    //console.log(this.data.clienteID);
  }

  // Cerrar mat-dialod
  cerrarDialogo(): void {
    this.dialogo.close(true);
  }

  // Subir la imagen al servidor
  uploadFingerprint(){
    console.log(this.archivo);
    // Validación de captura de huellas
    if (this.archivo.base64textString === '' || this.archivo.id === 0) {
      console.log('No haz capurado huella aun.');
      this.toastr.error('Aún no haz capturado la huella dactilar.', 'Error');
      return;
    }

    this.service.saveFingerprint(this.archivo).subscribe({
      next: (resultData) => { console.log(resultData); 
        this.toastr.success('Huella dactilar guardaa correctamente...', 'Éxito');
        this.dialogo.close(true);
      }, error: (error) => { console.log(error); }
    });
  }

}
