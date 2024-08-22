import { Component, ElementRef, ViewChild, OnInit} from "@angular/core";
import { FormBuilder, Validators, FormGroup} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import { ToastrService } from "ngx-toastr";
import { TestService } from "../../service/test.service";
import { MembresiaService } from "../../service/membresia.service";
import { AuthService } from "../../service/auth.service";
import { Subject, Observable } from 'rxjs';
import { WebcamImage, WebcamInitError } from 'ngx-webcam';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from "ngx-spinner";
import { ColaboradorService } from "../../service/colaborador.service";
interface Food {
  value: string;
  viewValue: string;
}

@Component({
  selector: "app-registro",
  templateUrl: "./registro.component.html",
  styleUrls: ["./registro.component.css"],
})

export class RegistroComponent implements OnInit {

  foods: Food[] = [
    { value: "Aguascalientes", viewValue: "Aguascalientes" },
    { value: "Baja California", viewValue: "Baja California" },
    { value: "Baja California Sur", viewValue: "Baja California Sur" },
    { value: "Campeche", viewValue: "Campeche" },
    { value: "Chiapas", viewValue: "Chiapas" },
    { value: "Chihuahua", viewValue: "Chihuahua" },
    { value: "Coahuila", viewValue: "Coahuila" },
    { value: "Colima", viewValue: "Colima" },
    { value: "Ciudad de México", viewValue: "CDMX" },
    { value: "Durango", viewValue: "Durango" },
    { value: "Guanajuato", viewValue: "Guanajuato" },
    { value: "Guerrero", viewValue: "Guerrero" },
    { value: "Hidalgo", viewValue: "Hidalgo" },
    { value: "Jalisco", viewValue: "Jalisco" },
    { value: "México", viewValue: "México" },
    { value: "Michoacán", viewValue: "Michoacán" },
    { value: "Morelos", viewValue: "Morelos" },
    { value: "Nayarit", viewValue: "Nayarit" },
    { value: "Nuevo León", viewValue: "Nuevo León" },
    { value: "Oaxaca", viewValue: "Oaxaca" },
    { value: "Puebla", viewValue: "Puebla" },
    { value: "Querétaro", viewValue: "Querétaro" },
    { value: "San Luis Potosi", viewValue: "San Luis Potosi" },
    { value: "Sinaloa", viewValue: "Sinaloa" },
    { value: "Sonora", viewValue: "Sonora" },
    { value: "Tabasco", viewValue: "Tabasco" },
    { value: "Tamaulipas", viewValue: "Tamaulipas" },
    { value: "Tlaxcala", viewValue: "Tlaxcala" },
    { value: "Veracruz", viewValue: "Veracruz" },
    { value: "Yucatán", viewValue: "Yucatán" },
    { value: "Zacatecas", viewValue: "Zacatecas" },
  ];

  form: FormGroup;
  message: string = "";
  habilitarBoton: boolean = false;
  password: string = "";

  /**CAMARA*/
  public webcamImage: WebcamImage | null = null; 
  public allowCameraSwitch = true;
  not_format: boolean = false;
  not_size: boolean = false;
  public showWebcam = false;
  file: File | null = null;
  public photoSelected: string | ArrayBuffer | null = null;
  public errors: WebcamInitError[] = [];
  actualizar_imagen: string = '';

  archivo = {
    id: 0,
    nombreArchivo: '',
    base64textString: ''
  }

  imageUrl =
    "https://images.vexels.com/media/users/3/137047/isolated/preview/5831a17a290077c646a48c4db78a81bb-icono-de-perfil-de-usuario-azul.png"; // URL de la imagen por defecto

  @ViewChild("videoElement") videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild("defaultImage") defaultImage!: ElementRef<HTMLImageElement>;
  private trigger: Subject<void> = new Subject<void>();
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();
  public deviceId: string = "";

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }

  constructor(
    public fb: FormBuilder,
    public testService: TestService,
    public usuario: ColaboradorService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private planService: MembresiaService,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    public dialogo: MatDialogRef<RegistroComponent>
  ) {
    this.form = this.fb.group({
      nombreU: ['', Validators.compose([ Validators.required, Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/)])],
      apPaterno: ['', Validators.compose([ Validators.required, Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/)])],
      apMaterno: ['', Validators.compose([ Validators.required, Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/)])],
      fon: ['', Validators.compose([Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      codigoPostal: ['', Validators.compose([Validators.pattern(/^(0|[1-9][0-9]*)$/), Validators.minLength(5)])],
      ciudad: ['', Validators.compose([Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/)])],
      colonia: ['', Validators.compose([Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/)])],
      calle: ['', Validators.compose([Validators.pattern(/^[A-Za-zñÑáéíóú0-9 ]*[A-Za-z][A-Za-zñÑáéíóú0-9 ]*$/)])],
      numInter: ['', Validators.compose([Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      numExterno: ['', Validators.compose([Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      estado: [''],
      idGym:[this.auth.idGym.getValue()],
      fechaNacimiento: [''],
      fotoUrl:[''],
      Gimnasio_idGimnasio:[this.auth.idGym.getValue()],
      nombreArchivo: [''],
      base64textString: [''],
      email: ['', Validators.compose([Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)])],  
      pass: [''],
      user:[''],
      nombre:[''],
      id: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      destino:["Cliente"],
      direccion:[''],
      codigoPromotor:[0],
      Genero:[''],
      idUser:[this.auth.idUser.getValue()],
    })

  }

  ngOnInit(): void {
    this.auth.comprobar().subscribe((respuesta)=>{ 
      this.habilitarBoton = respuesta.status;
    });
  }

  public cameraWasSwitched(deviceId: string): void {
    this.deviceId = deviceId;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public triggerSnapshot(): void {
    this.trigger.next();

    this.toggleWebcam();
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  resetWebcamImage(): void {
    this.webcamImage = null;
    this.archivo.base64textString = '';
    this.archivo.nombreArchivo = '';
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
          this.toastr.error('El archivo seleccionado no es una imagen', 'Error');
          return;
        }
        if (file.size > 1024 * 1024) {
          this.not_size = true;
          this.toastr.error('El tamaño de la imagen debe ser menor a 1MB', 'Error');
          return;
        }
      }
      // Almacenar el nombre del archivo/imagen en el json Archivo
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

  // Codificar la imagen a base64
  handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.archivo.base64textString = this.webcamImage.imageAsBase64;
    const timestamp = new Date().getTime();
    this.archivo.nombreArchivo = `imagen_${timestamp}.png`;
    // Asignar la URL de la imagen tomada a photoSelected
    this.photoSelected = this.webcamImage.imageAsDataUrl;
    this.form.patchValue({
      base64textString: this.webcamImage.imageAsBase64,
      nombreArchivo: this.archivo.nombreArchivo,
      fotoUrl: this.archivo.nombreArchivo
    });  
  }

  _handleReaderLoaded(readerEvent: any) {
    var binaryString = readerEvent.target.result;
    this.archivo.base64textString = btoa(binaryString);
    this.uploadPhoto();
  }

  uploadPhoto() {
    if (  this.archivo.nombreArchivo === '' ) {
      this.toastr.error('Aún no haz seleccionado una imagen valida...', 'Error');
      return;
    }

    this.form.patchValue({
      fotoUrl: this.archivo.nombreArchivo,
      nombreArchivo: this.archivo.nombreArchivo,
      base64textString: this.archivo.base64textString
    });
    
  }

  generarContraseña(longitud: number): string {
    if (this.form.value.fon && this.form.value.email) {
      const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
      let contraseña = '';
      for (let i = 0; i < longitud; i++) {
        const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
        contraseña += caracteres.charAt(indiceAleatorio);
      }
      return contraseña;
    } else {
      return ''; 
    }
  }  
  
  enviarMensajeWhatsApp(telefono: string, correo: string, password: string) {
    if(telefono && correo){
      const mensaje = `Correo: ${correo}, Contraseña: ${password}`;
      const url = `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank');
    }  
  }

  cerrarDialogo(){
    this.dialogo.close(true);
  }
  
  registrarUsuario() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true; 
    dialogConfig.data = 'Registro agregado correctamente.'; 
    this.spinner.show();
    this.password = this.generarContraseña(9);
    const direccionCompleta = `${this.form.get("calle")?.value} ${this.form.get("numExterno")?.value ? "Ext. " + this.form.get("numExterno")?.value: ""}, ${this.form.get("numInter")?.value ? "Int. " + this.form.get("numInter")?.value : ""}, ${this.form.get("colonia")?.value}, ${this.form.get("ciudad")?.value}, ${this.form.get("estado")?.value}, CP ${this.form.get("codigoPostal")?.value}`;
    const nombreCompleto = `${this.form.get("nombreU")?.value} ${this.form.get("apPaterno")?.value} ${this.form.get("apMaterno")?.value}`;
  
    this.form.patchValue({
      direccion: direccionCompleta,
      nombre: nombreCompleto,
      user: nombreCompleto,
      pass: this.password,
    });
  
    if (this.form.valid) {
      this.usuario.agregarUsuario(this.form.value).subscribe({
        next: (resultData) => {
          if (resultData.message === 'MailExists') {
            this.toastr.error('Correo o clave ya existente', 'Error!!!');
            this.spinner.hide();
          } else if (resultData.success == '1') {
            this.dialogo.close(true);
            this.spinner.hide();
            this.enviarMensajeWhatsApp(this.form.value.fon, this.form.value.email, this.password);
            this.dialog.open(MensajeEmergentesComponent, dialogConfig).afterClosed().subscribe((cerrarDialogo: boolean) => {
              if (cerrarDialogo) {
                this.router.navigateByUrl(`/home`);
              }
            });
          } else if (resultData.success == '2') {
            this.dialogo.close(true);
            this.spinner.hide();
            this.dialog.open(MensajeEmergentesComponent, dialogConfig).afterClosed().subscribe((cerrarDialogo: boolean) => {
              if (cerrarDialogo) {
                this.router.navigateByUrl(`/home`);
              } 
            });
          } 
        },
        error: (error) => {
          this.toastr.error('Ocurrió un error al intentar agregar el empleado.', 'Error!!!');
        }
      });
    } else {
      this.spinner.hide();
      this.toastr.error('Complete los campos requeridos', 'Error', {
        positionClass: 'toast-bottom-left',
      });
      this.marcarCamposInvalidos(this.form);
    }
  }

  marcarCamposInvalidos(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((campo) => {
      const control = formGroup.get(campo);
      if (control instanceof FormGroup) {
        this.marcarCamposInvalidos(control);
      } else {
        if (control) {
          control.markAsTouched();
        };
      }
    });
  }
  
}
