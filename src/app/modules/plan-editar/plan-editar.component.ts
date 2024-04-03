import { Component, OnInit, Inject } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  FormArray,
} from "@angular/forms";
import { MembresiaService } from "./../../service/membresia.service";
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from "../../service/auth.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";

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
    private activeRoute: ActivatedRoute,
    private membresiaService: MembresiaService,
    private router: Router,
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
      },
      { validators: this.dateLessThan("fechaInicio", "fechaFin") }
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

              console.log(serviciosCoincidentes, "serviciosCoincidentes");

              serviciosCoincidentes.forEach((servicio) => {});

              this.formulariodePlan.setValue({
                titulo: this.serviceToUpdate[0].titulo,
                detalles: this.serviceToUpdate[0].detalles,
                duracion: this.serviceToUpdate[0].duracion,
                precio: this.serviceToUpdate[0].precio,
                status: this.serviceToUpdate[0].status,
                tipo_membresia: this.serviceToUpdate[0].tipo_membresia,
                Gimnasio_idGimnasio:
                  this.serviceToUpdate[0].Gimnasio_idGimnasio,
                fechaInicio: this.serviceToUpdate[0].fechaInicio,
                fechaFin: this.serviceToUpdate[0].fechaFin,
                membresias: serviciosCoincidentes,
              });

            }
          });
      });
  }

  actualizar() {  
    if (this.formulariodePlan.valid) {
      this.spinner.show();
      this.membresiaService.actualizarPlan(this.idMem, this.formulariodePlan.value).subscribe((respuesta) => {
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
                  // Hacer algo si es necesario
                }
              });
          },
          (error) => {
            console.error("Error al actualizar membresía:", error);
            this.spinner.hide();
            // Puedes mostrar un mensaje al usuario o manejar el error de alguna manera
            // Por ejemplo, puedes usar Toastr para mostrar un mensaje de error.
           
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
}
