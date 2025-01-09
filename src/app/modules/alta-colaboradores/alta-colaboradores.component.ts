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
      //clave: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.pattern(/^[^\d]*$/)]],
      puesto: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)]],
      pass: ['', [Validators.required, Validators.minLength(8)]],
      celular: ['', [Validators.required, Validators.pattern(/^(0|[1-9][0-9]*)$/), Validators.minLength(10)]],
      idGym: ''
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
      if (this.form.get('idGym') !== null) {
        this.form.get('idGym')!.setValue(this.idGym);
      }
    });
  }

  registrar(): void {
    if (this.form.valid) {
      this.spinner.show();
      const empleadoData = this.form.value;

      this.http.agregarPersonal(empleadoData.puesto).subscribe({
        next: (respuestaPersonal) => {
          this.llamarAgregarEmpleado(empleadoData);
        },
        error: (error) => {
          this.spinner.hide();
          this.toastr.error('Error al agregar el puesto.', 'Error!!!');
        }
      });
    } else {
      this.message = 'Por favor, complete todos los campos requeridos.';
      this.marcarCamposInvalidos(this.form);
    }
  }

  private llamarAgregarEmpleado(empleadoData: any): void {
    this.http.agregarEmpleado(empleadoData).subscribe({
      next: (resultData) => {
        this.spinner.hide();
        if (resultData.message === 'MailExists') {
          this.toastr.error('El correo electrónico ya existe.', 'Error!!!');
        } else if (resultData.ok === true) {
          this.dialogo.close(true); // Cierra el modal
          this.mostrarMensajeExito(); // Muestra el mensaje de éxito
        } else {
          console.log('Respuesta inesperada:', resultData);
          this.toastr.error('Error el correo electronico ya existe.', 'Error!!!');
        }
      },
      error: (error) => {
        this.spinner.hide();
        this.toastr.error('Ocurrió un error al intentar agregar el empleado.', 'Error!!!');
      }
    });
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
    });  }
}