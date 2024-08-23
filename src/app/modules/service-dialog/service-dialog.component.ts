import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { serviciosService } from "../../service/servicios.service";
import { AuthService } from "../../service/auth.service";
import { MatDialogRef, MatDialog } from "@angular/material/dialog";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import { NgxSpinnerService } from "ngx-spinner";



@Component({
  selector: "app-service-dialog",
  templateUrl: "./service-dialog.component.html",
  styleUrls: ["./service-dialog.component.css"],
})
export class ServiceDialogComponent implements OnInit {
  serviceForm!: FormGroup;
  idGym: number = 0;
  idService: number = 0;
  service: any;
  seleccionado: number = 0;
  message: string = "";

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private auth: AuthService,
    private ServiciosService: serviciosService,
    private spinner: NgxSpinnerService,
    private dialogRef: MatDialogRef<ServiceDialogComponent>,
  ) {
    this.serviceForm = this.fb.group({
      id_servicios_individuales: [0],
      nombre_servicio: ["",[Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u),],],
      detalles: ["",[Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u),],],
      precio_unitario: ["", Validators.required],
      fk_idGimnasio: [0],
      created_by: [this.auth.idUser.getValue()],
    });
  }

  ngOnInit(): void {
    this.auth.idGym.subscribe((id) => {
      if (id) {
        this.idGym = id;
      }
    });
    this.ServiciosService.seleccionado.subscribe((id) => {
      if (id) {
        this.seleccionado = id;
        if (id == 2) {
          this.ServiciosService.idService.subscribe((id) => {
            if (id) {
              this.idService = id;
              this.ServiciosService.getService(this.idService).subscribe((res) => {
                if (res) {
                  this.service = res;
                  if (this.service) {
                    this.serviceForm.setValue({
                      id_servicios_individuales:this.service.id_servicios_individuales,
                      nombre_servicio: this.service.nombre_servicio,
                      detalles: this.service.detalles,
                      precio_unitario: this.service.precio_unitario,
                      fk_idGimnasio: this.idGym,
                      created_by: this.service.created_by,
                    });
                  }
                }
              });
            }
          });
        }
      }
    });
  }

  validaFormService() {
    if (this.serviceForm.invalid) {
      this.message = "Por favor, complete todos los campos requeridos.";
      this.marcarCamposInvalidos(this.serviceForm);
    } else {
      this.spinner.show();
      this.serviceForm.patchValue({
        id_servicios_individuales: 0,
        fk_idGimnasio: this.idGym,
      });
      this.ServiciosService.newService(this.serviceForm.value).subscribe((respuesta) => {
        if (respuesta) {
          if (respuesta.success == '1') {
            this.spinner.hide();
            const dialogRefConfirm = this.dialog.open(MensajeEmergentesComponent,{ data: `¡Servicio agregado con éxito!`});
            dialogRefConfirm.afterClosed().subscribe((result) => {
              this.dialogRef.close(respuesta);
            });
          }
        } 
      });
    }
  }

  actualizarForm() {
    this.spinner.show();
    this.ServiciosService.updateService(this.serviceForm.value).subscribe((res) => {
      if (res) {
        this.spinner.hide();
        const dialogRefConfirm = this.dialog.open(MensajeEmergentesComponent,{data: `¡Servicio actualizado con éxito!`});
        dialogRefConfirm.afterClosed().subscribe((result) => {
          this.ServiciosService.confirmButton.next(true);
          this.dialogRef.close();
        });
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
        }
      }
    });
  }

  cancelar() {
    this.dialogRef.close();
  }
}

