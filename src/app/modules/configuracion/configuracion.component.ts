import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { GimnasioService } from '../../service/gimnasio.service';
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
  elID: any;
  gimnasio: any;
  franquicia: any;
  idGym: number = 0;
  message: string = '';
  currentUser: string = '';
  formularioHorarios: FormGroup;
  formularioSucursales: FormGroup;
  diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
  idGimnasio: any;
  
  constructor(
    private router: Router,
    public dialog: MatDialog,
    private auth: AuthService,
    private formulario: FormBuilder,
    private activeRoute: ActivatedRoute,
    public formularioHorario: FormBuilder,
    private HorarioService: HorarioService,
    private gimnasioService: GimnasioService, 
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
    this.formularioSucursales = this.formulario.group({
      nombreBodega: ["", Validators.required],
     codigoPostal: ["", Validators.required],
      estado: ["", Validators.required],
      ciudad: ["", Validators.required],
      colonia: ["", Validators.required],
      calle: ["", Validators.required],
      numExt: ["", Validators.required],
      numInt: [""],
      numeroTelefonico:  ['', Validators.compose([Validators.required, Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      tipo: ["", Validators.required],
      Franquicia_idFranquicia: ["", Validators.required],
      casilleros: ["", Validators.required],
      estacionamiento: ["", Validators.required],
      regaderas: ["", Validators.required],
      bicicletero: ["", Validators.required],
      estatus: [1],
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
    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }
  
    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
      this.listaTabla();
    }); 
  }

  listaTabla(){
    this.gimnasioService.consultarPlan(this.idGym).subscribe(
      (respuesta) => {
        this.formularioSucursales.setValue({
          nombreBodega: respuesta[0]['nombreBodega'],
          estado: respuesta[0]['estado'],
          ciudad: respuesta[0]['ciudad'],
          colonia: respuesta[0]['colonia'],
          calle: respuesta[0]['calle'],
          codigoPostal: respuesta[0]['codigoPostal'],
          numExt: respuesta[0]['numExt'],
          numInt: respuesta[0]['numInt'],
          numeroTelefonico: respuesta[0]['numeroTelefonico'],
          tipo: respuesta[0]['tipo'],
          Franquicia_idFranquicia: respuesta[0]['Franquicia_idFranquicia'],
          casilleros: respuesta[0]['casilleros'],
          estacionamiento: respuesta[0]['estacionamiento'],
          regaderas: respuesta[0]['regaderas'],
          bicicletero: respuesta[0]['bicicletero'],
          estatus: respuesta[0]['estatus'],
        }); 
      }
    );
  }

  getSSdata(data: any){
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
          this.auth.role.next(resultData.rolUser);
          this.auth.userId.next(resultData.id);
          this.auth.idGym.next(resultData.idGym);
          this.auth.nombreGym.next(resultData.nombreGym);
          this.auth.email.next(resultData.email);
          this.auth.encryptedMail.next(resultData.encryptedMail);
      }, error: (error) => { console.log(error); }
    });
  }

  actualizar() {
    const idGym = this.auth.idGym.getValue();
    const planData = this.formularioSucursales.value;
    const horariosData = this.formularioHorarios.value;
  
    // Realizar las solicitudes de actualización
    const actualizarPlan = this.gimnasioService.actualizarPlan(idGym, planData);
    const actualizarHorarios = this.HorarioService.actualizarHorario(idGym, horariosData);  
    // Realizar las solicitudes concurrentemente con forkJoin
    forkJoin([actualizarPlan, actualizarHorarios]).subscribe({
      next: ([planResponse, horariosResponse]) => {
        this.mostrarMensajeYRedireccionar();
      },
      error: (error) => {
        this.mostrarMensajeDeError();
        console.error('Error de API:', error);
      }
    });
  }
  
  private mostrarMensajeYRedireccionar() {
    this.dialog.open(MensajeEmergentesComponent, {
      data: 'Gimnasio actualizado exitosamente',
    }).afterClosed().subscribe((cerrarDialogo: Boolean) => {
      if (cerrarDialogo) {
        this.router.navigateByUrl("verConfiguracion");
      }
    });
  }
  
  private mostrarMensajeDeError() {
    this.dialog.open(MensajeEmergentesComponent, {
      data: 'Error durante la actualización del gimnasio',
    });
  }
  
  getHorariosControls(): AbstractControl[]{
    const horariosArray = this.formularioHorarios.get('horarios') as FormArray;
    return horariosArray.controls;
  }

}
