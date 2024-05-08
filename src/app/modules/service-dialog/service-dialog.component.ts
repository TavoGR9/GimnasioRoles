import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { serviciosService } from "../../service/servicios.service";
import { AuthService } from "../../service/auth.service";
import { MatDialogRef, MatDialog } from "@angular/material/dialog";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import { NgxSpinnerService } from "ngx-spinner";
import { DialogStateService } from "../../service/dialogState.service";
@Component({
  selector: "app-service-dialog",
  templateUrl: "./service-dialog.component.html",
  styleUrls: ["./service-dialog.component.css"],
})
export class ServiceDialogComponent implements OnInit {
  serviceForm!: FormGroup;
  idGym: number = 0;
  idService: number = 0;
  service: Service | null = null;
  seleccionado: number = 0;
  message: string = "";
  isMaximized = false;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private auth: AuthService,
    private ServiciosService: serviciosService,
    private dialogStateService: DialogStateService,
    private spinner: NgxSpinnerService,
    private dialogRef: MatDialogRef<ServiceDialogComponent>,
    private dialogRefConfirm: MatDialogRef<MensajeEmergentesComponent>,
  ) {
    this.serviceForm = this.fb.group({
      id_servicios_individuales: [0],
      nombre_servicio: ["",[Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u),],],
      detalles: ["",[Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u),],],
      precio_unitario: ["",[Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)],],
      fk_idGimnasio: [0],
    });
  }

  toggleMaximize() {
    this.isMaximized = !this.isMaximized;
    this.dialogStateService.updateMaximizeState(this.isMaximized);
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
        if (id == 1) {
        } else if (id == 2) {
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
                    });
                  }
                } else {
                }
              });
            }
          });
        }
      }
    });
  }

  isFieldInvalidService(field: string, error: string): boolean {
    const control = this.serviceForm.get(field);
    return control?.errors?.[error] && (control?.touched ?? false);
  }

  validaFormService() {
    if (this.serviceForm.invalid) {
      Object.values(this.serviceForm.controls).forEach((control) => {
        control.markAsTouched();
      });
      this.message = "Por favor, complete todos los campos requeridos.";
    } else {
      this.spinner.show();
      this.serviceForm.setValue({
        id_servicios_individuales: 0,
        nombre_servicio: this.serviceForm.value.nombre_servicio,
        detalles: this.serviceForm.value.detalles,
        precio_unitario: this.serviceForm.value.precio_unitario,
        fk_idGimnasio: this.idGym,
      });
      this.ServiciosService
        .newService(this.serviceForm.value)
        .subscribe((respuesta) => {
          if (respuesta) {
            if (respuesta.success == '1') {
              this.spinner.hide();
              const dialogRefConfirm = this.dialog.open(
                MensajeEmergentesComponent,
                {
                  width: "25%",
                  height: "30%",
                  data: `¡Servicio agregado con éxito!`,
                }
              );
              dialogRefConfirm.afterClosed().subscribe((result) => {
                this.dialogRef.close(respuesta);
              });
            }else if(respuesta.success == '2'){
              this.spinner.hide();
              const dialogRefConfirm = this.dialog.open(
                MensajeEmergentesComponent,
                {
                  width: "25%",
                  height: "30%",
                  data: `Registro agregado a base de datos local.`,
                } 
              );
              dialogRefConfirm.afterClosed().subscribe((result) => {
                this.dialogRef.close(respuesta);
              });
            }
          } else {
          }
        });
    }
  }


  actualizarForm() {
    this.spinner.show();
    this.ServiciosService.updateService(this.serviceForm.value).subscribe((res) => {
      if (res) {
        if (res) {
          this.spinner.hide();
          const dialogRefConfirm = this.dialog.open(
            MensajeEmergentesComponent,
            {
              width: "25%",
              height: "30%",
              data: `¡Servicio actualizado con éxito!`,
            }
          );

          dialogRefConfirm.afterClosed().subscribe((result) => {
            this.ServiciosService.confirmButton.next(true);
            this.dialogRef.close();
          });
        }
      }
    });
  }

  cancelar() {
    this.dialogRef.close();
  }
}
interface Service {
  id_servicios_individuales: number;
  nombre_servicio: string;
  detalles: string;
  precio_unitario: number;
  fk_idGimnasio: number;
}
