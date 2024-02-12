
import { GimnasioService } from 'src/app/service/gimnasio.service';
import { HorarioService } from 'src/app/service/horario.service';
import { Router } from "@angular/router";
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HorarioEditarComponent } from '../horario-editar/horario-editar.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MensajeEliminarComponent } from '../mensaje-eliminar/mensaje-eliminar.component';
import { FranquiciaService } from 'src/app/service/franquicia.service';
import { FormGroup, FormBuilder, Validators, FormGroupDirective, NgForm, FormArray, FormControl } from '@angular/forms';
import { ErrorStateMatcher} from '@angular/material/core';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { PostalCodeService } from 'src/app/service/cp.service';

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
  postalCodeControl = new FormControl('');
  addressControl = new FormControl('');

  constructor(private gimnasioService: GimnasioService, private HorarioService: HorarioService,private route: ActivatedRoute,
    public dialogo: MatDialogRef<HorariosVistaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, private formulario: FormBuilder, 
    private franquiciaService: FranquiciaService, private router: Router, private postalCodeService: PostalCodeService) {
    // Obtén el ID del parámetro de la URL
    this.idGimnasio = this.route.snapshot.params['id'];
    this.idGimnasio = data.idGimnasio; // Accede a idGimnasio desde los datos
    console.log("id",this.idGimnasio);

    //Creacion del formulario:
    this.formularioSucursales = this.formulario.group({
      nombreGym: ["", Validators.required],
      codigoPostal: ['', Validators.compose([Validators.pattern(/^(0|[1-9][0-9]*)$/), Validators.maxLength(5)])],
      estado: ['', Validators.compose([Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/)])],
      ciudad: ['', Validators.compose([Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/)])],
      colonia: ['', Validators.compose([Validators.pattern(/^[A-Za-zñÑáéíóú ]*[A-Za-z][A-Za-zñÑáéíóú ]*$/)])],
      calle: ["", Validators.required],
      numExt: ['', Validators.compose([Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      numInt: ['', Validators.compose([Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      telefono: ['', Validators.compose([Validators.required, Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      tipo: ["", Validators.required],
      Franquicia_idFranquicia: [1],
      estatus: [1, Validators.required],
      idGimnasio: [this.idGimnasio],
      casilleros: [, Validators.required],
      estacionamiento: [, Validators.required],
      regaderas: [, Validators.required],
      bicicletero: [, Validators.required]
    });

    this.postalCodeControl.valueChanges.subscribe((postalCode) => {
      // Check if postalCode is not null before calling the function
      if (postalCode !== null) {
        this.handlePostalCodeChange(postalCode);
      }
    });
    
  }

  matcher = new MyErrorStateMatcher();

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
          this.editarSucursal();
        }
      }
    });
  }


 
cerrarDialogo(): void {
  this.dialogo.close();
}


  /*-----------HORARIOS METHODS---------- */
  consultarHorario() {
    this.HorarioService.consultarHorario(this.idGimnasio).subscribe(
      (data) => {
        this.datosHorario = data;  // Asigna los datos a la propiedad
        console.log('Datos del horario:', this.datosHorario);
      },
      (error) => {
        this.message = "Horario no disponible. El administrador aún no ha registrado el horario";
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
      console.log("Formulario ok,", this.formularioSucursales.value);
      // Llama al servicio para agregar la sucursal
      this.gimnasioService.agregarSucursal(this.formularioSucursales.value).subscribe((respuesta) => {
        if(respuesta){
          console.log(respuesta);
          if(respuesta.success === 1){
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

  private handlePostalCodeChange(postalCode: string): void {
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
  }

  getAddressFromPostalCode() {
    if (this.formularioSucursales) {
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
            this.formularioSucursales.get('colonia')?.setValue(display_name_parts[0]);
            this.formularioSucursales.get('ciudad')?.setValue(display_name_parts[1]);
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
  }
  }
  
  cancelar(){
    this.dialogo.close();
  }

  /*-----------EDIT SUCURSAL METHODS-----------*/

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

  confirmarEdicion() {
    console.log(this.formularioSucursales.value);
    this.gimnasioService.actualizarSucursal(this.formularioSucursales.value).subscribe((respuesta) => {
      if(respuesta){
        if(respuesta.success === 1){
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

}
