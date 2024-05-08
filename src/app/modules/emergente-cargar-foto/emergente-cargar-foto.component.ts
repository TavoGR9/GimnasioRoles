import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ClienteService } from '../../service/cliente.service';
import { WebcamImage, WebcamInitError } from 'ngx-webcam';
import { Subject, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-emergente-cargar-foto',
  templateUrl: './emergente-cargar-foto.component.html',
  styleUrls: ['./emergente-cargar-foto.component.css']
})
export class EmergenteCargarFotoComponent implements OnInit{
  public showWebcam = false;
  private trigger: Subject<void> = new Subject<void>();
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();
  actualizar_imagen: string = '';
  photoSelected: string | ArrayBuffer | null;
  file: File;
  mostrarInfo: string = ''; 
  public webcamImage: WebcamImage | null;
  public errors: WebcamInitError[] = [];
  archivo = {
    id: 0,
    nombreArchivo: '',
    base64textString: ''
  }
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public videoOptions: MediaTrackConstraints = {
  };
  not_format: boolean = false;
  not_size: boolean = false;
  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.archivo.base64textString = this.webcamImage.imageAsBase64;
    const timestamp = new Date().getTime();
    this.archivo.nombreArchivo = `imagen_${timestamp}.png`;
  }
  public triggerSnapshot(): void {
    this.trigger.next();
    this.toggleWebcam();
  }
  
  resetWebcamImage(): void {
    this.webcamImage = null;
    this.archivo.base64textString = '';
    this.archivo.nombreArchivo = '';
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }
  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }
  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }
  public showNextWebcam(directionOrDeviceId: boolean | string): void {
    this.nextWebcam.next(directionOrDeviceId);
  }
  public cameraWasSwitched(deviceId: string): void {
    this.deviceId = deviceId;
  }
  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }
   
  usuarioRegistrado: any[] = [];   
  constructor( private toastr: ToastrService, private ServiceCliente: ClienteService, 
    public dialogo: MatDialogRef<EmergenteCargarFotoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      this.photoSelected = null;
      this.file = new File([], 'defaultFileName');
      this.deviceId = '';
      this.webcamImage = null;
      
    }

  cerrarDialogo(): void {
    this.dialogo.close(true);
  }

  ngOnInit() {
    this.archivo.id = this.data.clienteID;
  }

  show_option(option: string) {
    this.actualizar_imagen = option;
    if (option === 'take') {
      this.showWebcam = true;
    }
  }

  onPhotoSelected(event: any): void {
    if (event.target.files && event.target.files[0]) {
      var files = event.target.files;
      var file = files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          this.not_format = true;
          this.toastr.error('El archivo que intentas subir no tiene un formato valido...', 'Error');
          return;
        }
        if (file.name.endsWith('.ico')) {
          this.toastr.error('El archivo seleccionado tiene una extensión no válida (ico). Por favor, selecciona una imagen válida.', 'Error');
          return;
        }
        if (file.size > 1024 * 1024) {
          this.not_size = true;
          this.toastr.error('El tamaño de la imagen debe ser menor a 1MB', 'Error');
          return;
        }
      }

      this.archivo.nombreArchivo = file.name;
      this.file = <File>event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.photoSelected = reader.result;
      reader.readAsDataURL(this.file);

      if (files && file) {
        const newReader = new FileReader();
        newReader.onload = this._handleReaderLoaded.bind(this);
        newReader.readAsBinaryString(file);
      }
    } else {
      this.photoSelected = null;
      this.archivo.base64textString = '';
      this.archivo.nombreArchivo = '';
      return;
    }
  }

  _handleReaderLoaded(readerEvent: any) {
    var binaryString = readerEvent.target.result;
    this.archivo.base64textString = btoa(binaryString);
  }

  uploadPhoto() {
    if (this.archivo.base64textString === '' || this.archivo.nombreArchivo === '' || this.archivo.id === 0) {
      this.toastr.error('Aún no haz seleccionado una imagen valida...', 'Error');
      return;
    }
    this.ServiceCliente.updatePhoto(this.archivo).subscribe({
      next: (resultData) => { 
        this.toastr.success('Se guardó la foto exitosamente...', 'Éxito');
        this.dialogo.close(true);
      }, 
      error: (error) => { 
        console.log(error); 
        if (error instanceof HttpErrorResponse) {
          console.log(error.error); // Si el error es una instancia de HttpErrorResponse, imprime el error
        }
        this.toastr.error('Ocurrió un error al guardar la foto.', 'Error');
      }
    }); 
  }

  mostrarInformacion(boton: string): void {
    this.mostrarInfo = boton;
  }

}
