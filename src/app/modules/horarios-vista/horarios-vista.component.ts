
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

  constructor(private gimnasioService: GimnasioService, private HorarioService: HorarioService,private route: ActivatedRoute,
    public dialogo: MatDialogRef<HorariosVistaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, private formulario: FormBuilder, private franquiciaService: FranquiciaService, private router: Router) {
    // Obtén el ID del parámetro de la URL
    this.idGimnasio = this.route.snapshot.params['id'];
    this.idGimnasio = data.idGimnasio; // Accede a idGimnasio desde los datos
    console.log("id",this.idGimnasio);

    //Creacion del formulario:
    this.formularioSucursales = this.formulario.group({
      nombreGym: ["", Validators.required],
      codigoPostal: ["", Validators.required],
      estado: ["", Validators.required],
      ciudad: ["", Validators.required],
      colonia: ["", Validators.required],
      calle: ["", Validators.required],
      numExt: ["", Validators.required],
      numInt: [""],
      telefono:  ['', Validators.compose([Validators.required, Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      tipo: ["", Validators.required],
      Franquicia_idFranquicia: ["", Validators.required],
      estatus: [1, Validators.required],
      idGimnasio: [this.idGimnasio]
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

  /*-----------GENERAL METHODS-----------*/
  
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
        this.message = "Horario no disponible";
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
      // Llama al servicio para agregar la sucursal
      this.gimnasioService.agregarSucursal(this.formularioSucursales.value).subscribe((respuesta) => {
        if(respuesta){
          if(respuesta.success === 1){
            this.dialog.open(MensajeEmergentesComponent, {
              data: `Sucursal agregada exitosamente`,
            }).afterClosed().subscribe((cerrarDialogo: Boolean) => {
              if (cerrarDialogo) {
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
              idGimnasio: this.idGimnasio
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
