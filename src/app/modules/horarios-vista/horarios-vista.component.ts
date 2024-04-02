import { GimnasioService } from "./../../service/gimnasio.service";
import { HorarioService } from "./../../service/horario.service";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { HorarioEditarComponent } from "../horario-editar/horario-editar.component";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MensajeEliminarComponent } from "../mensaje-eliminar/mensaje-eliminar.component";
import { FormGroup, FormBuilder, Validators, FormGroupDirective, NgForm, FormArray, FormControl} from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import { PostalCodeService } from "./../../service/cp.service";
import { AuthService } from "./../../service/auth.service";
import { ColaboradorService } from "./../../service/colaborador.service";
import { mergeMap, subscribeOn } from "rxjs/operators";
import { throwError } from "rxjs";
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
  idGimnasio: number = 0; // Asegúrate de obtener el ID de alguna manera, por ejemplo, a través de ActivatedRoute
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

  constructor(
    private gimnasioService: GimnasioService,
    private spinner: NgxSpinnerService,
    private HorarioService: HorarioService,
    private route: ActivatedRoute,
    public dialogo: MatDialogRef<HorariosVistaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,

    public dialog: MatDialog,
    private formulario: FormBuilder,
    private auth: AuthService,
    private http: ColaboradorService,
    private router: Router,
    private postalCodeService: PostalCodeService
  ) {
    this.formularioSucursales = this.formulario.group({
      nombre: ["", Validators.compose([Validators.required])],
      codigoPostal: ["",Validators.compose([Validators.required, Validators.pattern(/^(0|[1-9][0-9]*)$/),Validators.maxLength(5),]),],
      estado: ["",Validators.compose([Validators.required,Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/),]),],
      ciudad: ["",Validators.compose([Validators.required,Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/),]),],
      colonia: ["", Validators.compose([Validators.required])],
      calle: ["", Validators.compose([Validators.required])],
      numExt: ["",Validators.compose([Validators.required,Validators.pattern(/^(0|[1-9][0-9]*)$/),]),],
      numInt: ["",Validators.compose([Validators.pattern(/^(0|[1-9][0-9]*)$/)]),],
      numeroTelefonico: ["",Validators.compose([Validators.required,Validators.pattern(/^(0|[1-9][0-9]*)$/),]),],
      estatus: [1, Validators.required],
      direccion: [""],
    });

    this.personaForm = this.formulario.group({
      nombreS: ["",Validators.compose([Validators.required,Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/),]),],
      apPaterno: ["",Validators.compose([Validators.required,Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/),]),],
      apMaterno: ["",Validators.compose([Validators.required,Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/),]),],
      celular: ["",Validators.compose([Validators.required,Validators.pattern(/^(0|[1-9][0-9]*)$/),Validators.minLength(10),]),],
      puesto: ["Administrador"],
      foto: [""],
      jefe: ["1"],
      email: [""],
    });
  }

  isSupadmin(): boolean {
    return this.auth.isSupadmin();
  }

  ngOnInit(): void {
  }

  actualizarSelect() {
    if (this.isSupadmin()) {
      setTimeout(() => {
        this.http
          .comboDatosGymByNombre(this.formularioSucursales.value.nombreBodega)
          .subscribe({
            next: (dataResponse) => {
              if (
                Array.isArray(dataResponse) &&
                dataResponse.length > 0 &&
                dataResponse[0].idBodega
              ) {
                this.personaForm.patchValue({
                  Gimnasio_idGimnasio: dataResponse[0].idBodega,
                });
              }
              this.sucursales = dataResponse;
            },
          });
      }, 5000); // 5000 milisegundos = 5 segundos
    }
  }

  cerrarDialogo(): void {
    this.dialogo.close();
  }

  mostrarFormulario() {
    this.mostrarFormularioAdministrador = true;
  }

  enviarMensajeWhatsApp() {
    // Número de teléfono al que se enviará el mensaje
    const numeroTelefonico = this.personaForm.value.numeroTelefonico;
    const nombre = this.personaForm.value.nombreS;
    // Mensaje que se enviará
    const mensaje = `Hola ${nombre} estos son tus accesos... Correo: ${this.correoEmp}, Contraseña: ${this.pass}`;

    // Crear la URL para abrir WhatsApp con el mensaje predefinido
    const url = `https://wa.me/${numeroTelefonico}?text=${encodeURIComponent(
      mensaje
    )}`;

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
    const codigoPostal = this.formularioSucursales.get(
      "codigoPostal"
    )?.value;

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
              console.log("dtaaaaaaaaaaaaaaaaaaa", data[0].nombreBodega);
              this.formularioSucursales.setValue({
                nombre: data[0].nombreBodega,
                codigoPostal: 0,
                estado:0,
                colonia:0,
                calle:0,
                ciudad:0,
                numExt:0,
                numInt:0,
                estatus:1,
                direccion: data[0].direccion,
                numeroTelefonico: data[0].numeroTelefonico,
              });
            }
          });
      }
    });

   /* this.http.consultarIdEmpleado(this.data.empleadoID).subscribe(
      (resultData) => {
        if (resultData && resultData.length > 0) {
          // Asignar valores a los campos correspondientes al formulario
          this.personaForm.setValue({
            nombre: resultData[0]["nombre"],
            apPaterno: resultData[0]["apPaterno"],
            apMaterno: resultData[0]["apMaterno"],
            Gimnasio_idGimnasio: resultData[0]["Gimnasio_idGimnasio"],
            turnoLaboral: resultData[0]["turnoLaboral"],
            salario: resultData[0]["salario"],
            email: resultData[0]["email"],
          });
        }
      },
      (error) => {
        console.error("Error al consultar el empleado:", error);
      }
    );*/
  }

  confirmarEdicion() {
    this.spinner.show();
    this.gimnasioService
      .actualizarSucursal(this.formularioSucursales.value)
      .subscribe((respuesta) => {
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

  verHorario(idGimnasio: string): void {
    const dialogRef = this.dialog.open(HorarioEditarComponent, {
      width: "60%",
      height: "90%",
      data: { idGimnasio: idGimnasio },
    });
  }

  generarCorreoYContrasena() {
    const nombreSinEspacios = this.personaForm.value.nombreS
      ? this.personaForm.value.nombreS.replace(/\s/g, "")
      : "";
    const apellidoPaternoSinEspacios = this.personaForm.value.apPaterno
      ? this.personaForm.value.apPaterno.replace(/\s/g, "")
      : "";

    if (nombreSinEspacios && apellidoPaternoSinEspacios) {
      this.correoEmp = `${nombreSinEspacios.toLowerCase()}.${apellidoPaternoSinEspacios.toLowerCase()}@gmail.com`;
      this.pass = this.generarContrasena(8);
    } else {
      // Manejo si no se proporciona el nombre y/o apellido
      this.correoEmp = "";
      this.pass = "";
    }
  }

  // Método para generar la contraseña
  private generarContrasena(longitud: number): string {
    const caracteresPermitidos =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=";
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
    console.log(this.formularioSucursales.value, "formulario");
    if (this.formularioSucursales.valid && this.personaForm.valid) {
      const codigoPostal = this.formularioSucursales.get("codigoPostal")?.value;
      const estado = this.formularioSucursales.get("estado")?.value;
      const ciudad = this.formularioSucursales.get("ciudad")?.value;
      const colonia = this.formularioSucursales.get("colonia")?.value;
      const calle = this.formularioSucursales.get("calle")?.value;
      const numExt = this.formularioSucursales.get("numExt")?.value;
      const numInt = this.formularioSucursales.get("numInt")?.value;

      // Construir la dirección como una cadena de texto
      const direccionCompleta = `${calle} ${numExt} ${numInt ? "Int. " + numInt : ""}, ${colonia}, ${ciudad}, ${estado}, CP ${codigoPostal}`;
      console.log("direccionCompleta", direccionCompleta);
      // Establecer la dirección completa en un nuevo control del formulario
      this.formularioSucursales.patchValue({
        direccion: direccionCompleta
      });

      console.log(this.formularioSucursales.value, "formulario2");
      console.log("respuestaSucursalUnooo");
      this.gimnasioService
        .agregarSucursal(this.formularioSucursales.value)
        .subscribe(
          (respuestaSucursal) => {
            console.log(respuestaSucursal, "respuestaSucursal");
            if (respuestaSucursal && respuestaSucursal.success === 1) {
              const nombreS = this.personaForm.get("nombreS")?.value;
              const apPaterno = this.personaForm.get("apPaterno")?.value;
              const apMaterno = this.personaForm.get("apMaterno")?.value;

              const nombreCompleto = `${nombreS} ${apPaterno} ${apMaterno}`;
              console.log("nombreCompleto", nombreCompleto);
              // Establecer la dirección completa en un nuevo control del formulario
              this.personaForm.patchValue({
                nombre: nombreCompleto
              });

              const datosFormulario = this.personaForm.value;
              datosFormulario.correoEmp = this.correoEmp;
              datosFormulario.pass = this.pass;

              console.log(datosFormulario, "form2222");

              this.http.agregarEmpleado(datosFormulario).subscribe(
                (respuestaEmpleado) => {
                  console.log(respuestaEmpleado, "respuestaEmpleado");
                  if (respuestaEmpleado.success == "1") {

                    const datosEmpleadoBodega = {
                      idCategoriaP: 1,
                      codigoP: 1,
                      email: respuestaEmpleado.correoEmp,
                      id_bod: respuestaSucursal.id_bodega,
                    };

                    this.http.agregarBodegaEmpleado(datosEmpleadoBodega).subscribe(
                      (respuestaEmpleadoB) => {
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
                      }
                    ) 
                  } else {
                    if (respuestaEmpleado) {
                      console.error(
                        "Error al agregar empleado:",
                        respuestaEmpleado.error
                      );
                    } else {
                      console.error("Error al agregar empleado: respuesta vacía");
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
            // Manejo de errores en la solicitud al servidor para agregarSucursal
            console.error(
              "Error en la solicitud al servidor para agregarSucursal:",
              error
            );
          }
        );
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

  enviarEmpleado(): void {
    console.log(this.personaForm.value, "form");
    if (this.personaForm.valid) {
      const nombreS = this.personaForm.get("nombreS")?.value;
      const apPaterno = this.personaForm.get("apPaterno")?.value;
      const apMaterno = this.personaForm.get("apMaterno")?.value;

      const nombreCompleto = `${nombreS} ${apPaterno} ${apMaterno}`;
      console.log("nombreCompleto", nombreCompleto);
      // Establecer la dirección completa en un nuevo control del formulario
      this.personaForm.patchValue({
        nombre: nombreCompleto
      });

      const datosFormulario = this.personaForm.value;
      datosFormulario.correoEmp = this.correoEmp;
      datosFormulario.pass = this.pass;

      console.log(datosFormulario, "form2222");

      this.http.agregarEmpleado(datosFormulario).subscribe(
        (respuestaEmpleado) => {
          if (respuestaEmpleado.success == "1") {
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
              console.error("Error al agregar empleado: respuesta vacía");
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
      this.message = "Por favor, complete todos los campos requeridos.";
    }
  }
}
