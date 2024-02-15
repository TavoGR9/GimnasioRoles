import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {ErrorStateMatcher} from '@angular/material/core';
import { ColaboradorService } from './../../service/colaborador.service';
import { AuthService } from '../../service/auth.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';

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

  constructor (private fb: FormBuilder, 
    public dialog: MatDialog,
    public dialogo: MatDialogRef<AltaColaboradoresComponent>,
    private router: Router,
    private auth: AuthService,
    private http: ColaboradorService,
    private toastr: ToastrService ){
    this.form = this.fb.group({
      nombre: ['', Validators.compose([ Validators.required, Validators.pattern(/^[^\d]*$/)])],
      apPaterno: ['', Validators.compose([ Validators.required, Validators.pattern(/^[^\d]*$/)])],
      apMaterno: ['', Validators.compose([ Validators.required, Validators.pattern(/^[^\d]*$/)])],
      //rfc: ['', Validators.compose([ Validators.required, Validators.pattern(/^[A-ZÑ0-9]*[A-Z][A-ZÑ0-9]*$/), Validators.minLength(12),  //^[A-Za-zñÑ&]{1,2}([A-Za-zñÑ&]([A-Za-zñÑ&](\d(\d(\d(\d(\d(\d(\w(\w(\w)?)?)?)?)?)?)?)?)?)?)?$/
      //Validators.maxLength(13)])],
      Gimnasio_idGimnasio: ['', Validators.compose([ Validators.required])],
      area: ['', Validators.compose([ Validators.required])],
      turnoLaboral: ['', Validators.compose([ Validators.required])],
      telefono: ['', Validators.compose([Validators.required, Validators.pattern(/^(0|[1-9][0-9]*)$/), Validators.minLength(10)])],
      salario: ['', Validators.compose([Validators.required, Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      email: ['', Validators.compose([Validators.required, Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)])],
      pass: ['', Validators.compose([Validators.required, Validators.minLength(8)])]
    })    
  }

  matcher = new MyErrorStateMatcher();
  ngOnInit():void{
    if (this.isAdmin()){
      this.http.comboDatosGym(this.auth.idGym.getValue()).subscribe({
        next: (resultData) => {
          console.log(resultData);
          this.sucursales = resultData;
        }
      });
    }
    if(this.isSupadmin()){
      this.http.comboDatosAllGym().subscribe({
        next: (dataResponse) => {
          console.log(dataResponse);
          this.sucursales = dataResponse;
        }
      });
    }
  }

  enviarMensajeWhatsApp() {
    // Número de teléfono al que se enviará el mensaje
    const telefono = this.form.value.telefono;
    const correo = this.form.value.email;
    const password = this.form.value.pass;

    console.log("Numero de telefono: ", telefono);
    // Mensaje que se enviará
    const mensaje = `Correo: ${correo}, Contraseña: ${password}`;
    console.log("Mensaje: ", mensaje);
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
    console.log(this.form.value);
    if (this.form.valid) {

      this.http.agregarEmpleado(this.form.value).subscribe({
        next: (resultData) => {
          console.log(resultData.msg);
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
            this.cerrarDialogo()

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
          console.error(error);
        }
      });
    } else {
      this.toastr.error('Completar todos los campos antes de guardar.', 'Error!!!');
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
}
