
import { GimnasioService } from './../../service/gimnasio.service';
import { HorarioService } from './../../service/horario.service';
import { Router } from "@angular/router";
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HorarioEditarComponent } from '../horario-editar/horario-editar.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MensajeEliminarComponent } from '../mensaje-eliminar/mensaje-eliminar.component';
import { FranquiciaService } from './../../service/franquicia.service';
import { FormGroup, FormBuilder, Validators, FormGroupDirective, NgForm, FormArray, FormControl } from '@angular/forms';
import { ErrorStateMatcher} from '@angular/material/core';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { PostalCodeService } from './../../service/cp.service';
import { AuthService } from './../../service/auth.service';
import { ColaboradorService } from './../../service/colaborador.service';
import { mergeMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, formulario: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = formulario && formulario.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-horarios-vista',
  templateUrl: './horarios-vista.component.html',
  styleUrls: ['./horarios-vista.component.css']
})
export class HorariosVistaComponent implements OnInit{
  idGimnasio: number = 0; // Asegúrate de obtener el ID de alguna manera, por ejemplo, a través de ActivatedRoute
  datosHorario: any[] = [];
  message: string = "";
  sucursales: any;
  optionToShow: number = 0;
  franquicia: any;
  formularioSucursales: FormGroup;
  personaForm: FormGroup;
  mostrarFormularioAdministrador: boolean = false;
  postalCodeControl = new FormControl('');
  addressControl = new FormControl('');
  asentamientosUnicos: Set<string> = new Set<string>();
  matcher = new MyErrorStateMatcher();

  constructor(private gimnasioService: GimnasioService, private spinner: NgxSpinnerService,private HorarioService: HorarioService,private route: ActivatedRoute,
    public dialogo: MatDialogRef<HorariosVistaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    
    public dialog: MatDialog, private formulario: FormBuilder,  private auth: AuthService, private http: ColaboradorService,
    private franquiciaService: FranquiciaService, private router: Router, private postalCodeService: PostalCodeService) {
    // Obtén el ID del parámetro de la URL
    //this.idGimnasio = this.route.snapshot.params['id'];
    //this.idGimnasio = data.idGimnasio; // Accede a idGimnasio desde los datos

    //Creacion del formulario:
    this.formularioSucursales = this.formulario.group({
      nombreBodega: ['', Validators.compose([Validators.required])],
      codigoPostal: ['', Validators.compose([Validators.required,Validators.pattern(/^(0|[1-9][0-9]*)$/), Validators.maxLength(5)])],
      estado: ['', Validators.compose([Validators.required,Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/)])],
      ciudad: ['', Validators.compose([Validators.required,Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/)])],
      colonia: ['', Validators.compose([Validators.required])],
      calle: ['', Validators.compose([Validators.required])],
      numExt: ['', Validators.compose([Validators.required,Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      numInt: ['', Validators.compose([Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      numeroTelefonico: ['', Validators.compose([Validators.required, Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      tipo: ["", Validators.required],
      Franquicia_idFranquicia: [1],
      estatus: [1, Validators.required],
      idGimnasio: [this.idGimnasio],
      casilleros: ['0', Validators.required],
      estacionamiento: ['0', Validators.required],
      regaderas: ['0', Validators.required],
      bicicletero: ['0', Validators.required]
    });

    this.personaForm = this.formulario.group({
      nombre: ['', Validators.compose([Validators.required,Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/)])],
      apPaterno: ['', Validators.compose([Validators.required,Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/)])],
      apMaterno: ['', Validators.compose([Validators.required,Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/)])],
      telefono: ['', Validators.compose([Validators.required, Validators.pattern(/^(0|[1-9][0-9]*)$/), Validators.minLength(10)])],
      area: [2],
      turnoLaboral: ['Matutino'],
      salario: [0],
      Gimnasio_idGimnasio: ["", Validators.required], 
    });    
  }

  isSupadmin(): boolean {
    return this.auth.isSupadmin();
  }

  ngOnInit(): void {
    this.gimnasioService.optionSelected.subscribe((data) => {
      if(data) {
        this.optionToShow = data;
        if(this.optionToShow === 1){
          this.consultarHorario();
        }
        else if(this.optionToShow === 2){
          this.consultarFranquicia();
        }
        else if(this.optionToShow === 3){
          this.consultarFranquicia();
          this.editarCosa();
        }
      }
    });
  }

  actualizarSelect() {
    if (this.isSupadmin()) {
      console.log(this.formularioSucursales.value, "formulario de persona");
      setTimeout(() => {
        this.http.comboDatosGymByNombre(this.formularioSucursales.value.nombreBodega).subscribe({
          next: (dataResponse) => {
            if (Array.isArray(dataResponse) && dataResponse.length > 0 && dataResponse[0].idBodega) {
              this.personaForm.patchValue({
                Gimnasio_idGimnasio: dataResponse[0].idBodega,
              });
            }
            this.sucursales = dataResponse;
          }
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
  const nombre = this.personaForm.value.nombre;
  // Mensaje que se enviará
  const mensaje = `Hola ${nombre} estos son tus accesos... Correo: ${this.email}, Contraseña: ${this.pass}`;

  // Crear la URL para abrir WhatsApp con el mensaje predefinido
  const url = `https://wa.me/${numeroTelefonico}?text=${encodeURIComponent(mensaje)}`;

  // Abrir WhatsApp en una nueva ventana o pestaña
  window.open(url, '_blank');
}
  /*-----------HORARIOS METHODS---------- */
  consultarHorario() {
    this.HorarioService.consultarHorario(this.idGimnasio).subscribe(
      (data) => {
        this.datosHorario = data;  
      },
      (error) => {
        this.message = "Horario no disponible. El administrador aún no ha registrado información";
        console.error('Error al consultar el horario:', error);
      }
    );
  }

  /*---------ADD SUCURSAL METHODS----------*/
  consultarFranquicia() {
    this.franquiciaService.obternerFran().subscribe((data) => {
      if(data) {
        this.franquicia = data;
      }
    });
  }

  onSelectionChange(event: any) {
  }

  enviarForm(): void {
    
    if (this.formularioSucursales.valid) {
      this.spinner.show();
      // Llama al servicio para agregar la sucursal
      this.gimnasioService.agregarSucursal(this.formularioSucursales.value).subscribe((respuesta) => {
        if(respuesta){
          const idGimnasioInsertado = respuesta.idBodega; // Ajusta esto según la estructura de tu respuesta

          // Usa el idGimnasioInsertado en tu otro formulario
          this.personaForm.patchValue({
            Gimnasio_idGimnasio: idGimnasioInsertado,
          });

          if(respuesta.success === 1){
            this.spinner.hide();
            this.dialog.open(MensajeEmergentesComponent, {
              data: `Sucursal agregada exitosamente`,
            }).afterClosed().subscribe((cerrarDialogo: Boolean) => {
              if (cerrarDialogo) {
                this.dialogo.close();
                this.formularioSucursales.reset();
              } else {
              }
            });
        } else {
        }
      }
      });
    } else {
      this.message = "Por favor, complete todos los campos requeridos.";
    }
  }

  getAddressFromPostalCode() {
  }

  consultarCodigoPostal(): void {
    const codigoPostal = this.formularioSucursales.get('codigoPostal')?.value;
  
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
          this.formularioSucursales.get('estado')?.setValue(primerResultado.estado);
          this.formularioSucursales.get('ciudad')?.setValue(primerResultado.municipio);
        } else {
        }
      },
      (error) => {
        console.error(error);
        // Manejar errores si es necesario
      }
    );
  }
  
  
  cancelar(){
    this.dialogo.close();
  }

  /*-----------EDIT SUCURSAL METHODS-----------*/

  editarCosa(){
    this.gimnasioService.gimnasioSeleccionado.subscribe((data) => {
      if(data) {
        this.idGimnasio = data;
        this.gimnasioService.consultarPlan(this.idGimnasio).subscribe((data) => {
          if(data) {
            this.formularioSucursales.setValue({
              nombreBodega: data[0].nombreBodega,
              codigoPostal: data[0].codigoPostal,
              estado: data[0].estado,
              ciudad: data[0].ciudad,
              colonia: data[0].colonia,
              calle: data[0].calle,
              numExt: data[0].numExt,
              numInt: data[0].numInt,
              numeroTelefonico: data[0].numeroTelefonico,
              tipo: data[0].tipo,
              Franquicia_idFranquicia: data[0].Franquicia_idFranquicia,
              estatus: data[0].estatus,
              idGimnasio: this.idGimnasio,
              casilleros: data[0].casilleros,
              estacionamiento: data[0].estacionamiento,
              regaderas: data[0].regaderas,
              bicicletero: data[0].bicicletero
            });
          }
        });
      }
    });

    this.http.consultarIdEmpleado(this.data.empleadoID).subscribe(
      (resultData) => {
        if (resultData && resultData.length > 0) {
          // Asignar valores a los campos correspondientes al formulario
          this.personaForm.setValue({
            nombre: resultData[0]['nombre'],
            apPaterno: resultData[0]['apPaterno'],
            apMaterno: resultData[0]['apMaterno'],
            Gimnasio_idGimnasio: resultData[0]['Gimnasio_idGimnasio'],
            turnoLaboral: resultData[0]['turnoLaboral'],
            salario: resultData[0]['salario'],
            email: resultData[0]['email']
          });
        }
      },
      (error) => {
        console.error('Error al consultar el empleado:', error);
      }
    );
  
  }

  editarSucursal() {
    this.gimnasioService.gimnasioSeleccionado.subscribe((data) => {
      if(data) {
        this.idGimnasio = data;
        this.gimnasioService.consultarPlan(this.idGimnasio).subscribe((data) => {
          if(data) {
            this.formularioSucursales.setValue({
              nombreBodega: data[0].nombreBodega,
              codigoPostal: data[0].codigoPostal,
              estado: data[0].estado,
              ciudad: data[0].ciudad,
              colonia: data[0].colonia,
              calle: data[0].calle,
              numExt: data[0].numExt,
              numInt: data[0].numInt,
              numeroTelefonico: data[0].numeroTelefonico,
              tipo: data[0].tipo,
              Franquicia_idFranquicia: data[0].Franquicia_idFranquicia,
              estatus: data[0].estatus,
              idGimnasio: this.idGimnasio,
              casilleros: data[0].casilleros,
              estacionamiento: data[0].estacionamiento,
              regaderas: data[0].regaderas,
              bicicletero: data[0].bicicletero
            });
          }
        });
      }
    });
  }

  confirmarEdicionTodo() {}

  confirmarEdicion() {
    this.spinner.show();
    this.gimnasioService.actualizarSucursal(this.formularioSucursales.value).subscribe((respuesta) => {
      if(respuesta){
        if(respuesta.success === 1){
          this.spinner.hide();
          this.dialog.open(MensajeEmergentesComponent, {
            data: `Sucursal editada exitosamente`,
          }).afterClosed().subscribe((cerrarDialogo: Boolean) => {
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
    width:'60%',
    height:'90%',
    data: { idGimnasio: idGimnasio },
  });
}

 email: string = '';
 pass: string = '';

 
 generarCorreoYContrasena() {
  const nombreSinEspacios = this.personaForm.value.nombre ? this.personaForm.value.nombre.replace(/\s/g, '') : '';
  const apellidoPaternoSinEspacios = this.personaForm.value.apPaterno ? this.personaForm.value.apPaterno.replace(/\s/g, '') : '';

  if (nombreSinEspacios && apellidoPaternoSinEspacios) {
    this.email = `${nombreSinEspacios.toLowerCase()}.${apellidoPaternoSinEspacios.toLowerCase()}@gmail.com`;
    this.pass = this.generarContrasena(8);
  } else {
    // Manejo si no se proporciona el nombre y/o apellido
    this.email = '';
    this.pass = '';
  }
}

// Método para generar la contraseña
private generarContrasena(longitud: number): string {
  const caracteresPermitidos = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=';
  let pass = '';

  for (let i = 0; i < longitud; i++) {
    const indiceAleatorio = Math.floor(Math.random() * caracteresPermitidos.length);
    pass += caracteresPermitidos.charAt(indiceAleatorio);
  }

  return pass;
}


enviarFormulario() {
  // Aquí puedes agregar la lógica para enviar los datos al backend
  const datosFormulario = this.personaForm.value;
  datosFormulario.email = this.email;
  datosFormulario.pass = this.pass;

  this.http.agregarEmpleado(datosFormulario).subscribe(
    (respuesta) => {
    },
    (error) => {
      // Manejo de errores
      console.error('Error en la solicitud al servidor:', error);
    }
  );
}


enviarFormularios(): void {
  if (this.formularioSucursales.valid && this.personaForm.valid) {
    this.gimnasioService.agregarSucursal(this.formularioSucursales.value).pipe(
      mergeMap((respuestaSucursal) => {
        if (respuestaSucursal && respuestaSucursal.success === 1) {
          const datosFormulario = this.personaForm.value;
          datosFormulario.email = this.email;
          datosFormulario.pass = this.pass;
          return this.http.agregarEmpleado(datosFormulario);
        } else {
          // Si la operación anterior falla, retornar un observable de error
          return throwError('Error en la operación de agregarSucursal');
        }
      })
    ).subscribe(
      (respuestaEmpleado) => {
        this.dialog.open(MensajeEmergentesComponent, {
          data: `Operaciones completadas exitosamente`,
        }).afterClosed().subscribe((cerrarDialogo: Boolean) => {
          if (cerrarDialogo) {
            this.dialogo.close();
            this.formularioSucursales.reset();
            this.personaForm.reset();
          }
        });
      },
      (error) => {
        // Manejo de errores
        console.error('Error en la solicitud al servidor:', error);
        // Puedes agregar lógica adicional aquí según tus necesidades
      }
    );
  } else {
    this.message = "Por favor, complete todos los campos requeridos.";
  }
}

enviarSucursal(): void {
  console.log(this.formularioSucursales.value, "formulario");
  if (this.formularioSucursales.valid) {
    this.gimnasioService.agregarSucursal(this.formularioSucursales.value).subscribe(
      (respuestaSucursal) => {
        if (respuestaSucursal && respuestaSucursal.success === 1) {
          this.mostrarFormulario();
          this.actualizarSelect();
        } else {
          // Manejo de errores en la respuesta de agregarSucursal
        }
      },
      (error) => {
        // Manejo de errores en la solicitud al servidor para agregarSucursal
        console.error('Error en la solicitud al servidor para agregarSucursal:', error);
      }
    );
  } else {
    this.message = "Por favor, complete todos los campos requeridos.";
    this.marcarCamposInvalidos(this.formularioSucursales);
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
  
enviarEmpleado(): void {
  console.log(this.personaForm.value, "form");
  if (this.personaForm.valid) {
    const datosFormulario = this.personaForm.value;
    datosFormulario.correo = this.email;
    datosFormulario.pass = this.pass;    
    this.http.agregarEmpleado(datosFormulario).subscribe(
      (respuestaEmpleado) => {
        if (respuestaEmpleado && respuestaEmpleado.msg === 'Success' ) {
          this.dialog.open(MensajeEmergentesComponent, {
            data: `Empleado agregado exitosamente`,
            disableClose: true
          }).afterClosed().subscribe((cerrarDialogo: Boolean) => {
            if (cerrarDialogo) {
              this.dialogo.close();
              this.personaForm.reset();
            }
          });
        } else {
          if (respuestaEmpleado) {
            console.error('Error al agregar empleado:', respuestaEmpleado.error);
          } else {
            console.error('Error al agregar empleado: respuesta vacía');
          }
        }
      },
      (error) => {
        // Manejo de errores en la solicitud al servidor para agregarEmpleado
        console.error('Error en la solicitud al servidor para agregarEmpleado:', error);
        // Aquí puedes mostrar un mensaje de error o ejecutar alguna otra acción
      }
    );
  } else {
    this.message = "Por favor, complete todos los campos requeridos.";
  }
}


}
