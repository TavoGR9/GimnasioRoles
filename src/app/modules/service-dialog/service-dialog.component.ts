import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { PlanService } from "src/app/service/plan.service";
import { AuthService } from "src/app/service/auth.service";
import { MatDialogRef, MatDialog } from "@angular/material/dialog";
import { RouterLink, Router } from "@angular/router";
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
  service: Service | null = null;
  seleccionado: number = 0;
  message: string = "";

  constructor(
    private router: Router,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private auth: AuthService,
    private planService: PlanService,
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

  ngOnInit(): void {
    this.auth.idGym.subscribe((id) => {
      if (id) {
        this.idGym = id;
      }
    });

    this.planService.seleccionado.subscribe((id) => {
      if (id) {
        this.seleccionado = id;
        if (id == 1) {
        } else if (id == 2) {
          this.planService.idService.subscribe((id) => {
            if (id) {
              this.idService = id;
              this.planService.getService(this.idService).subscribe((res) => {
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
      this.planService
        .newService(this.serviceForm.value)
        .subscribe((respuesta) => {
          if (respuesta) {
            if (respuesta) {
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
                //this.planService.confirmButton.next(true);
                this.dialogRef.close(this.serviceForm.value);
              });
              

            }
          } else {
          }
        });
    }
  }

  actualizarForm() {
    this.spinner.show();
    this.planService.updateService(this.serviceForm.value).subscribe((res) => {
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
            this.planService.confirmButton.next(true);
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
