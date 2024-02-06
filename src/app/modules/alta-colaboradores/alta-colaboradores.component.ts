import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {ErrorStateMatcher} from '@angular/material/core';
import { ColaboradorService } from 'src/app/service/colaborador.service';
import { AuthService } from 'src/app/service/auth.service';

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
    private router: Router,
    private auth: AuthService,
    private http: ColaboradorService,
    private toastr: ToastrService ){
    this.form = this.fb.group({
      nombre: ['', Validators.compose([ Validators.required, Validators.pattern(/^[^\d]*$/)])],
      apPaterno: ['', Validators.compose([ Validators.required, Validators.pattern(/^[^\d]*$/)])],
      apMaterno: ['', Validators.compose([ Validators.required, Validators.pattern(/^[^\d]*$/)])],
      rfc: ['', Validators.compose([ Validators.required, Validators.pattern(/^[A-Za-zñÑ&]{1,2}([A-Za-zñÑ&]([A-Za-zñÑ&](\d(\d(\d(\d(\d(\d(\w(\w(\w)?)?)?)?)?)?)?)?)?)?)?$/)])],
      Gimnasio_idGimnasio: ['', Validators.compose([ Validators.required])],
      area: ['', Validators.compose([ Validators.required])],
      turnoLaboral: ['', Validators.compose([ Validators.required])],
      salario: ['', Validators.compose([Validators.required, Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      email: ['', Validators.compose([Validators.required, Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)])],
      pass: ['', Validators.compose([Validators.required, Validators.minLength(8)])]
    })    
  }

  matcher = new MyErrorStateMatcher();
  ngOnInit():void{
    this.http.comboDatosGym().subscribe({
      next: (resultData) => {
        console.log(resultData);
        this.sucursales = resultData;
      }
    })
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }
  
  isSupadmin(): boolean {
    return this.auth.isSupadmin();
  }

  registrar():any{
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
          this.toastr.success('Empleado agregado correctamente.', 'Exíto!!!');
          this.form.markAsPristine(); 
          //  marcar un control de formulario como no tocado, indicando que el usuario no ha interactuado con él.
          this.form.markAsUntouched();
        }
              
      },
      error: (error) => {
        console.error(error);
      }
    })
  }
}
