import { Component, OnInit, Inject } from "@angular/core";
import { AuthService } from "../../service/auth.service";
import { GimnasioService } from "../../service/gimnasio.service";
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from "@angular/forms";
import { serviciosService } from "../../service/servicios.service";
import { MatTableDataSource } from "@angular/material/table";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ErrorStateMatcher } from "@angular/material/core";
import { NgxSpinnerService } from "ngx-spinner";
import { ServiceDialogComponent } from "../service-dialog/service-dialog.component";
import { MembresiaService } from "../../service/membresia.service";

@Component({
  selector: "app-dialog-select-membership",
  templateUrl: "./dialog-select-membership.component.html",
  styleUrls: ["./dialog-select-membership.component.css"],
})
export class DialogSelectMembershipComponent implements OnInit {
  noServicios: boolean = false; 
  displayedColumns: string[] = ["No", "nombre", "precio"];
  dataSource: any;
  tipo_membresia: number = 0;
  optionToShow: number = 0;
  selection: number = 0;
  section: number = 0;
  formTittle: string = "";
  idGym: any;
  idMem: any;
  servicios: any[] = [];
  formPlan: FormGroup;
  formService: FormGroup;
  servicioSeleccionado: any[] = [];
  serviciosSeleccionadosFilters: any[] = [];
  prices: any[] = [];
  totalPlanPersolnalized: number = 0;
  sucursalServices: any[] = [];
  dataToUpdate: any = {};
  plan: any[] = [];
  selectedService: number = 4;
  seleccionado: number = 0;

  constructor(
    public dialogo: MatDialogRef<DialogSelectMembershipComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string,
    private spinner: NgxSpinnerService,
    private AuthService: AuthService,
    private GimnasioService: GimnasioService,
    private formulario: FormBuilder,
    private toastr: ToastrService,
    private ServiciosService: serviciosService,
    public dialog: MatDialog,
    public membresiaService: MembresiaService,
    public dialogRefConfirm: MatDialogRef<MensajeEmergentesComponent>
  ) {
    this.formPlan = this.formulario.group({
      idMem: [0, [Validators.required, Validators.pattern(/^\d+$/)]],
      titulo: ["", Validators.required],
      duracion: ["", [Validators.required, Validators.pattern(/^\d+$/)]],
      precio: ["",[Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)],],
      detalles: ["",[Validators.required]], 
      servicioseleccionado: [[], Validators.required],
      status: ["1"],
      tipo_membresia: ["1"],
      Gimnasio_idGimnasio: [this.AuthService.idGym.value, Validators.required],
      created_by: [this.AuthService.idUser.getValue()],
    });

    this.formService = this.formulario.group({
      nombre: ["", [Validators.required, Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u),]],
      precio: ["", [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      gimnasio: [this.AuthService.idGym.value],
    });
  }

  ngOnInit(): void {
    this.getIdGym();
    this.getServices();
    this.tipo_membresia = 1;
    this.membresiaService.optionShow.subscribe((respuesta) => {
      if (respuesta) {
        this.optionToShow = respuesta;
        if (this.optionToShow == 1) {
          this.getServices();
        } else if (this.optionToShow == 2) {
          this.membresiaService.getDataToUpdate().subscribe((respuesta) => {
            if (respuesta) {
              this.dataToUpdate = respuesta;
              if (this.dataToUpdate.id != undefined) {
                this.membresiaService
                  .consultarPlanGym(this.dataToUpdate.id)
                  .subscribe((respuesta) => {
                    if (respuesta) {
                      if (this.dataToUpdate.id == respuesta[0].idMem) {
                        this.sucursalServices = respuesta;
                        this.dataSource = this.sucursalServices[0].servicios
                      } else {
                      }
                    }
                  });
              }
            } else {
            }
          });
        } else if (this.optionToShow == 3) {
          this.membresiaService.getDataToUpdate().subscribe((respuesta) => {
            if (respuesta) {
              this.dataToUpdate = respuesta;
            }
          });
          this.GimnasioService.getServicesForId(this.idGym).subscribe(
            (respuesta) => {
              this.servicios = respuesta;
              this.membresiaService
                .consultarPlanGym(this.dataToUpdate.id)
                .subscribe((respuesta) => {
                  if (respuesta) {
                    this.plan = respuesta;
                    const serviciosPlan = this.plan[0].servicios.map(
                      (servicio: any) => servicio.nombre_servicio
                    );
                    const serviciosCoincidentes = this.servicios.filter(
                      (servicio) =>
                        serviciosPlan.includes(servicio.nombre_servicio)
                    );
                    let servicioSeleccionado = this.servicios.find(
                      (servicio) =>
                        servicio.nombre_servicio ===
                        this.plan[0].servicios[0].nombre_servicio
                    );
                    this.formPlan.setValue({
                      idMem: 0,
                      titulo: this.plan[0].titulo,
                      duracion: this.plan[0].duracion,
                      precio: this.plan[0].precio,
                      detalles: this.plan[0].detalles,
                      servicioseleccionado: servicioSeleccionado, // Aquí estableces "Gym" como valor por defecto en un array
                      status: this.plan[0].status,
                      tipo_membresia: 1,
                      Gimnasio_idGimnasio: this.plan[0].Gimnasio_idGimnasio,
                      created_by: this.plan[0].created_by
                    });
                  }
                });
            }
          );
        } else if (this.optionToShow == 4) {
        }
      }
    });

    this.membresiaService.section.subscribe((respuesta) => {
      if (respuesta) {
        this.section = respuesta;
      }
    });
  }

  cerrarDialogo(): void {
    this.dialogo.close(true);
  }

  selectPlan() {
    this.tipo_membresia = 1;
    this.selection = 1;
    this.formTittle = "Plan";
    this.formPlan.patchValue({ tipo_membresia: this.tipo_membresia });
    if (this.idGym != null) {
      this.getServices();
    }
  }

  abrirDialogo() {
    this.seleccionado = 1;
    this.ServiciosService.seleccionado.next(this.seleccionado);
    const dialogRef = this.dialog.open(ServiceDialogComponent, {
      width: "70%",
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((nuevoServicio) => {
      if (nuevoServicio.registroInsertado) {
        if (!Array.isArray(this.servicios)) {
          this.servicios = [];
        }
        this.servicios.push(nuevoServicio.registroInsertado);
      }
    });  
  }
  
  getIdGym() {
    this.AuthService.idGym.subscribe((respuesta) => {
      this.idGym = respuesta;
    });
  }

  validarFormulario() {
    if (this.formPlan.invalid) {
      if (!this.formPlan.value.servicioseleccionado || this.formPlan.value.servicioseleccionado.length === 0) {
        this.toastr.error('Agregar o seleccionar primero un servicio', 'Error');
      }
      if (!this.formPlan.value.precio || !this.formPlan.value.duracion) {
        this.toastr.error('Llenar los campos requeridos', 'Error');
      }
      Object.values(this.formPlan.controls).forEach((control) => {
        control.markAsTouched();
      });
    } else {
      this.spinner.show();
      this.formPlan.patchValue({
        Gimnasio_idGimnasio: this.idGym,
      });
      if (this.optionToShow == 1 || this.optionToShow == 2) {
        let formValue = this.formPlan.value;
        if (
          formValue.servicioseleccionado &&
          typeof formValue.servicioseleccionado === "object" &&
          !Array.isArray(formValue.servicioseleccionado)
        ) {
          formValue.servicioseleccionado = [formValue.servicioseleccionado];
        }
        this.membresiaService.agregarMem(formValue).subscribe((respuesta) => {
          if (respuesta) {
            if (respuesta.success == 1) {
              this.spinner.hide();
              const dialogRef = this.dialog.open(MensajeEmergentesComponent, {
                data: "La membresía se ha insertado correctamente",
              });
              dialogRef.afterClosed().subscribe((result) => {
                this.ServiciosService.confirmButton.next(true);
                this.dialogo.close(respuesta);
              });
            }
          }
        }); 
      }
      if (this.optionToShow == 3) {
        this.formPlan.setValue({
          idMem: this.dataToUpdate.id,
          titulo: this.formPlan.value.titulo,
          duracion: this.formPlan.value.duracion,
          precio: this.formPlan.value.precio,
          detalles: this.formPlan.value.detalles,
          servicioseleccionado: this.formPlan.value.servicioseleccionado,
          status: this.formPlan.value.status,
          tipo_membresia: this.dataToUpdate.tipo_membresia,
          Gimnasio_idGimnasio: this.idGym,
          created_by: this.AuthService.idUser.getValue()
        });
        if (this.formPlan.valid) {
          this.membresiaService
            .updateMembresia(this.formPlan.value)
            .subscribe((respuesta) => {
              if (respuesta) {
                this.spinner.hide();
                if (respuesta.success == 1) {
                  this.spinner.hide();
                  const dialogRef = this.dialog.open(
                    MensajeEmergentesComponent,
                    {
                      width: "300px",
                      height: "200px",
                      data: "La membresía se ha actualizado correctamente",
                    }
                  );
                  dialogRef.afterClosed().subscribe((result) => {
                    this.dialogo.close(true);
                  });
                }
              }
            });
        }
      }
    }
  }

  validaFormService() {
    if (this.formService.invalid) {
      Object.values(this.formService.controls).forEach((control) => {
        control.markAsTouched();
      });
    } else {
      this.formService.setValue({
        nombre: this.formService.value.nombre,
        precio: this.formService.value.precio,
        gimnasio: this.idGym,
      });
      this.ServiciosService
        .newService(this.formService.value)
        .subscribe((respuesta) => {
          if (respuesta) {
            if (respuesta.message == "Insertado con exito") {
            }
          } else {
          }
        });
    }
  }

  setPrice(servicios: any[]) {
    this.prices = []; 
    if (servicios) {
      servicios.forEach((servicio) => {
        this.prices.push(servicio.precio_unitario);
      });
      this.totalPlanPersolnalized = this.prices.reduce((a, b) => a + b, 0);
      if (this.selection == 2) {
        const precioControl = this.formPlan.get("precio");
        if (precioControl) {
          precioControl.setValue(this.totalPlanPersolnalized);
        }
      }
    } else {
    }
  }

  getServices() {
    this.GimnasioService.getServicesForId(this.idGym).subscribe((respuesta) => {
        this.servicios = respuesta;
    });
  }
}
