import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/service/auth.service';

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
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }
  ngOnInit(): void {
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
    console.log(this.loginForm.value);
    if(this.loginForm.valid){
      this.auth.loginBS(this.loginForm.value).subscribe({
        next: (resultData) => {
          if (resultData.rolUser !== 'No_acceso') {
            this.auth.loggedIn.next(true);
            this.auth.role.next(resultData.rolUser);
            this.auth.userId.next(resultData.id);
            this.auth.idGym.next(resultData.idGym);
            this.auth.nombreGym.next(resultData.nombreGym);
            this.auth.email.next(resultData.email);
            this.auth.encryptedMail.next(resultData.encryptedMail);
            this.auth.setCurrentUser({ olympus: resultData.encryptedMail});
            this.router.navigate(['/home']);
            console.log('Tu rol es: ' + resultData.rolUser);
            
          } else {
            this.toastr.error('No cuentas con permisos...', 'Error', {
              positionClass: 'toast-bottom-left',
            });
          }
        }, error: (error) => {
            this.toastr.error(error, 'Error', {
            positionClass: 'toast-bottom-left',
          });
        }
      })
    }
  }

}
