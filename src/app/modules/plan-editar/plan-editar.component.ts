import { Component, OnInit, Inject } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import {
  FormGroup,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { MembresiaService } from "./../../service/membresia.service";
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from "../../service/auth.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import 'moment-timezone';
@Component({
  selector: "app-membresias-editar",
  templateUrl: "./plan-editar.component.html",
  styleUrls: ["./plan-editar.component.css"],
})
export class planEditarComponent {
  formulariodePlan: FormGroup;
  gimnasio: any;
  elID: any;
  plan: any[] = [];
  selectedMembresia: any;
  message: string = "";
  dataToUpdate: any = [];
  serviceToUpdate: any = [];
  memberships: any = [];
  selectedMembresias: any[] = [];
  servicios: any[] = [];
  idMem: any;

  constructor(
    public dialogo: MatDialogRef<planEditarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public formulario: FormBuilder,
    private membresiaService: MembresiaService,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog
  ) {
    this.idMem = data.idMem;
    this.formulariodePlan = this.formulario.group(
      {
        titulo: ["", Validators.required],
        detalles: ["", Validators.required],
        duracion: ["1", Validators.required],
        precio: ["", Validators.required],
        status: [1, Validators.required],
        tipo_membresia: [3],
        Gimnasio_idGimnasio: [this.auth.idGym.getValue(), Validators.required],
        fechaInicio: ["", Validators.required],
        fechaFin: ["", Validators.required],
        membresias: [[], Validators.required],
      }
    );
  }

  ngOnInit(): void {
    this.membresiaService.getDataToUpdate().subscribe((data) => {
      if (data) {
        this.dataToUpdate = data;
      }
    });

    this.membresiaService
      .consultarPlanIdMem(this.auth.idGym.getValue())
      .subscribe((respuesta) => {
        this.servicios = respuesta;
        this.membresiaService
          .consultarPlan(this.dataToUpdate.id)
          .subscribe((respuesta) => {
            if (respuesta) {
              this.serviceToUpdate = respuesta;

              const serviciosPlan = this.serviceToUpdate[0].servicios.map(
                (servicio: any) => servicio.nombreMem
              );

              const serviciosCoincidentes = this.servicios.filter((servicio) =>
                serviciosPlan.includes(servicio.titulo)
              );
              
              serviciosCoincidentes.forEach((servicio) => {});
              this.formulariodePlan.patchValue({
             
                titulo: this.serviceToUpdate[0].titulo,
                detalles: this.serviceToUpdate[0].detalles,
                duracion: this.serviceToUpdate[0].duracion,
                precio: this.serviceToUpdate[0].precio,
                status: this.serviceToUpdate[0].status,
                tipo_membresia: this.serviceToUpdate[0].tipo_membresia,
                Gimnasio_idGimnasio:this.serviceToUpdate[0].Gimnasio_idGimnasio,
                //fechaInicio: this.serviceToUpdate[0].fechaInicio.toString(),
               // fechaFin: this.serviceToUpdate[0].fechaFin.toString(),
                membresias: serviciosCoincidentes,
              });
              let fechaDate = new Date(this.serviceToUpdate[0].fechaInicio + ' 0:00:00');
              this.formulariodePlan.controls['fechaInicio'].setValue(fechaDate);
              let fechaDate2 = new Date(this.serviceToUpdate[0].fechaFin + ' 0:00:00');
              this.formulariodePlan.controls['fechaFin'].setValue(fechaDate2);

            }
          });
      });
  }

  actualizar() {
    if (this.formulariodePlan.valid) {
      const membresiasSeleccionadas =
      this.formulariodePlan.get("membresias")?.value;

      // Inicializar la duración más alta con un valor inicial bajo, por ejemplo, 0
      let duracionMasAlta = 0;

      // Iterar sobre todas las membresías seleccionadas para encontrar la duración más alta
      membresiasSeleccionadas.forEach((m: any) => {
        // Obtener la duración de la membresía actual
        const duracionActual = parseInt(m.duracion);

        // Si la duración de la membresía actual es mayor que la duración más alta encontrada hasta ahora, actualizar la duración más alta
        if (duracionActual > duracionMasAlta) {
          duracionMasAlta = duracionActual;
        }
      });

      this.formulariodePlan.get("duracion")?.setValue(duracionMasAlta);

      this.spinner.show();
      const formatFecha = (fecha: string, timezone: string = 'America/Mexico_City') => {
        return moment(fecha).tz(timezone).format('YYYY-MM-DD');
      };
      const fechaOriginalInicio = this.formulariodePlan.value.fechaInicio;
      const fechaOriginalFin = this.formulariodePlan.value.fechaFin;
      
      const fechaFormateadaInicio = formatFecha(fechaOriginalInicio);
      const fechaFormateadaFin = formatFecha(fechaOriginalFin);

      this.formulariodePlan.patchValue({
      fechaInicio: fechaFormateadaInicio,
        fechaFin: fechaFormateadaFin
      });

      this.membresiaService
        .actualizarPlan(this.idMem, this.formulariodePlan.value)
        .subscribe(
          (respuesta) => {
            this.spinner.hide();
            this.dialog
              .open(MensajeEmergentesComponent, {
                data: `Membresía actualizada exitosamente`,
              })
              .afterClosed()
              .subscribe((cerrarDialogo: Boolean) => {
                if (cerrarDialogo) {
                  this.dialogo.close(true);
                } else {
                }
              });
          },
          (error) => {
            console.error("Error al actualizar membresía:", error);
            this.spinner.hide();
          }
        );
    }
  }

  cerrarDialogo() {
    this.dialogo.close(true);
  }

  isFieldInvalid(field: string, error: string): boolean {
    const control = this.formulariodePlan.get(field);
    return control?.errors?.[error] && (control?.touched ?? false);
  }

}
