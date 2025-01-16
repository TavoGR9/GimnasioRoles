import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ErrorStateMatcher } from '@angular/material/core';
import { ColaboradorService } from './../../service/colaborador.service';
import { AuthService } from '../../service/auth.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { NgxSpinnerService } from 'ngx-spinner';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, formulario: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = formulario && formulario.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-alta-colaboradores',
  templateUrl: './alta-colaboradores.component.html',
  styleUrls: ['./alta-colaboradores.component.css']
})
export class AltaColaboradoresComponent {
  modalVisible: boolean = true;
  mensajeExito: string = '';
  hide = true;
  form: FormGroup;
  sucursales: any;
  message: string = '';
  currentUser: string = '';
  idGym!: number;
  matcher = new MyErrorStateMatcher();

  filteredPersonal: string[] = [];
  personal: string[] = [];

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    public dialogo: MatDialogRef<AltaColaboradoresComponent>,
    private router: Router,
    private auth: AuthService,
    private http: ColaboradorService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      clave: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.pattern(/^[^\d]*$/)]],
      puesto: ['', Validators.compose([ Validators.required])],
      email: ['', [Validators.required, Validators.pattern(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)]],
      pass: ['', [Validators.required, Validators.minLength(8)]],
      celular: ['', [Validators.required, Validators.pattern(/^(0|[1-9][0-9]*)$/), Validators.minLength(10)]],
      idGym: [this.idGym],
      estatus:[1]
    });
  }

  ngOnInit(): void {
    if (this.isAdmin()) {
      // Lógica para administradores
    }
    if (this.isSupadmin()) {
      this.http.comboDatosAllGym().subscribe({
        next: (dataResponse) => {
          this.sucursales = dataResponse;
        }
      });
    }
    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
      //console.log("DT: ",this.idGym);
      if (this.form.get('idGym') !== null) {
        this.form.get('idGym')!.setValue(this.idGym);
      }
    });
  }

  registrar(): void {
    if (this.form.valid) {
      console.log("DATOS: ",this.form.value);

      const formularioDa = this.form.value;

      if(
        !formularioDa.nombre?.trim() ||
        !formularioDa.puesto?.trim() ||
        !formularioDa.pass?.trim()
      ){
        this.toastr.error("Todos los campos son obligatorios, un campo esta vacio", "Error");
        return;
      }

      this.spinner.show();

      this.http.agregarPersonal(formularioDa).subscribe((respuesta) => {
        console.log(respuesta);

        this.spinner.hide();

        if(respuesta.ok === true){
          this.dialogo.close(true); // Cierra el modal
          this.mostrarMensajeExito(); // Muestra el mensaje de éxito
        } else{
          this.toastr.error('El correo electrónico ya existe.', 'Error!!!');
        }
      })
    } else {
      this.message = 'Por favor, complete todos los campos requeridos.';
      this.marcarCamposInvalidos(this.form);
    }
  }

  mostrarMensajeExito(): void {
    this.dialog.open(MensajeEmergentesComponent, {
      data: 'Empleado agregado correctamente.'
    });
  }

  cerrarDialogo(): void {
    this.dialogo.close(true);
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  isSupadmin(): boolean {
    return this.auth.isSupadmin();
  }

  marcarCamposInvalidos(formGroup: FormGroup): void {
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

  verPersonal(){
    this.http.getPersonal().subscribe(respuesta =>{
    });
  };

  buscarPersonal() {
    const personalIngresado = this.form.get("puesto")?.value;
    this.http.getPersonal().subscribe({
      next: (respuesta) => {
        //console.log("DATO: ", respuesta);
        const puesto = new Set(
          respuesta.map((persona: any) => persona.usu)
        );
        this.personal = Array.from(puesto) as string[];
        this.filteredPersonal = this.personal.filter(
          (persona) =>
            !personalIngresado ||
            persona.toLowerCase().includes(personalIngresado.toLowerCase())
        );
      },
      error: (error) => {
        console.error("Error al obtener el personal:", error);
      },
    });
  }


}

