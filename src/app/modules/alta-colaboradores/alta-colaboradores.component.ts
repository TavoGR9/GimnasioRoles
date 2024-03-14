import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {ErrorStateMatcher} from '@angular/material/core';
import { ColaboradorService } from './../../service/colaborador.service';
import { AuthService } from '../../service/auth.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { NgxSpinnerService } from "ngx-spinner";

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
  hide = true;
  form: FormGroup;
  sucursales: any;
  message: string = '';
  currentUser: string = '';
  idGym: number = 0;

  constructor (private fb: FormBuilder, 
    public dialog: MatDialog,
    public dialogo: MatDialogRef<AltaColaboradoresComponent>,
    private router: Router,
    private auth: AuthService,
    private http: ColaboradorService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService ){
    this.form = this.fb.group({
      nombre: ['', Validators.compose([ Validators.required, Validators.pattern(/^[^\d]*$/)])],
      apPaterno: ['', Validators.compose([ Validators.required, Validators.pattern(/^[^\d]*$/)])],
      apMaterno: ['', Validators.compose([ Validators.required, Validators.pattern(/^[^\d]*$/)])],
      //rfc: ['', Validators.compose([ Validators.required, Validators.pattern(/^[A-ZÑ0-9]*[A-Z][A-ZÑ0-9]*$/), Validators.minLength(12),  //^[A-Za-zñÑ&]{1,2}([A-Za-zñÑ&]([A-Za-zñÑ&](\d(\d(\d(\d(\d(\d(\w(\w(\w)?)?)?)?)?)?)?)?)?)?)?$/
      //Validators.maxLength(13)])],
      Gimnasio_idGimnasio: ['', Validators.compose([ Validators.required])],
      area: ['', Validators.compose([ Validators.required])],
      turnoLaboral: ['N/A'],
      telefono: ['', Validators.compose([Validators.required, Validators.pattern(/^(0|[1-9][0-9]*)$/), Validators.minLength(10)])],
      salario: [0, Validators.compose([Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      correo: ['', Validators.compose([Validators.required, Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)])],
      pass: ['', Validators.compose([Validators.required, Validators.minLength(8)])]
    })    
  }

  matcher = new MyErrorStateMatcher();
  ngOnInit():void{
    if (this.isAdmin()){
      this.http.comboDatosGym(this.auth.idGym.getValue()).subscribe({
        next: (resultData: any) => {
          this.sucursales = resultData;
          const idGimnasio = resultData[0].idBodega;
          this.form.get('Gimnasio_idGimnasio')?.setValue(idGimnasio);
        }
      });
    }
    if(this.isSupadmin()){
      this.http.comboDatosAllGym().subscribe({
        next: (dataResponse) => {
          this.sucursales = dataResponse;
        }
      });
    }
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

  enviarMensajeWhatsApp() {
    // Número de teléfono al que se enviará el mensaje
    const telefono = this.form.value.telefono;
    const correo = this.form.value.email;
    const password = this.form.value.pass;
    // Mensaje que se enviará
    const mensaje = `Correo: ${correo}, Contraseña: ${password}`;
    // Crear la URL para abrir WhatsApp con el mensaje predefinido
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    // Abrir WhatsApp en una nueva ventana o pestaña
    window.open(url, '_blank');
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

  registrar():any{
    console.log(this.form.value, "formularioooo");
    if (this.form.valid) {
      this.spinner.show();
      this.http.agregarEmpleado(this.form.value).subscribe({
        next: (resultData) => {
          //mensaje de error - generado apartir de la existencia previa del rfc en la bd
          if(resultData.msg == 'RfcExists'){
            this.toastr.error('El rfc ya existe.', 'Error!!!');
          }
          //mensaje de error - generado apartir de la existencia previa del email en la bd
          if(resultData.msg == 'MailExists'){
            this.toastr.error('El correo ya existe.', 'Error!!!');
          }
          //mensaje de insersion correcta
          if(resultData.msg == 'Success'){
            //this.toastr.success('Empleado agregado correctamente.', 'Exíto!!!');
            this.cerrarDialogo();
            this. enviarMensajeWhatsApp();
            this.spinner.hide();
            this.dialog.open(MensajeEmergentesComponent,{
              data: 'Registro agregado correctamente.'
              //width: '500px',
              //height: '500px',
            })
              .afterClosed()
              .subscribe((cerrarDialogo:Boolean) => {
                if(cerrarDialogo){
                  
                } else {
        
                }
              });
            this.form.markAsPristine(); 
            //  marcar un control de formulario como no tocado, indicando que el usuario no ha interactuado con él.
            this.form.markAsUntouched();
          }
        },
        error: (error) => {
          this.toastr.error('Ocurrió un error al intentar agregar el empleado.', 'Error!!!');
        }
      });
    } else {
      this.message = 'Por favor, complete todos los campos requeridos.';
      this.marcarCamposInvalidos(this.form);
    }
  }

  OpenEditar(empleado: any) {
    this.dialog.open(MensajeEmergentesComponent,{
      data: `Empleado agregado correctamente.`
      //width: '500px',
      //height: '500px',
    })
      .afterClosed()
      .subscribe((cerrarDialogo:Boolean) => {
        if(cerrarDialogo){
          
        } else {

        }
      });
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
}

