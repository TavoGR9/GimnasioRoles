import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { GimnasioService } from 'src/app/service/gimnasio.service';
import { MatDialog } from '@angular/material/dialog';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { HorarioService } from 'src/app/service/horario.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';

class Horario {
  constructor(
    public diaSemana: string,
    public horaEntrada: string,
    public horaSalida: string,
    public Gimnasio_idGimnasio: string
  ) {}
}
@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css'] 
})
export class ConfiguracionComponent  implements OnInit{
  diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
  formularioHorarios: FormGroup;
  idGimnasio: any;
  formularioSucursales: FormGroup;
  gimnasio: any;
  franquicia: any;
  elID: any;
  message: string = '';

  constructor(
    private formulario: FormBuilder,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private gimnasioService: GimnasioService,
    public formularioHorario: FormBuilder,
    public dialog: MatDialog,
    private HorarioService: HorarioService,
    private auth: AuthService,
  ) {
   {
      this.idGimnasio = this.auth.idGym.getValue(); // Accede a idGimnasio desde los datos
      this.formularioHorarios = this.formularioHorario.group({
        horarios: this.formularioHorario.array([]),
      });
      // Consulta los horarios según el ID y estructura los datos para el formulario
      this.HorarioService.consultarHorario(this.idGimnasio).subscribe(
        respuesta => {
          this.diasSemana.forEach(dia => {
            this.agregarHorarioExistente(dia, respuesta);
          });
        }
      );    
    }

    this.elID = this.activeRoute.snapshot.paramMap.get('id');
    console.log(this.elID);
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
      casilleros: ["", Validators.required],
      estacionamiento: ["", Validators.required],
      regaderas: ["", Validators.required],
      bicicletero: ["", Validators.required],
    });
  }


  agregarHorarioExistente(diaSemana: string, respuesta: any): void {
  const horarioExistente = respuesta.find((horario: any) => horario.diaSemana === diaSemana);
    // Si existe un horario para este día, usa esos valores, de lo contrario, usa valores por defecto
    const horaEntrada = horarioExistente ? horarioExistente.horaEntrada : '';
    const horaSalida = horarioExistente ? horarioExistente.horaSalida : '';
    const horarioFormGroup = this.formularioHorario.group({
      diaSemana: [diaSemana, Validators.required],
      horaEntrada: [horaEntrada, Validators.required],
      horaSalida: [horaSalida, Validators.required],
    });
    const horariosArray = this.formularioHorarios.get('horarios') as FormArray;
    if (horariosArray) {
      horariosArray.push(horarioFormGroup);
    }
  }
  
  ngOnInit(): void {
    this.gimnasioService.consultarPlan(this.auth.idGym.getValue()).subscribe(
      (respuesta) => {
        this.formularioSucursales.setValue({
          nombreGym: respuesta[0]['nombreGym'],
          estado: respuesta[0]['estado'],
          ciudad: respuesta[0]['ciudad'],
          colonia: respuesta[0]['colonia'],
          calle: respuesta[0]['calle'],
          codigoPostal: respuesta[0]['codigoPostal'],
          numExt: respuesta[0]['numExt'],
          numInt: respuesta[0]['numInt'],
          telefono: respuesta[0]['telefono'],
          tipo: respuesta[0]['tipo'],
          Franquicia_idFranquicia: respuesta[0]['Franquicia_idFranquicia'],
          casilleros: respuesta[0]['casilleros'],
          estacionamiento: respuesta[0]['estacionamiento'],
          regaderas: respuesta[0]['regaderas'],
          bicicletero: respuesta[0]['bicicletero']
        }); 
      }
    );
  }

  actualizar() {
    const actualizarPlan = this.gimnasioService.actualizarPlan(this.auth.idGym.getValue(), this.formularioSucursales.value);
    const actualizarHorarios = this.HorarioService.actualizarHorario(this.auth.idGym.getValue(), this.formularioHorarios.value);
    forkJoin([actualizarPlan, actualizarHorarios]).subscribe({
      next: ([planResponse, horariosResponse]) => {
        // Acciones posteriores si ambas actualizaciones son exitosas
        this.dialog.open(MensajeEmergentesComponent, {
          data: 'Gimnasio actualizado exitosamente',
        }).afterClosed().subscribe((cerrarDialogo: Boolean) => {
          if (cerrarDialogo) {
            this.router.navigateByUrl("/admin/verConfiguracion");
          }
        });
      },
      error: (error) => {
      }
    });
  }

  getHorariosControls(): AbstractControl[]{
    const horariosArray = this.formularioHorarios.get('horarios') as FormArray;
    return horariosArray.controls;
  }

}
