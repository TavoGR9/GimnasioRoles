import { Component, OnInit, Inject } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { MembresiaService } from "../../service/membresia.service";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import { AuthService } from "../../service/auth.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { plan } from "../../models/plan";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { DialogSelectMembershipComponent } from "../dialog-select-membership/dialog-select-membership.component";

@Component({
  selector: "app-membresias-agregar",
  templateUrl: "./plan-agregar.component.html",
  styleUrls: ["./plan-agregar.component.css"],
})
export class planAgregarComponent {
  formulariodePlan: FormGroup;
  message: string = "";
  hide = true;
  gimnasio: any;
  selectedMembresia: any;
  idGym: number = 0;
  plan: any[] = [];
  noServicios: boolean = false;

  constructor(
    public dialogo: MatDialogRef<planAgregarComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string,
    public formulario: FormBuilder,
    private router: Router,
    private membresiaService: MembresiaService,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    public dialog: MatDialog
  ) {
    this.formulariodePlan = this.formulario.group(
      {
        titulo: ["", Validators.required],
        detalles: [""],
        duracion: ["1", Validators.required],
        precio: ["", Validators.required],
        status: [1, Validators.required],
        tipo_membresia: [3],
        Gimnasio_idGimnasio: [this.auth.idGym.getValue(), Validators.required],
        fechaInicio: ["", Validators.required],
        fechaFin: ["", Validators.required],
        membresias: [[], Validators.required],
      },
      { validators: this.dateLessThan("fechaInicio", "fechaFin") }
    );
  }

  ngOnInit(): void {
    this.auth.idGym.subscribe((id) => {
      if (id) {
        this.idGym = id;
      }
      this.membresiaService
        .consultarPlanIdMem(this.idGym)
        .subscribe((respuesta) => {
          this.plan = respuesta;
        });
    });

    this.formulariodePlan.get("membresias")?.valueChanges.subscribe(() => {
      this.setDuration();
    });
  }

  cancelar() {
    this.formulariodePlan.reset();
    this.router.navigateByUrl("admin/misMembresias");
  }

  enviar(): any {
    const membresiasSeleccionadas = this.formulariodePlan.get("membresias")?.value;
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

    if (this.formulariodePlan.valid) {
      this.spinner.show();
      this.membresiaService
        .agregarPlan(this.formulariodePlan.value)
        .subscribe((respuesta) => {
          if (respuesta) {
            this.formulariodePlan.get("membresias")?.value.forEach((m: any) => {
              const datosMembresias = {
                idMem: m.idMem,
                nombreMem: m.titulo,
                duracion: m.duracion,
                idPlan: respuesta.id,
              };
              if(respuesta.success == '1') {
              this.membresiaService.agregarPlanMem(datosMembresias).subscribe(
                (respuestaAgregarPlanMem) => {
                  this.spinner.hide();
                  this.dialog
                    .open(MensajeEmergentesComponent, {
                      data: `Plan agregado exitosamente`,
                    })
                    .afterClosed()
                    .subscribe((cerrarDialogo: Boolean) => {
                      if (cerrarDialogo) {
                        this.dialogo.close(true);
                      }
                    });
                },
                (errorAgregarPlanMem) => {
                  this.spinner.hide();
                  console.error(
                    "Error al agregar membresias:",
                    errorAgregarPlanMem
                  );
                }
              );}else if(respuesta.success == '2'){
                this.spinner.hide();
                this.dialog
                  .open(MensajeEmergentesComponent, {
                    data: `Registro agregado a base de datos local.`,
                  })
                  .afterClosed()
                  .subscribe((cerrarDialogo: Boolean) => {
                    if (cerrarDialogo) {
                      this.dialogo.close(true);
                    }
                  });

              }
            });
          }
        });
    } else {
      if (
        !this.formulariodePlan.value.membresias ||
        this.formulariodePlan.value.membresias.length === 0
      ) {
        this.toastr.error("Agregar o seleccionar primero un servicio", "Error");
      }
      if (
        !this.formulariodePlan.value.precio ||
        !this.formulariodePlan.value.fechaInicio ||
        !this.formulariodePlan.value.fechaFin ||
        !this.formulariodePlan.value.titulo
      ) {
        this.toastr.error("Llenar los campos requeridos", "Error");
      }
      //this.toastr.error('Llenar los campos requeridos', 'Error');
      this.marcarCamposInvalidos(this.formulariodePlan);
    }
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

  cerrarDialogo(): void {
    this.dialogo.close(true);
  }

  isFieldInvalid(field: string, error: string): boolean {
    const control = this.formulariodePlan.get(field);
    return control?.errors?.[error] && (control?.touched ?? false);
  }

  setDuration() {
    /* if (this.formulariodePlan.get("membresias")?.value.length > 0) {
      let duracion = this.formulariodePlan
        .get("membresias")
        ?.value.reduce((acc: number, item: any) => {
          return acc + Number(item.duracion);
        }, 0);
      this.formulariodePlan.get("duracion")?.setValue(duracion);
    } else {
      this.formulariodePlan.get("duracion")?.setValue(0);
    }*/
  }

  requireMinItems(min: number) {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const length = control.value ? control.value.length : 0;
      return length >= min ? null : { minItems: { value: control.value } };
    };
  }

  dateLessThan(from: string, to: string) {
    return (group: FormGroup): { [key: string]: any } => {
      let f = group.controls[from];
      let t = group.controls[to];
      if (f.value > t.value) {
        return {
          dates: "La fecha de inicio debe ser anterior a la fecha de fin",
        };
      }
      return {};
    };
  }

  openDialog(): void {
    this.membresiaService.optionShow.next(1);
    this.membresiaService.optionShow.subscribe((option) => {});
    const dialogRef = this.dialog.open(DialogSelectMembershipComponent, {
      width: "70%",
      height: "90%",
      disableClose: true,
      data: { name: "¿Para quién es esta membresía?" },
    });

    dialogRef.afterClosed().subscribe((nuevoServicio) => {
      if (nuevoServicio.registroInsertado) {
        if (!Array.isArray(this.plan)) {
          this.plan = [];
        }
        this.plan.push(nuevoServicio.registroInsertado);
        this.formulariodePlan.get("servicioseleccionado")?.setValue(this.plan);
      }
    });
  }
}
