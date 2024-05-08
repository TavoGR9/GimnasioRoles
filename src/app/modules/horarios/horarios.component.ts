import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from "@angular/material/dialog";
import { FormGroup, FormBuilder, Validators, FormArray} from "@angular/forms";
import { AbstractControl } from '@angular/forms';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { HorarioService } from '../../service/horario.service';
import { NgxSpinnerService } from "ngx-spinner";
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
  message: string = "";
  datosHorario: any[] = [];
  horarioExistente: boolean = false; 
  constructor(
    public dialogo: MatDialogRef<HorariosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public formularioHorario: FormBuilder,
    private HorarioService: HorarioService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
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
    horarios.forEach(horario => {
      if (!horario.horaEntrada) {
        horario.horaEntrada = '00:00:00';
      }
  
      if (!horario.horaSalida) {
        horario.horaSalida = '00:00:00';
      }
    });
    // Verifica si el formulario es válido
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
          } else {
            // Puedes agregar lógica adicional si es necesario
          }
        });
      });
    } else {
      // El formulario no es válido, muestra un mensaje de error
      this.message = "Por favor, complete todos los campos requeridos.";
    }
  }

  /*verHorario(idGimnasio: string): void {
    const dialogRef = this.dialog.open(HorariosVistaComponent, {
      width: '60%',
      height: '90%',
      data: { idGimnasio: idGimnasio },
    });
  }*/
    
  cancelar() {
    this.dialogo.close();
  }
}
