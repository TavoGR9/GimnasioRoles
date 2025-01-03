import { Component, OnInit, Inject } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from "@angular/forms";
//import { MembresiaService } from "../../service/membresia.service";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import { AuthService } from "../../service/auth.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { DialogSelectMembershipComponent } from "../dialog-select-membership/dialog-select-membership.component";
import { PromocionService } from "../../service/promocion.service";

@Component({
  selector: "app-membresias-agregar",
  templateUrl: "./plan-agregar.component.html",
  styleUrls: ["./plan-agregar.component.css"],
})
export class planAgregarComponent {
  formulariodePlan: FormGroup;
  private enviando = false;
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
    private fb: FormBuilder,
    private router: Router,
   // private membresiaService: MembresiaService,
    private promocionService: PromocionService,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    public dialog: MatDialog
  ) {
    this.formulariodePlan = this.fb.group(
      {
        idChoProm: ["", Validators.required],
        estatus: ["Activo"],
        nombrePromocion: ["", Validators.required],
        FechaInicio: ["", Validators.required],
        FechaFin: ["", Validators.required],
        PrecioPaquete: [660.50],
        existencias: ["", Validators.required],
        idGym: [this.auth.idGym.getValue(), Validators.required],

        //detalles: [""],
        //duracion: ["1", Validators.required],
        //tipo_membresia: [3],
       // Gimnasio_idGimnasio: [this.auth.idGym.getValue(), Validators.required],

        //membresias: ["", Validators.required],

        //created_by: [this.auth.idUser.getValue(), Validators.required],
        idProbob: [5],
        cantidad: [100],
        precio: [123.90],
        preciopv: ["", Validators.required],
        plataforma: ["Web"]

      },
      //{ validators: this.dateLessThan("FechaInicio", "FechaFin") }
    );
  }


  ngOnInit(): void {
    this.auth.idGym.subscribe((id) => {
      if (id) {
        this.idGym = id;
      }
/*
      this.membresiaService
        .consultarPlanIdMem(this.idGym)
        .subscribe((respuesta) => {
          this.plan = respuesta;
        });
        */

    });


/*
    this.formulariodePlan.get("membresias")?.valueChanges.subscribe(() => {
      this.setDuration();
    });
*/

  }


  cancelar() {
    this.formulariodePlan.reset();
    this.router.navigateByUrl("admin/misMembresias");
  }


  enviar(): any {
    console.log("hola");
    if (this.enviando) return; // Evitar envíos duplicados
    this.enviando = true;


    if (this.formulariodePlan.valid) {
      
      const formularioData = this.formulariodePlan.value;
      // Validar que no existan campos vacíos críticos
      if (
        !formularioData.idChoProm ||
        !formularioData.nombrePromocion?.trim() ||
        !formularioData.preciopv ||
        !formularioData.FechaInicio ||
        !formularioData.FechaFin
      ) {
        this.toastr.error("Todos los campos son obligatorios, un campo esta vacio", "Error");
        this.enviando = false;
        return;
      }

      this.spinner.show();//metodo muestra de indicador de carga

      this.promocionService.agregarPlan(formularioData).subscribe(
        (respuesta) => {

          //this.enviando = false; // Restablecer bandera
          this.spinner.hide();

          if (respuesta.success === "1") {
            // Registro exitoso en la base de datos
            const dialogRef = this.dialog.open(MensajeEmergentesComponent, {
              data: `Plan agregado exitosamente`,
            });

            dialogRef.afterClosed().subscribe((cerrarDialogo: boolean) => {
              if (cerrarDialogo) {
                this.dialogo.close(true); // Cierra el modal del formulario
              }
            });
          } else if (respuesta.success === "2") {
            // Registro en la base de datos local
            const dialogRef = this.dialog.open(MensajeEmergentesComponent, {
              data: `Registro agregado a base de datos local`,
            });

            dialogRef.afterClosed().subscribe((cerrarDialogo: boolean) => {
              if (cerrarDialogo) {
                this.dialogo.close(true);
              }
            });
          } else {
            // Manejar otras respuestas del servidor
            this.toastr.error("No se pudo agregar el plan.", "Error");
          }
        },
        (error) => {
          this.enviando = false; // Restablecer bandera en caso de error
          this.spinner.hide();//metodo oculta de indicador de carga
          this.toastr.error("Error al agregar el plan. Inténtelo de nuevo.", "Error");
          console.error("Error en agregarPlan:", error);
        }
      );
    } else {
      // Manejo de errores en caso de formulario inválido
      this.enviando = false;
      this.marcarCamposInvalidos(this.formulariodePlan);
      this.toastr.error("Por favor, llena correctamente todos los campos obligatorios.", "Error");
    }
  }



/*
  private validarErroresFormulario(): void {
    if (!this.formulariodePlan.value.PrecioPaquete) {
      this.toastr.error("El campo 'Precio del Paquete' es obligatorio", "Error");
    }
    if (!this.formulariodePlan.value.FechaInicio || !this.formulariodePlan.value.FechaFin) {
      this.toastr.error("Ambas fechas (inicio y fin) son obligatorias", "Error");
    }
    if (!this.formulariodePlan.value.nombrePromocion) {
      this.toastr.error("El campo 'Nombre de la Promoción' es obligatorio", "Error");
    }
    this.marcarCamposInvalidos(this.formulariodePlan);
  }
*/

//MANEJAR ERRORES DEL LADO DEL COMPONENTE
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


  //MANEJAR ERRORES EN EL HTML
  isFieldInvalid(field: string, error: string): boolean {
    const control = this.formulariodePlan.get(field);
    return control?.errors?.[error] && (control?.touched ?? false);
  }

/*
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
    }
  }
*/
/*
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
    */
/*
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
    */
}
