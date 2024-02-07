import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { agregarContra } from 'src/app/service/agregarContra.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPasswordComponent implements OnInit {
  hide = true;
  resetForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private passwordReset: agregarContra,
    private route: ActivatedRoute // Agregar ActivatedRoute al constructor
  ) {
    this.resetForm = this.fb.group({
      nuevaPassword: [
        '',
        Validators.compose([Validators.required, Validators.minLength(8)]),
      ],
      confirmaPassword: [
        '',
        Validators.compose([Validators.required, Validators.minLength(8)]),
      ],
    });
  }

  ngOnInit(): void {
    // Verificar los parámetros 'id' y 'token' en la URL al inicializar el componente
   const idParam = this.route.snapshot.queryParamMap.get('id');
    const tokenParam = this.route.snapshot.queryParamMap.get('token');

    if (!idParam || !tokenParam) {
      console.log(idParam, "idParam");
      // Redirigir al componente 'app-not-found' si falta alguno de los parámetros
      this.router.navigate(['/app-not-found']);
      return;
    } else {
      // Enviar los parámetros al servicio para la interacción con la API
      this.passwordReset.validaToken(idParam, tokenParam).subscribe({
        next: (respuesta) => {
          console.log('llego respuest del api');
          console.log(respuesta);
          if (respuesta.success) {
            this.toastr.success(respuesta.message, 'Exito', {
              positionClass: 'toast-bottom-left',
            });
          } else {
            this.toastr.error(respuesta.message, 'Error aqui si es', {
              positionClass: 'toast-bottom-left',
            });

            // Redirigir al componente 'app-not-found' en caso de error
            this.router.navigate(['/app-not-found']);
          }
        },
        error: (paramError) => {
          this.toastr.error(paramError.error.message, 'Error aquiiii', {
            positionClass: 'toast-bottom-left',
          });

          // Redirigir al componente 'app-not-found' en caso de error
          this.router.navigate(['/app-not-found']);
        },
      });
    }
  }

  /**
   * Si esta correcto el link se procede a verificar que coincidan las contraseñas para
   * poder actualizar
   */
  onSubmit(): void {
    console.log('Hiciste clic en enviar');
    console.log(this.resetForm.value);

    if (this.resetForm.valid) {
      const nuevaPassword = this.resetForm.get('nuevaPassword')?.value;
      const confirmaPassword = this.resetForm.get('confirmaPassword')?.value;

      if (nuevaPassword && confirmaPassword) {
        if (confirmaPassword !== nuevaPassword) {
          this.toastr.error('Las contraseñas no coinciden', 'Error', {
            positionClass: 'toast-bottom-left',
          });
          //si no coinciden limpiar formulario
          this.resetForm.reset();
        } else {
          //cuando las contraseñas coinciden actualizar el password (obtener id y token de la url)
          const idParam = this.route.snapshot.queryParamMap.get('id');
          const tokenParam = this.route.snapshot.queryParamMap.get('token');
          //si los valores del url tienen algun valor  se suscribe al servicio
       
          if (idParam && tokenParam) {
           
            console.log("this.resetForm.value", this.resetForm.value);
            this.passwordReset
              .actualizaPassword(idParam, tokenParam, this.resetForm.value)
              .subscribe({
                next: (respuesta) => {
               
                  console.log(respuesta);
                  if (respuesta.success) {
                    this.toastr.success(respuesta.message, 'Exito', {
                      positionClass: 'toast-bottom-left',
                    });

                    // Redirigir al componente 'login'al finalizar la actualizacion
                    window.location.href = 'https://olympus.arvispace.com/index';
                  } else {
                    this.toastr.error(respuesta.message, 'Error aqui', {
                      positionClass: 'toast-bottom-left',
                    });
                  }
                },
                error: (paramError) => {
                  console.error('Error en la solicitud:', paramError);
                  this.toastr.error(paramError.error.message, 'Error aquí', {
                    positionClass: 'toast-bottom-left',
                  });
                },
                
              });
          }
        }
      }
    }
  }
}
