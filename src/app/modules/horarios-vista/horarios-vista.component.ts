
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
  optionToShow: number = 0;
  franquicia: any;
  formularioSucursales: FormGroup;
  personaForm: FormGroup;
  mostrarFormularioAdministrador: boolean = false;
  postalCodeControl = new FormControl('');
  addressControl = new FormControl('');

  constructor(private gimnasioService: GimnasioService, private spinner: NgxSpinnerService,private HorarioService: HorarioService,private route: ActivatedRoute,
    public dialogo: MatDialogRef<HorariosVistaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    
    public dialog: MatDialog, private formulario: FormBuilder,  private auth: AuthService, private http: ColaboradorService,
    private franquiciaService: FranquiciaService, private router: Router, private postalCodeService: PostalCodeService) {
    // Obtén el ID del parámetro de la URL
    this.idGimnasio = this.route.snapshot.params['id'];
    this.idGimnasio = data.idGimnasio; // Accede a idGimnasio desde los datos
    console.log("id",this.idGimnasio);

    //Creacion del formulario:
    this.formularioSucursales = this.formulario.group({
      nombreGym: ['', Validators.compose([Validators.required])],
      codigoPostal: ['', Validators.compose([Validators.required,Validators.pattern(/^(0|[1-9][0-9]*)$/), Validators.maxLength(5)])],
      estado: ['', Validators.compose([Validators.required,Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/)])],
      ciudad: ['', Validators.compose([Validators.required,Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/)])],
      colonia: ['', Validators.compose([Validators.required,Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/)])],
      calle: ['', Validators.compose([Validators.required])],
      numExt: ['', Validators.compose([Validators.required,Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      numInt: ['', Validators.compose([Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      telefono: ['', Validators.compose([Validators.required, Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
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
      Gimnasio_idGimnasio: ['', Validators.required], 
    });

 /*   this.postalCodeControl.valueChanges.subscribe((postalCode) => {
      // Check if postalCode is not null before calling the function
      if (postalCode !== null) {
        this.handlePostalCodeChange(postalCode);
      }
    });*/
    
  }

  matcher = new MyErrorStateMatcher();

  isSupadmin(): boolean {
    return this.auth.isSupadmin();
  }

  sucursales: any;

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
      console.log('Las sucursales que se muestran son: ', this.formularioSucursales.value.nombreGym);
      setTimeout(() => {
        this.http.comboDatosGymByNombre(this.formularioSucursales.value.nombreGym).subscribe({
          next: (dataResponse) => {
            console.log('Las sucursales disponibles son: ', dataResponse);
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
  const telefono = this.personaForm.value.telefono;
  const nombre = this.personaForm.value.nombre;
  // Mensaje que se enviará
  const mensaje = `Hola ${nombre} estos son tus accesos... Correo: ${this.email}, Contraseña: ${this.pass}`;

  // Crear la URL para abrir WhatsApp con el mensaje predefinido
  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

  // Abrir WhatsApp en una nueva ventana o pestaña
  window.open(url, '_blank');
}


  /*-----------HORARIOS METHODS---------- */
  consultarHorario() {
    this.HorarioService.consultarHorario(this.idGimnasio).subscribe(
      (data) => {
        this.datosHorario = data;  // Asigna los datos a la propiedad
        console.log('Datos del horario:', this.datosHorario);
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
        console.log(data);
      }
    });
  }

  onSelectionChange(event: any) {
    console.log(event.value); 
  }

  enviarForm(): void {
    if (this.formularioSucursales.valid) {
      this.spinner.show();
      // Llama al servicio para agregar la sucursal
      this.gimnasioService.agregarSucursal(this.formularioSucursales.value).subscribe((respuesta) => {
        if(respuesta){
          console.log(respuesta);
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
          console.log(respuesta.error);
        }
      }
      });
    } else {
      this.message = "Por favor, complete todos los campos requeridos.";
    }
  }

 /* private handlePostalCodeChange(postalCode: string): void {
    if (postalCode) {
      this.postalCodeService.getAddressByPostalCode(postalCode).subscribe(
        (response) => {
          if (response && response.length > 0) {
            const address = response[0].display_name;
            this.addressControl.setValue(address);
          }
        },
        (error) => {
          console.error('Error fetching address:', error);
        }
      );
    }
  }*/

  getAddressFromPostalCode() {
   /* if (this.formularioSucursales) {
    const postalCode = this.formularioSucursales.get('codigoPostal')?.value;
  
    if (postalCode) {
      // Llama al servicio para obtener la dirección basada en el código postal
      this.postalCodeService.getAddressByPostalCode(postalCode).subscribe((addressInfo) => {
        // Verifica que addressInfo y display_name estén definidos antes de continuar
        console.log(addressInfo[0].display_name, "addressInfo");
        if (addressInfo && addressInfo[0].display_name) {
          console.log("hola")
          const display_name_parts = addressInfo[0].display_name.split(', ');
          
          if (display_name_parts.length >= 4) {
            // Establece los campos del formulario basados en la estructura de display_name
            this.formularioSucursales.get('estado')?.setValue(display_name_parts[3]);
           
            this.formularioSucursales.get('ciudad')?.setValue(display_name_parts[0]);
            // Otros campos según la estructura de tu formulario y la respuesta de la API
          } else {
            console.error('La cadena display_name no tiene la estructura esperada.');
          }
        } else {
          console.error('La respuesta de la API no tiene la estructura esperada o display_name es undefined.');
        }
      }, (error) => {
        console.error('Error al obtener la dirección desde el código postal:', error);
      });
    }
  }*/
  }
  asentamientosUnicos: Set<string> = new Set<string>();
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
          console.log('No se encontraron asentamientos para el código postal.');
        }
  
        console.log(response, "response");
        if (response.length > 0) {
          // Mostrar solo el primer resultado
          const primerResultado = response[0];
          this.formularioSucursales.get('estado')?.setValue(primerResultado.estado);
          this.formularioSucursales.get('ciudad')?.setValue(primerResultado.municipio);
        } else {
          console.log('Código postal no encontrado o sin datos de estado.');
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
            console.log(data);
            this.formularioSucursales.setValue({
              nombreGym: data[0].nombreGym,
              codigoPostal: data[0].codigoPostal,
              estado: data[0].estado,
              ciudad: data[0].ciudad,
              colonia: data[0].colonia,
              calle: data[0].calle,
              numExt: data[0].numExt,
              numInt: data[0].numInt,
              telefono: data[0].telefono,
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
            console.log(data);
            this.formularioSucursales.setValue({
              nombreGym: data[0].nombreGym,
              codigoPostal: data[0].codigoPostal,
              estado: data[0].estado,
              ciudad: data[0].ciudad,
              colonia: data[0].colonia,
              calle: data[0].calle,
              numExt: data[0].numExt,
              numInt: data[0].numInt,
              telefono: data[0].telefono,
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
        console.log(respuesta.error);
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


borrarPlan(id: any) {
  console.log(id);
  this.dialog.open(MensajeEliminarComponent, {
    data: `¿Desea eliminar este horario?`,
  })
  .afterClosed()
    .subscribe((confirmado: Boolean) => {
      if (confirmado) {
        this.HorarioService.borrarHorario(id).subscribe((respuesta) => {
          console.log("si entro") 
          window.location.reload();       
        });
      } else {
        
      }
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

  console.log("datosFormulario", datosFormulario)

  this.http.agregarEmpleado(datosFormulario).subscribe(
    (respuesta) => {
      // Manejo de la respuesta del backend
      console.log('Respuesta del servidor:', respuesta);
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

          console.log("datosFormulario", datosFormulario);

          // Retorna un observable del segundo servicio
          return this.http.agregarEmpleado(datosFormulario);
        } else {
          // Si la operación anterior falla, retornar un observable de error
          return throwError('Error en la operación de agregarSucursal');
        }
      })
    ).subscribe(
      (respuestaEmpleado) => {
        // Manejo de la respuesta del backend para agregarEmpleado
        console.log('Respuesta del servidor para agregarEmpleado:', respuestaEmpleado);

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
  if (this.formularioSucursales.valid) {
    this.gimnasioService.agregarSucursal(this.formularioSucursales.value).subscribe(
      (respuestaSucursal) => {
        if (respuestaSucursal && respuestaSucursal.success === 1) {
          console.log(this.formularioSucursales.value);
          console.log('el gimnasio es: ', this.formularioSucursales.value.nombreGym);
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
  }
}

enviarEmpleado(): void {
  if (this.personaForm.valid) {
    const datosFormulario = this.personaForm.value;
    datosFormulario.email = this.email;
    datosFormulario.pass = this.pass;
    console.log('datos del empleado: ', datosFormulario)
    
    this.http.agregarEmpleado(datosFormulario).subscribe(
      (respuestaEmpleado) => {
        if (respuestaEmpleado && respuestaEmpleado.msg === 'Success' ) {
          console.log('Respuesta del servidor para agregarEmpleado:', respuestaEmpleado);
          console.log('segunda de datos del empleado: ', datosFormulario)

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
