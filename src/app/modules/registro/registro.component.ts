import { Component, ElementRef, ViewChild, OnInit, Inject} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormGroup,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { ClienteService } from "../../service/cliente.service";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import { ErrorStateMatcher } from "@angular/material/core";
import { ToastrService } from "ngx-toastr";
import { TestService } from "../../service/test.service";
import { MembresiaService } from "../../service/membresia.service";
import { AuthService } from "../../service/auth.service";
import { autoTable } from "jspdf-autotable";
import { plan } from "../../models/plan";
import { Subject, Observable } from 'rxjs';
import { WebcamImage, WebcamInitError } from 'ngx-webcam';
import { agregarContra } from "../../service/agregarContra.service";
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
  //imageUrl: string | ArrayBuffer | null = null;

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
  hide = true;
  responseData: any = {};
  correo: any;
  idClient : any;
  form: FormGroup;
  message: string = "";
  idMembresia: any;
  nameMembresia: any;
  precioId: any;
  email: any;
  videoStream: MediaStream | null = null;
  canvas: HTMLCanvasElement | null = null;
  cameraOn: boolean = false;
  isCameraOn = false;
  planes: any;
  ver: string = '';
  actualizar_imagen: string = '';
  photoSelected: string | ArrayBuffer | null;
  public errors: WebcamInitError[] = [];
  selectedFile: File | null = null;
  idMemGlobal: any;
  imageUrl =
    "https://images.vexels.com/media/users/3/137047/isolated/preview/5831a17a290077c646a48c4db78a81bb-icono-de-perfil-de-usuario-azul.png"; // URL de la imagen por defecto

  @ViewChild("videoElement") videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild("defaultImage") defaultImage!: ElementRef<HTMLImageElement>;
  private trigger: Subject<void> = new Subject<void>();
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();
  public deviceId: string;

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }


  
  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }
  public videoOptions: MediaTrackConstraints = {
    // width: {ideal: 1024},
    // height: {ideal: 576}
  };

  constructor(
    public fb: FormBuilder,
    private clienteService: ClienteService,
    public testService: TestService,
    public usuario: ColaboradorService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private planService: MembresiaService,
    private auth: AuthService,
    private add: agregarContra,
    private spinner: NgxSpinnerService,
    public dialogo: MatDialogRef<RegistroComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string


  ) {
    this.idMembresia = this.activeRoute.snapshot.paramMap.get("id");
    this.nameMembresia = this.activeRoute.snapshot.paramMap.get("idName");
    this.precioId = this.activeRoute.snapshot.paramMap.get("idPrecio");

    this.photoSelected = null;
      this.file = new File([], 'defaultFileName');
      this.deviceId = '';
      this.webcamImage = null;

    this.form = this.fb.group({
      nombreU: ['', Validators.compose([ Validators.required, Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/)])],
      apPaterno: ['', Validators.compose([ Validators.required, Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/)])],
      apMaterno: ['', Validators.compose([ Validators.required, Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/)])],
      fon: ['', Validators.compose([Validators.required, Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      codigoPostal: ['', Validators.compose([Validators.pattern(/^(0|[1-9][0-9]*)$/), Validators.minLength(5)])],
      ciudad: ['', Validators.compose([Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/)])],
      colonia: ['', Validators.compose([Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/)])],
      calle: ['', Validators.compose([Validators.pattern(/^[A-Za-zñÑáéíóú0-9 ]*[A-Za-z][A-Za-zñÑáéíóú0-9 ]*$/)])],
      numInter: ['', Validators.compose([Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      numExterno: ['', Validators.compose([Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      estado: [''],
      idGym:[this.auth.idGym.getValue()],
      //direccion: ['', Validators.compose([ Validators.required, Validators.pattern(/^[A-Za-zñÑáéíóú0-9 ./#]*[A-Za-z][A-Za-zñÑáéíóú0-9 ./#]*$/)])],
      fechaNacimiento: ['', Validators.required],
      //curp: ['', Validatfors.compose([ Validators.minLength(18), Validators.pattern(/^[A-ZÑ0-9]*[A-Z][A-ZÑ0-9]*$/)])],
      
   //   pass: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
      //tiene_huella:[''],
      
      fotoUrl:['', Validators.required],
      //peso:['', Validators.compose([Validators.pattern(/^(0|[1-9][0-9]*)$/), Validators.max(300)])],
      //estatura:['', Validators.compose([Validators.pattern(/^(0|[1-9][0-9]*)$/), Validators.max(250)])],
      Gimnasio_idGimnasio:[this.auth.idGym.getValue()],
      //Membresia_idMem:['', Validators.required],
      nombreArchivo: [''],
      base64textString: [''],

      email: ['', Validators.compose([Validators.required, Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)])],  
      pass: [''],
      user:['saad'],
      //no_clave: ['0'],
      nombre:[''],
      destino:["Cliente"],
      direccion:[''],
      codigoPromotor:[0],
      Genero:['Mjer'],
    })

  }

  ngOnInit(): void {
    this.planService.consultarPlanId(this.auth.idGym.getValue()).subscribe((respuesta) => {
      const valorMembresia$ = this.obtenerValorMembresia(respuesta);
      valorMembresia$.subscribe((valorMembresia) => {
        this.form.patchValue({
          Membresia_idMem: valorMembresia
        });
      });
    });
  }

  obtenerValorMembresia(respuesta: any[]): Observable<any> {
    return new Observable((observer) => {
      if (Array.isArray(respuesta) && respuesta.length > 0) {
        const primerPlan = respuesta[0]; // Obtener el primer objeto del arreglo
        this.idMemGlobal = primerPlan.idMem; // Asignar el valor a la variable global
        this.planes = respuesta.map((dato) => ({
          value: dato.idMem, // Valor que se enviará al seleccionar
          label: dato.titulo, // Etiqueta que se mostrará en el combo
        }));
  
        observer.next(this.idMemGlobal);
        observer.complete();
      } else {
        console.error("La respuesta no es un arreglo.");
        observer.error("La respuesta no es un arreglo.");
      }
    });
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

    cerrarDialogo(): void {
      this.dialogo.close(true);
    }

 

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.form.patchValue({
          fotourl: reader.result // Asignar la URL generada por FileReader al campo 'fotourl'
        });
      };
    }
  }
  
  takeSnapshot() {
    if (this.videoElement && this.defaultImage) {
      const video = this.videoElement.nativeElement;
      const image = this.defaultImage.nativeElement;

      if (video.srcObject) {
        const canvas = this.getCanvas(video.videoWidth, video.videoHeight);

        if (canvas) {
          const context = canvas.getContext("2d");
          if (context) {
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            this.imageUrl = canvas.toDataURL("image/png"); // Actualiza la imagen con la captura

            // Oculta el video y muestra la imagen capturada
            video.style.display = "none";
            image.style.display = "block";
          }
        }
      }
    }
  }

  getCanvas(width: number, height: number): HTMLCanvasElement | null {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    this.canvas = canvas;
    return canvas;
  }

 
  toggleCamera() {
    this.isCameraOn = !this.isCameraOn;

    if (this.isCameraOn) {
      this.startCamera();
    } else {
      this.stopCamera();
    }
  }

  startCamera() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (this.videoElement) {
          this.videoElement.nativeElement.srcObject = stream;
          this.videoElement.nativeElement.style.display = "block";
        }
        if (this.defaultImage) {
          this.defaultImage.nativeElement.style.display = "none";
        }
      })
      .catch((error) => {
        console.error("Error al acceder a la cámara:", error);
      });
  }
  
  archivo = {
    id: 0,
    nombreArchivo: '',
    base64textString: ''
  }

  public cameraWasSwitched(deviceId: string): void {
    this.deviceId = deviceId;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }
  public triggerSnapshot(): void {
    this.trigger.next();

    // Ocultar la camaraweb despues de tomar la foto
    this.toggleWebcam();
  }


  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }
  public webcamImage: WebcamImage | null;
  public allowCameraSwitch = true;
  not_format: boolean = false;
  not_size: boolean = false;
  public showWebcam = false;

  resetWebcamImage(): void {
    this.webcamImage = null;
    this.archivo.base64textString = '';
    this.archivo.nombreArchivo = '';
  }

  file: File;
  stopCamera() {
    if (this.videoElement) {
      const stream = this.videoElement.nativeElement.srcObject as MediaStream;
      const tracks = stream.getTracks();

      tracks.forEach((track) => track.stop());
      this.videoElement.nativeElement.srcObject = null;
      this.videoElement.nativeElement.style.display = "none";
    }
    if (this.defaultImage) {
      this.defaultImage.nativeElement.style.display = "block";
    }
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
        // Validar si el archivo seleccionado es una imagen
        if (!file.type.startsWith('image/')) {
          this.not_format = true;
          this.toastr.error('El archivo seleccionado no es una imagen', 'Error');
          return;
        }
        // Validar si el archivo excede el tamaño máximo permitido de 1mb
        if (file.size > 1024 * 1024) {
          this.not_size = true;
          this.toastr.error('El tamaño de la imagen debe ser menor a 1MB', 'Error');
          return;
        }
      }
      // Almacenar el nombre del archivo/imagen en el json Archivo
      this.archivo.nombreArchivo = file.name;

      this.file = <File>event.target.files[0];
      // image preview
      const reader = new FileReader();
      reader.onload = e => this.photoSelected = reader.result;
      reader.readAsDataURL(this.file);
     
      if (files && file) {
        
        const newReader = new FileReader();
        newReader.onload = this._handleReaderLoaded.bind(this);
     
        newReader.readAsBinaryString(file);
        
      }

     
    } else {
      // Si no se selecciona ninguna imagen, mostrar la imagen por defecto y resetear valores del objeto Archivo
      this.photoSelected = null;
      this.archivo.base64textString = '';
      this.archivo.nombreArchivo = '';
      return;
    }
   
  }

  // Codificar la imagen a base64

  handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    // Almacenar la imagen en el objeto Archivo
    this.archivo.base64textString = this.webcamImage.imageAsBase64;
    // Agregar el nombre al archivo - como tal la foto tomada no tiene nombre - por lo que se le asigna uno
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

  registrarUsuario(){
    const codigoPostal = this.form.get("codigoPostal")?.value;
    const estado = this.form.get("estado")?.value;
    const ciudad = this.form.get("ciudad")?.value;
    const colonia = this.form.get("colonia")?.value;
    const calle = this.form.get("calle")?.value;
    const numInter = this.form.get("numInter")?.value;
    const numExterno = this.form.get("numExterno")?.value;
    const fon = this.form.get("fon")?.value;

    const nombreU = this.form.get("nombreU")?.value;
    const apPaterno = this.form.get("apPaterno")?.value;
    const apMaterno = this.form.get("apMaterno")?.value;
    const fechaNacimiento = this.form.get("fechaNacimiento")?.value;

    const direccionCompleta = `${calle} ${numExterno ? "Ext. " + numExterno: ""}, ${numInter ? "Int. " + numInter : ""}, ${colonia}, ${ciudad}, ${estado}, CP ${codigoPostal}`;

    const nombreCompleto = `${nombreU} ${apPaterno} ${apMaterno}`;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true; // Bloquea el cierre del diálogo haciendo clic fuera de él
    dialogConfig.data = 'Registro agregado correctamente.'; // Datos a pasar al diálogo

      // Bloquea el cierre del diálogo haciendo clic fuera de él
      //console.log("direccionCompleta", direccionCompleta);
      //console.log("nombreCompleto:",nombreCompleto);
      // Establecer la dirección completa en un nuevo control del formulario
      this.form.patchValue({
        direccion: direccionCompleta,
        nombre: nombreCompleto
      });

      this.usuario.agregarUsuario(this.form.value).subscribe({
        next: (resultData) => {
          this.spinner.show();
          if (resultData.message === 'MailExists') {
            this.toastr.error('El correo electrónico ya existe.', 'Error!!!');
            this.spinner.hide();
          } else if (resultData.success == '1') {
            this.cerrarDialogo();
            this.spinner.hide();
            this.dialog.open(MensajeEmergentesComponent, dialogConfig).afterClosed().subscribe((cerrarDialogo: boolean) => {
              if (cerrarDialogo) {
                this.router.navigateByUrl(`/home`);
                // Realizar alguna acción si se cierra el diálogo
              } else {
                // Realizar alguna acción si no se cierra el diálogo
              }
            });
  
          }
        },
        error: (error) => {
          console.log(error, "error");
          this.toastr.error('Ocurrió un error al intentar agregar el empleado.', 'Error!!!');
        }
      });
    }

  // registrar(): any {
  //   console.log(this.form.value, "formulario");
  //   this.email = this.form.value.email;
  //   if (this.form.valid) {
  //     this.spinner.show();
  //     this.clienteService.consultarEmail(this.email).subscribe((resultData) => {
  //       if (resultData.msg == "emailExist") {
  //         this.toastr.warning("El correo ingresado ya existe.", "Alerta!!!");
  //       }
  //       if (resultData.msg == "emailNotExist") {
  //         this.clienteService
  //           .guardarCliente(this.form.value)
  //           .subscribe((respuesta) => {
  //             this.spinner.hide();
  //             this.dialog
  //               .open(MensajeEmergentesComponent, {
  //               data: `Usuario registrado exitosamente`,
  //             })
  //             .afterClosed()
  //             .subscribe((cerrarDialogo: Boolean) => {
  //               if (cerrarDialogo) {
  //                 this.dialogo.close(true);
  //                 this.add.enviarMail(respuesta.email).subscribe(
  //                   (response) => {
  //                   },
  //                   (error) => {
  //                     console.error('Error al enviar el correo:', error);
  //                     // Aquí puedes manejar el error según tus necesidades
  //                   }
  //                 );
                  
  //                 this.clienteService.consultarDataPago(this.form.value.email).subscribe(respuesta =>{
  //                   this.responseData=respuesta;
  //                     this.clienteService.idPagoSucursal(this.responseData.ID_Cliente).subscribe((resultado)=> {

  //                       this.router.navigateByUrl(`/home`);
  //                     });
  //                     //console.log(resultado.msg);
  //                 });  
  //               } 
  //             });
            
  //           },
  //           (error) => {
  //             // Manejar errores de solicitud HTTP
  //             if (error.status === 400) {
  //               if (error.error && error.error.msg === 'error_tipo_archivo_no_soportado') {
  //                 // Manejar el error específico 'error_tipo_archivo_no_soportado'
  //                 console.error('Error 400: Tipo de archivo no soportado', error);
  //                 this.toastr.error('Error: Tipo de archivo no soportado');
  //               } else {
  //                 // Otro tipo de error 400
  //                 console.error('Error 400: Bad Request', error);
  //                 this.toastr.error('Error: no se pudo agregar usuario. Intente de nuevo');
  //               }
  //             } else {
  //               // Otro tipo de error diferente a 400
  //               console.error('Error: Otro tipo de error', error);
  //               this.toastr.error('Error: no se pudo agregar usuario. Intente de nuevo');
  //             }
              
  //           }
            
  //           );
  //       }
        
  //     });
  //   } else {
  //     // El formulario no es válido, muestra un mensaje de error
  //     this.toastr.error('Llenar los campos requeridos', 'Error');
  //     this.marcarCamposInvalidos(this.form);

  //     if (!this.form.value.fotoUrl || this.form.value.fotoUrl.length === 0) {
  //       this.toastr.error('Agregar o sube una imagen', 'Error');
  //     }

  //   }
  // }
}
