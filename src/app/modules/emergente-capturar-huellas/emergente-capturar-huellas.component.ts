import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './../../service/auth.service';
import {
  FingerprintReader,
  SampleFormat,
  DeviceConnected,
  DeviceDisconnected,
  SamplesAcquired,
  AcquisitionStarted,
  AcquisitionStopped,
  QualityReported
} from '@digitalpersona/devices';
import './../../WebSdk';
@Component({
  selector: 'app-emergente-capturar-huellas',
  templateUrl: './emergente-capturar-huellas.component.html',
  styleUrls: ['./emergente-capturar-huellas.component.css']
})
export class EmergenteCapturarHuellasComponent implements OnInit, OnDestroy {
  // Manejar objeto para envio de id e imagen base64 de huella capturada
  archivo = {
    id: 0,
    huella: ''
  }
  // Manejar estado de existencia de huella dactilar en BD
  existsHuella: boolean = false;
  // Manejar estado/existencia de huella capturada
  lecturaHuella: boolean = false;
  // Variables para manjear los procesos de lectura de huella
  private reader: FingerprintReader;
  ListaFingerPrintReader: any;
  InfoFingerPrintReader: any;
  ListaSamplesFingerPrints: any;
  currentImageFinger: any;
  currentImageFingerFixed: any;

  constructor( private toastr: ToastrService, private service: AuthService, 
    public dialogo: MatDialogRef<EmergenteCapturarHuellasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      this.reader = new FingerprintReader();
    }

  // Event handlers.
  private onDeviceConnected = (event: DeviceConnected) => { }
  private onDeviceDisconnected = (event: DeviceDisconnected) => { };
  private onQualityReported = (event: QualityReported) => { };
  private onAcquisitionStarted = (event: AcquisitionStarted) => {
    console.log("En evento: onAcquisitionStarted");
    console.log(event);
  };
  private onAcquisitionStopped = (event: AcquisitionStopped) => {
    console.log("En evento: onAcquisitionStopped");
    console.log(event);
  };
  private onSamplesAcquired = (event: SamplesAcquired) => {
    console.log("En el evento: Adquisición de imagen");
    console.log(event);
    this.ListaSamplesFingerPrints = event;
    this.fn_CapturaFP();
  };

  ngOnDestroy(): void {
    this.reader.off("DeviceConnected", this.onDeviceConnected);
    this.reader.off("DeviceDisconnected", this.onDeviceDisconnected);
    this.reader.off("AcquisitionStopped", this.onAcquisitionStopped);
    this.reader.off("SamplesAcquired", this.onSamplesAcquired);
    this.reader.off("AcquisitionStarted", this.onAcquisitionStarted);
  }

  ngOnInit(): void {
    //Alamacenar el dato del ide del cliente pasado del componente padre
    this.archivo.id = this.data.clienteID;

    this.reader = new FingerprintReader();
    this.reader.on("DeviceConnected", this.onDeviceConnected);
    this.reader.on("DeviceDisconnected", this.onDeviceDisconnected);
    this.reader.on("AcquisitionStopped", this.onAcquisitionStopped);
    this.reader.on("SamplesAcquired", this.onSamplesAcquired);
    this.reader.on("AcquisitionStarted", this.onAcquisitionStarted);
  }

  // INICIAN METODOS DE LA LIBRERIA DIGITAL PERSONA PARA CAPTURA DE HUELLA >->->->->->->->->->->

  // Listar dispositivos conectados
  fn_Listar_Dispositivos(){
    Promise.all([
      this.reader.enumerateDevices()
    ])
    .then(results => {
      this.ListaFingerPrintReader = results[0];
      console.log("Dato dispositivos");
      console.log(this.ListaFingerPrintReader);
      this.fn_DeviceInfo();
    })
    .catch((error) => {
      console.log(error);
    })
  }

  // Informacion del dispositivo...
  fn_DeviceInfo(){
    Promise.all([
      this.reader.getDeviceInfo(this.ListaFingerPrintReader[0])
    ])
    .then(results => {
      this.InfoFingerPrintReader = results[0];
      console.log("Info finger reader");
      console.log(this.InfoFingerPrintReader);
      this.fn_StartCapturaFP();
    })
    .catch((error) => {
      console.log(error);
    });
  }

  // Iniciar device para captura
  fn_StartCapturaFP(){
    this.reader.startAcquisition(SampleFormat.PngImage, this.InfoFingerPrintReader['DeviceID'])
    .then((response) => {
      console.log("You can start capturing!!!");
      console.log(response);
      //this.fn_CapturaFP();
    })
    .catch((error) => {
      console.log(error);
    });
  }

  // Detener la lectura
  fn_EndCaptureFP(){
    this.reader.stopAcquisition(this.InfoFingerPrintReader['DeviceID'])
    .then((response) => {
      console.log("You stopped the capture.");
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
  }

  // Mostrar la huella en pantalla
  fn_CapturaFP(){
    var ListImages = this.ListaSamplesFingerPrints['samples'];
    var lsize = Object.keys(ListImages).length;
    if(ListImages != null && ListImages != undefined){
      if(lsize > 0){
        this.currentImageFinger = ListImages[0];
        this.currentImageFingerFixed = this.fn_fixFormatImageBase64(this.currentImageFinger);
        // Guardar huella en BD
        this.archivo.huella = this.currentImageFingerFixed;
      }
    }
  }

  // Corregir formato base64
  fn_fixFormatImageBase64(prm_imageBase: any){
    var strImage = '';
    strImage = prm_imageBase;

    // Reemplazar caracteres no validos
    strImage = strImage.replace(/_/g, "/");
    strImage = strImage.replace(/-/g,"+");

    return strImage;
  }

  // FINALIZAN METODOS DE LA LIBRERIA DIGITAL PERSONA PARA CAPTURA DE HUELLA >->->->->->->->->->

  // Cerrar mat-dialod
  cerrarDialogo(): void {
    this.dialogo.close(true);
  }

  // Subir la imagen al servidor
  uploadFingerprint(){
    console.log(this.archivo);
    // Validación de captura de huellas
    if (this.archivo.huella === '' || this.archivo.id === 0) {
      console.log('No haz capurado huella aun.');
      this.toastr.error('Aún no haz capturado la huella dactilar.', 'Error');
      return;
    }

    this.service.saveFingerprint(this.archivo).subscribe({
      next: (resultData) => { console.log(resultData); 
        this.toastr.success('Huella dactilar guardada correctamente...', 'Éxito');
        this.dialogo.close(true);
      }, error: (error) => { console.log(error); }
    });
  }

}