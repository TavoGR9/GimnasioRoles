import { GimnasioService } from "./../../service/gimnasio.service";
import { Component, ViewChild, ElementRef } from '@angular/core';
import { HorarioService } from "./../../service/horario.service";
import { Router } from "@angular/router";
import {  OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatDialog } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormGroupDirective,
  NgForm,
  FormControl,
} from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import { PostalCodeService } from "./../../service/cp.service";
import { AuthService } from "./../../service/auth.service";
import { ColaboradorService } from "./../../service/colaborador.service";
import { NgxSpinnerService } from "ngx-spinner";

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    formulario: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = formulario && formulario.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}
@Component({
  selector: "app-horarios-vista",
  templateUrl: "./horarios-vista.component.html",
  styleUrls: ["./horarios-vista.component.css"],
})
export class HorariosVistaComponent implements OnInit {
  idGimnasio: number = 0;
  datosHorario: any[] = [];
  message: string = "";
  correoEmp: string = "";
  pass: string = "";
  sucursales: any;
  optionToShow: number = 0;
  franquicia: any;
  formularioSucursales: FormGroup;
  personaForm: FormGroup;
  mostrarFormularioAdministrador: boolean = false;
  postalCodeControl = new FormControl("");
  addressControl = new FormControl("");
  asentamientosUnicos: Set<string> = new Set<string>();
  matcher = new MyErrorStateMatcher();
  idGym: number = 0;
  idGimnasioE: any;
  /*FOTO*/
  not_format: boolean = false;
  not_size: boolean = false;
  photoSelected: string | ArrayBuffer | null;
  file: File;
  actualizar_imagen: string = '';
  public showWebcam = false;
  archivo = {
    id: 0,
    nombreArchivo: '',
    base64textString: ''
  }

  constructor(
    public dialogo: MatDialogRef<HorariosVistaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private gimnasioService: GimnasioService,
    private spinner: NgxSpinnerService,
    private HorarioService: HorarioService,
    public dialog: MatDialog,
    private formulario: FormBuilder,
    private auth: AuthService,
    private http: ColaboradorService,
    private toastr: ToastrService,
    private postalCodeService: PostalCodeService
  ) {
    this.photoSelected = null;
    this.file = new File([], 'defaultFileName');

    this.formularioSucursales = this.formulario.group({
      nombre: ["", Validators.compose([Validators.required])],
      codigoPostal: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(/^(0|[1-9][0-9]*)$/),
          Validators.maxLength(5),
        ]),
      ],
      estado: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/),
        ]),
      ],
      ciudad: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/),
        ]),
      ],
      colonia: ["", Validators.compose([Validators.required])],
      calle: ["", Validators.compose([Validators.required])],
      numExt: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(/^(0|[1-9][0-9]*)$/),
        ]),
      ],
      numInt: [
        "",
        Validators.compose([Validators.pattern(/^(0|[1-9][0-9]*)$/)]),
      ],
      numeroTelefonico: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(/^(0|[1-9][0-9]*)$/),
        ]),
      ],
      estatus: [0, Validators.required],
      direccion: [""],
      nombreArchivo: [''],
      base64textString: [''],
      fotoUrl:['', Validators.required],
    });

    this.personaForm = this.formulario.group({
      nombreS: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/),
        ]),
      ],
      apPaterno: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/),
        ]),
      ],
      apMaterno: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/),
        ]),
      ],
      celular: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(/^(0|[1-9][0-9]*)$/),
          Validators.minLength(10),
        ]),
      ],
      puesto: ["Administrador"],
      foto: [""],
      jefe: ["1"],
      email: [""],
      nombre: [""],
      idGym: [""],
    });
  }

  isSupadmin(): boolean {
    return this.auth.isSupadmin();
  }

  ngOnInit(): void {
    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
      if (this.personaForm.get("idGym") !== null) {
        this.personaForm.get("idGym")!.setValue(this.idGym);
      }
    });
    this.gimnasioService.optionSelected.subscribe((data) => {
      if (data) {
        this.optionToShow = data;
        if (this.optionToShow === 1) {
          this.consultarHorario();
        } else if (this.optionToShow === 2) {
        } else if (this.optionToShow === 3) {
          this.editarCosa();
        }
      }
    });
  }

  cerrarDialogo(): void {
    this.dialogo.close();
  }

  mostrarFormulario() {
    this.mostrarFormularioAdministrador = true;
  }

  enviarMensajeWhatsApp() {
    // Número de teléfono al que se enviará el mensaje
    const numeroTelefonico = this.personaForm.value.celular;
    const nombre = this.personaForm.value.nombreS;
    // Mensaje que se enviará
    const mensaje = `Hola ${nombre} estos son tus accesos... Correo: ${this.correoEmp}, Contraseña: ${this.pass}`;
    // Crear la URL para abrir WhatsApp con el mensaje predefinido
    //const url = `https://wa.me/${numeroTelefonico}?text=${encodeURIComponent(mensaje)}`;

    const url = `https://api.whatsapp.com/send?phone=${numeroTelefonico}&text=${encodeURIComponent(mensaje)}`;

    // Abrir WhatsApp en una nueva ventana o pestaña
    window.open(url, "_blank");
  }

  consultarHorario() {
    this.HorarioService.consultarHorario(this.idGimnasio).subscribe(
      (data) => {
        this.datosHorario = data;
      },
      (error) => {
        this.message =
          "Horario no disponible. El administrador aún no ha registrado información";
        console.error("Error al consultar el horario:", error);
      }
    );
  }

  consultarCodigoPostal(): void {
    const codigoPostal = this.formularioSucursales.get("codigoPostal")?.value;
    // Reiniciar el conjunto antes de agregar nuevos asentamientos
    this.asentamientosUnicos.clear();

    this.postalCodeService.consultarCodigoPostal(codigoPostal).subscribe(
      (response: any[]) => {
        if (response && response.length > 0) {
          response.forEach((resultado: any) => {
            this.asentamientosUnicos.add(resultado.asentamiento);
          });
        } else {
        }

        if (response.length > 0) {
          // Mostrar solo el primer resultado
          const primerResultado = response[0];
          this.formularioSucursales
            .get("estado")
            ?.setValue(primerResultado.estado);
          this.formularioSucursales
            .get("ciudad")
            ?.setValue(primerResultado.municipio);
        } else {
        }
      },
      (error) => {
        console.error(error);
        // Manejar errores si es necesario
      }
    );
  }

  cancelar() {
    this.dialogo.close();
  }

  editarCosa() {
    this.gimnasioService.gimnasioSeleccionado.subscribe((data) => {
      if (data) {
        this.idGimnasio = data;
        this.gimnasioService
          .consultarPlan(this.idGimnasio)
          .subscribe((data) => {
            if (data) {
              this.formularioSucursales.setValue({
                nombre: data[0].nombreBodega,
                codigoPostal: 0,
                estado: 0,
                colonia: 0,
                calle: 0,
                ciudad: 0,
                numExt: 0,
                numInt: 0,
                estatus: 1,
                direccion: data[0].direccion,
                numeroTelefonico: data[0].numeroTelefonico,
              });
            }
          });
      }
    });
  }

  confirmarEdicion() {
    this.spinner.show();
    const datosAc = {
      nombre: this.formularioSucursales.value.nombre,
      direcc: this.formularioSucursales.value.direccion,
      numero: this.formularioSucursales.value.numeroTelefonico,
      id_bod: this.idGimnasio,
    };
    this.gimnasioService.actualizarSucursal(datosAc).subscribe((respuesta) => {
      if (respuesta) {
        if (respuesta.success === 1) {
          this.spinner.hide();
          this.dialog
            .open(MensajeEmergentesComponent, {
              data: `Sucursal editada exitosamente`,
            })
            .afterClosed()
            .subscribe((cerrarDialogo: Boolean) => {
              if (cerrarDialogo) {
                this.formularioSucursales.reset();
                this.dialogo.close();
              } else {
              }
            });
        } else {
        }
      }
    });
  }

 /* verHorario(idGimnasio: string): void {
    const dialogRef = this.dialog.open(HorarioEditarComponent, {
      width: "60%",
      height: "90%",
      data: { idGimnasio: idGimnasio },
    });
  }*/

   removerAcentos(texto: string): string {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  
  generarCorreoYContrasena() {
    const nombreSinAcentos = this.personaForm.value.nombreS ? this.removerAcentos(this.personaForm.value.nombreS) : "";
    const apellidoPaternoSinAcentos = this.personaForm.value.apPaterno ? this.removerAcentos(this.personaForm.value.apPaterno) : "";
  
    const nombreSinEspacios = nombreSinAcentos.replace(/\s/g, "");
    const apellidoPaternoSinEspacios = apellidoPaternoSinAcentos.replace(/\s/g, "");
  
    if (nombreSinEspacios && apellidoPaternoSinEspacios) {
      this.correoEmp = `${nombreSinEspacios.toLowerCase()}.${apellidoPaternoSinEspacios.toLowerCase()}@gmail.com`;
      this.pass = this.generarContrasena(8); // Generar contraseña
    } else {
      // Manejo si no se proporciona el nombre y/o apellido
      this.correoEmp = "";
      this.pass = "";
    }
  }

  // Método para generar la contraseña
  private generarContrasena(longitud: number): string {
    const caracteresPermitidos =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let pass = "";
    for (let i = 0; i < longitud; i++) {
      const indiceAleatorio = Math.floor(
        Math.random() * caracteresPermitidos.length
      );
      pass += caracteresPermitidos.charAt(indiceAleatorio);
    }
    return pass;
  }

  enviarSucursal(): void {
    if (this.formularioSucursales.valid && this.personaForm.valid) {
      const nombreS = this.personaForm.get("nombreS")?.value;
      const apPaterno = this.personaForm.get("apPaterno")?.value;
      const apMaterno = this.personaForm.get("apMaterno")?.value;
      const nombreCompleto = `${nombreS} ${apPaterno} ${apMaterno}`;
      this.personaForm.patchValue({
        nombre: nombreCompleto,
      });

      const datosFormulario = this.personaForm.value;
      datosFormulario.correoEmp = this.correoEmp;
      datosFormulario.pass = this.pass;
     
      this.http.correoEmpleado(datosFormulario.correoEmp).subscribe((respuesta) => {
        if(respuesta.message === 'MailExists'){
          this.toastr.error('El correo electrónico ya existe.', 'Error!!!');
        }else{
          const codigoPostal = this.formularioSucursales.get("codigoPostal")?.value;
          const estado = this.formularioSucursales.get("estado")?.value;
          const ciudad = this.formularioSucursales.get("ciudad")?.value;
          const colonia = this.formularioSucursales.get("colonia")?.value;
          const calle = this.formularioSucursales.get("calle")?.value;
          const numExt = this.formularioSucursales.get("numExt")?.value;
          const numInt = this.formularioSucursales.get("numInt")?.value;

          const direccionCompleta = `${calle} ${numExt} ${
            numInt ? "Int. " + numInt : ""
          }, ${colonia}, ${ciudad}, ${estado}, CP ${codigoPostal}`;
          this.formularioSucursales.patchValue({
            direccion: direccionCompleta,
          });

        

          this.gimnasioService
          .agregarSucursal(this.formularioSucursales.value)
          .subscribe(
            (respuestaSucursal) => {
              
              if (respuestaSucursal && respuestaSucursal.success === 1) {
  
                datosFormulario.idGym = respuestaSucursal.id_bodega;
          
                this.http.agregarEmpleado(datosFormulario).subscribe(
                  (respuestaEmpleado) => {
                     if (respuestaEmpleado.success == "1") {
                      this.enviarMensajeWhatsApp();
                      this.dialog
                        .open(MensajeEmergentesComponent, {
                          data: `Empleado agregado exitosamente`,
                          disableClose: true,
                        })
                        .afterClosed()
                        .subscribe((cerrarDialogo: Boolean) => {
                          if (cerrarDialogo) {
                            this.dialogo.close();
                            this.personaForm.reset();
                          }
                        });
                    } else {
                      if (respuestaEmpleado) {
                        console.error(
                          "Error al agregar empleado:",
                          respuestaEmpleado.error
                        );
                      } else {
                        console.error(
                          "Error al agregar empleado: respuesta vacía"
                        );
                      }
                    }
                  },
                  (error) => {
                    // Manejo de errores en la solicitud al servidor para agregarEmpleado
                    console.error(
                      "Error en la solicitud al servidor para agregarEmpleado:",
                      error
                    );
                    // Aquí puedes mostrar un mensaje de error o ejecutar alguna otra acción
                  }
                );
              } else {
              }
            },
            (error) => {
              this.toastr.error('Error al agregar sucursal, intentelo más tarde....', 'Error', {
                positionClass: 'toast-bottom-left',
              });
            }
          );
        }
  
      });
     
    } else {
      this.message = "Por favor, complete todos los campos requeridos.";
      this.marcarCamposInvalidos(this.formularioSucursales);
      this.marcarCamposInvalidos(this.personaForm);
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
        }
      }
    });
  }

  ///****FOOOOOOOOOOOOOOOOOOOOOOOOOOOOOTO */
  uploadPhoto() {
    if (  this.archivo.nombreArchivo === '' ) {
      this.toastr.error('Aún no haz seleccionado una imagen valida...', 'Error');
      return;
    }
    this.formularioSucursales.patchValue({
      fotoUrl: this.archivo.nombreArchivo,
      nombreArchivo: this.archivo.nombreArchivo,
      base64textString: this.archivo.base64textString
    });
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
      this.photoSelected = null;
      this.archivo.base64textString = '';
      this.archivo.nombreArchivo = '';
      return;
    }
  }

  _handleReaderLoaded(readerEvent: any) {
    var binaryString = readerEvent.target.result;
    this.archivo.base64textString = btoa(binaryString);
    this.uploadPhoto();
  }
}
