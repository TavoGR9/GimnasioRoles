import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { notificaciones } from './../../service/email-noti.service';
import { MatDialog } from '@angular/material/dialog';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
//import { MensajeCargandoComponent } from '../mensaje-cargando/mensaje-cargando.component';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css']
})
export class NotificacionesComponent implements OnInit {
  hide = true;
  form!: FormGroup;
  enviandoCorreo = false; // Variable para controlar el estado de envío
  archivo = null;
  idGym: number = 0;
  currentUser: string = '';

  constructor(
    private fb: FormBuilder,
    private noti: notificaciones,
    public dialog: MatDialog,
    private auth: AuthService,
    private router: Router
  ) {}


  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      texto: ['', Validators.required],
      opcion: [''],
      archivo: ['']
    });

    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }
    
    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
    });  
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

  cargarImagen(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement?.files?.length) {
      const archivo: File = inputElement.files[0];
    }
  }

  onSubmit(): void {
    if (this.form.get('opcion')?.value === 'Clientes') {
    if (this.form.valid && !this.enviandoCorreo) {
      const { nombre, texto, archivo } = this.form.value;
      this.enviandoCorreo = true; // Iniciar el estado de envío
      // Mostrar el indicador de carga
      /*const dialogRef = this.dialog.open(MensajeCargandoComponent, {
        width: '400px',
        height: '300px',
        data: `Enviando notificación...`
      });*/

      this.noti.enviarMail(nombre, texto, archivo).subscribe(
        (respuesta) => {
          this.dialog.open(MensajeEmergentesComponent, {
            data: `Notificacion enviada exitosamente`
          }).afterClosed().subscribe((cerrarDialogo: boolean) => {
            if (cerrarDialogo) {
              this.form.reset();
            }
          });
          this.enviandoCorreo = false; // Restablecer el estado de envío
        },
        (error) => {
          console.error('Error al enviar el correo:', error);
          this.enviandoCorreo = false; // Restablecer el estado de envío
        }
      );
    }
    }else{
      if (this.form.get('opcion')?.value === 'Trabajadores') {
  
      if (this.form.valid && !this.enviandoCorreo) {
        const { nombre, texto, archivo,opcion } = this.form.value;
        this.enviandoCorreo = true; // Iniciar el estado de envío
        // Mostrar el indicador de carga
        /*const dialogRef = this.dialog.open(MensajeCargandoComponent, {
          width: '400px',
          height: '300px',
          data: `Enviando notificación...`
        });*/
  
        this.noti.enviarMailTrabajadores(nombre, texto, archivo).subscribe(
          (respuesta) => {
            //dialogRef.close();
             
            this.dialog.open(MensajeEmergentesComponent, {
              data: `Notificacion enviada exitosamente`
            }).afterClosed().subscribe((cerrarDialogo: boolean) => {
              if (cerrarDialogo) {
                this.router.navigateByUrl('/admin/home');
              }
            });
            this.enviandoCorreo = false; // Restablecer el estado de envío
          },
          (error) => {
            // Cerrar el diálogo en caso de error
            //dialogRef.close();
  
            console.error('Error al enviar el correo:', error);
            this.enviandoCorreo = false; // Restablecer el estado de envío
          }
        );
      }
  
    }
    }
  }
  }
