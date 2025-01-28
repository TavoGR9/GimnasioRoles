import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AuthService } from "../../service/auth.service";
import { RolService } from '../../service/rol.service';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { catchError, of } from 'rxjs';
import { EventCommunicationServiceService } from '../../service/event-communication-service.service';

@Component({
  selector: 'app-crear-rol',
  templateUrl: './crear-rol.component.html',
  styleUrls: ['./crear-rol.component.css']
})
export class CrearRolComponent implements OnInit {
  rolForm!: FormGroup;
  idGym: number = 0;
  idPersonal: number = 0;
  seleccionado: number = 0;
  message: string = "";

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private auth: AuthService,
    private rolService: RolService,
    private dialogRef: MatDialogRef<CrearRolComponent>,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private eventCommunicationService: EventCommunicationServiceService, // Servicio inyectado
  ) {
    this.rolForm = this.fb.group({
      idPersonal: [0],
      usu: ["",[Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u),],],
    });
  }

  ngOnInit(): void {
    this.getIdGym();

    // this.categoriaService.obtenerMarcasSer().subscribe((res) => {
    //   if (res) {
    //     this.marcasDisponibles = res;
    //   } else {
    //     console.error("No se pudieron obtener las marcas.");
    //   }
    // });
  }

  getIdGym() {
    this.auth.idGym.subscribe((respuesta) => {
      this.idGym = respuesta;
    });
  }

  validaFormRol() {
    if (this.rolForm.invalid) {
      this.message = "Por favor, complete todos los campos requeridos.";
      this.marcarCamposInvalidos(this.rolForm);
    } else {
      this.spinner.show();

      const newRol = {
        ...this.rolForm.value,
        idGimnasio: this.idGym  // Incluye el idGym en el objeto del nuevo rol
      };

      this.rolService.insertarRol(newRol).subscribe(
        (respuesta: any) => {
          this.spinner.hide();

          if (respuesta && respuesta.ok) {
            // Éxito
            // console.log('Rol agregado correctamente');
            const dialogRefConfirm = this.dialog.open(MensajeEmergentesComponent, {
              data: `Rol agregado con éxito!`
            });
            dialogRefConfirm.afterClosed().subscribe(() => {
              this.dialogRef.close(respuesta);
            });
            this.closeDialog();
          } else {
            // Manejo de errores desde el servidor
            const mensajeError = respuesta.message || 'Hubo un error al agregar el rol.';
            this.toastr.error(mensajeError);
            console.error("Error al agregar rol:", respuesta);
          }
        },
        (error) => {
          // Manejo de errores en la conexión
          this.spinner.hide();
          this.toastr.error('No se pudo conectar con el servidor.');
          console.error("Error de conexión:", error);
        }
      );
    }
  }


  marcarCamposInvalidos(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((campo) => {
      const control = formGroup.get(campo);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  cancelar() {
    this.dialogRef.close();
  }

  closeDialog(): void {
    const modalId = 'Crear Rol Component'; // Identificador único del modal
    this.eventCommunicationService.triggerEvent(modalId); // Emitir evento
    this.dialogRef.close(true); // Cerrar modal
  }


}
