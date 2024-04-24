import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../service/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  hide = true;
  loginForm: FormGroup;
  constructor(
    private auth: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      pass: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    //this.auth.comprobar();
    if(this.auth.isLoggedInBS() || this.auth.getCurrentUser()){
      this.router.navigate(['/home']);
    }
  }

  getErrorMessage() {
    const usernameControl = this.loginForm.get('username');
    if (usernameControl) {
      if (usernameControl.hasError('required')) {
        return 'Por favor ingresa tu correo';
      }
      if (usernameControl.hasError('email')) {
        return 'Por favor ingresa un correo valido';
      }
    }
    return '';
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.auth.loginBS(this.loginForm.value).subscribe({
        next: (resultData) => {
          if (resultData && resultData.rol !== 'No_acceso') {
            this.auth.loggedIn.next(true);
            this.auth.role.next(resultData.rol);
            this.auth.userId.next(resultData.id);
            this.auth.idGym.next(resultData.idGym);
            this.auth.nombreGym.next(resultData.nombreGym);
            this.auth.email.next(resultData.email);
            this.auth.encryptedMail.next(resultData.encryptedMail);
            this.auth.setCurrentUser({ olympus: resultData.encryptedMail });
            if(resultData.rol= 'supAdmin'){
              this.router.navigate(['/listaSucursales']);

            }else{
              this.router.navigate(['/home']);
            }
          } else {
            this.toastr.error('Por favor, verifica las credenciales proporcionadas....', 'Error', {
              positionClass: 'toast-bottom-left',
            });
          }
        },
        error: (error) => {
          if (error.status === 401) {
            // La contraseña es incorrecta
            this.toastr.error('La contraseña ingresada es incorrecta.', 'Error', {
              positionClass: 'toast-bottom-left',
            });
          } else {
            // Otro tipo de error
            this.toastr.error(error.message, 'Error', {
              positionClass: 'toast-bottom-left',
            });
          }
        },
      });
    }
  }
  

}
