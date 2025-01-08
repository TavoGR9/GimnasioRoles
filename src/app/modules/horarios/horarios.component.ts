import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from "@angular/material/dialog";
import { FormGroup, FormBuilder, Validators, FormArray} from "@angular/forms";
import { AbstractControl } from '@angular/forms';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { HorarioService } from '../../service/horario.service';
import { NgxSpinnerService } from "ngx-spinner";

import { ToastrService } from "ngx-toastr";

class Horario {
  constructor(
    public diaSemana: string,
    public horaEntrada: string,
    public horaSalida: string,
    public Gimnasio_idGimnasio: string
  ) {}
}

@Component({
  selector: 'app-horarios',
  templateUrl: './horarios.component.html',
  styleUrls: ['./horarios.component.css']
})
export class HorariosComponent implements OnInit {
  idGimnasio: any;
  formularioHorarios: FormGroup;
  datosHorario: any[] = [];
  horarioExistente: boolean = false;
  message : string = "";
  constructor(
    public dialogo: MatDialogRef<HorariosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public formularioHorario: FormBuilder,
    private HorarioService: HorarioService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,

    private toastr: ToastrService


  ) {
    this.idGimnasio = data.idGimnasio;
    this.formularioHorarios = this.formularioHorario.group({
      horarios: this.formularioHorario.array([]),
    });
    ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'].forEach(diaSemana => this.agregarHorario(diaSemana));
  }

  ngOnInit(): void {
  }

  agregarHorario(diaSemana: string): void {
    const horarioFormGroup = this.formularioHorario.group({
      diaSemana: [diaSemana],
      horaEntrada: [""],
      horaSalida: [""],
      Gimnasio_idGimnasio: [this.idGimnasio, Validators.required]
    });

    const horariosArray = this.formularioHorarios.get('horarios') as FormArray;
    if (horariosArray) {
      horariosArray.push(horarioFormGroup);
    }


    this.HorarioService.consultarHorario(this.idGimnasio).subscribe(
      (data) => {
        this.datosHorario = data;
        this.horarioExistente = data && data.length > 0;
      },
      (error) => {
        this.message = "Horario no disponible";
        console.error('Error al consultar el horario:', error);
      }
    );
  }

  getHorariosControls(): AbstractControl[] {
    const horariosArray = this.formularioHorarios.get('horarios') as FormArray;
    return horariosArray.controls;
  }


  enviarHorario(): void {
    const horarios: Horario[] = this.formularioHorarios.value.horarios;

    // Filtrar horarios que estan vacios
    const horariosConDatos = horarios.filter(horario =>
      horario.horaEntrada !== '00:00:00' || horario.horaSalida !== '00:00:00'
    );

    // Validar y completar campos vacíos
    horarios.forEach(horario => {
      if (!horario.horaEntrada) {
        horario.horaEntrada = '00:00:00';
      }
      if (!horario.horaSalida) {
        horario.horaSalida = '00:00:00';
      }
    });


    // validar que el horario no este completamente vacio
    const horarioValido = horarios.some(horario =>
      horario.horaEntrada !== '00:00:00' && horario.horaSalida !== '00:00:00'
    );

    if (!horarioValido) {
      this.toastr.error("El horario no puede estar completamente vacio ---- La hora de entrada o salida no puede estar vacia.");
      return;
    }

    // Validar que la hora de salida sea mayor que la hora de entrada
    const horasCorrectas = horariosConDatos.every(horario => {
      const entrada = horario.horaEntrada.split(':').map(Number);
      const salida = horario.horaSalida.split(':').map(Number);
      const minutosEntrada = entrada[0] * 60 + entrada[1]; // Convertir a minutos
      const minutosSalida = salida[0] * 60 + salida[1];   // Convertir a minutos

      return minutosSalida > minutosEntrada; // Validar que la salida sea mayor
    });

  if (!horasCorrectas) {
    this.toastr.error("La hora de salida debe ser mayor que la hora de entrada.");
    return;
  }

    if (Array.isArray(horarios)) {
      console.log("Datos de horario: ", this.formularioHorarios.value);

      if (this.formularioHorarios.valid) {
        this.spinner.show();
        this.HorarioService.agregarHorario(this.formularioHorarios.value).subscribe((respuesta) => {
          this.spinner.hide();
          this.dialog.open(MensajeEmergentesComponent, {
            data: `Horario agregado exitosamente`,
          })
          .afterClosed()
          .subscribe((cerrarDialogo: Boolean) => {
            if (cerrarDialogo) {
              this.dialogo.close();
            }
          });
        });
      } else {
        //console.log("Por favor, complete todos los campos requeridos.");
      }
    } else {
     // console.log("LOS DATOS NO SON UN ARREGLO VALIDO");
    }
  }

  cancelar() {
    this.dialogo.close();
  }
}
