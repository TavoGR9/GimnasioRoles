import { Component, OnInit, Inject } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import { AuthService } from "../../service/auth.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { PromocionService } from "../../service/promocion.service";
import { ProductoService } from "../../service/producto.service";

import { Inventario } from "../../models/inventario";
import { AgregarProductoMembresiaComponent } from '../agregar-producto-membresia/agregar-producto-membresia.component';
import { plan } from '../../models/plan';

@Component({
  selector: "app-membresias-agregar",
  templateUrl: "./plan-agregar.component.html",
  styleUrls: ["./plan-agregar.component.css"],
})
export class planAgregarComponent {
  formulariodePlan: FormGroup;

  message: string = "";
  hide = true;
  selectedMembresia: any;
  idGym: number = 0;
  plan: any[] = [];
  noServicios: boolean = false;//saber si hay membresias
  Producto: any[] = [];

  isMultiple: boolean = false;

  constructor(
    public dialogo: MatDialogRef<planAgregarComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string,
    private fb: FormBuilder,
    private router: Router,
    private promocionService: PromocionService,
    private productoService: ProductoService,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    public dialog: MatDialog
  ) {
    this.formulariodePlan = this.fb.group(
      {
        idChoProm: ["", Validators.required],
        estatus: [1],
        nombrePromocion: ["", Validators.required],
        FechaInicio: ["", Validators.required],
        FechaFin: ["", Validators.required],
        PrecioPaquete: ["", Validators.required],
        existencias: ["", Validators.required],
        idGym: [this.auth.idGym.getValue(), Validators.required],

        membresias: [[], Validators.required],
        preciopv: [1],
        plataforma: ["Web"]

      },
    );
  }


  ngOnInit(): void {
    this.auth.idGym.subscribe((id) => {
      if (id) {
        this.idGym = id;
      }
      //se optinene las membresias
      this.productoService.obternerInventario(this.idGym)
        .subscribe((respuesta) => {
          if (respuesta )
          this.plan = this.aplicarFiltro(respuesta);
        //console.log("datos membresia: ",this.plan);
        });
    });

  }


  onTipoPromocionChange(value: number): void {
    this.isMultiple = value === 1; // Si selecciona "Paquete", permite múltiples opciones
  }


  cancelar() {
    this.formulariodePlan.reset();
    this.router.navigateByUrl("admin/misMembresias");
  }


  enviar(): any {
    if(this.formulariodePlan.valid) {
      const formularioData = this.formulariodePlan.value;

      //filtro para los datos
      if (
        !formularioData.idChoProm ||
        !formularioData.nombrePromocion?.trim() ||
        !formularioData.preciopv ||
        !formularioData.FechaInicio ||
        !formularioData.FechaFin
      ) {
        this.toastr.error("Todos los campos son obligatorios, un campo esta vacio", "Error");
        return;
      }


       // Verifica idChoProm y membresias
      if(formularioData.membresias.length <= 1 && formularioData.idChoProm === 1){
        this.toastr.error("Eligue más de una opción", "Error");
        return;
      }

      // Validar que las fechas sean correctas
      const dateValidation = this.dateLessThan('FechaInicio', 'FechaFin')(
      this.formulariodePlan
      );

      if (dateValidation && dateValidation['dates']) {
        this.toastr.error(dateValidation['dates'], 'Error');
        return; // Evita continuar si hay error en las fechas
      }

      //mostrar boton de carga
      this.spinner.show();

      this.promocionService.agregarPlan(formularioData).subscribe((respuesta) => {
        this.spinner.hide();

        if(respuesta.success == 1) {
          //ABRIMOS DIALOGO
          const dialogRef = this.dialog.open(MensajeEmergentesComponent, {
            data: `Registro agregado a la base de datos local`,
          });

          //CERRAMOS DIALOGO
          dialogRef.afterClosed().subscribe((cerrarDialogo: boolean) => {
            if (cerrarDialogo) {
              this.dialogo.close(true);
            }
          })
        } else {
          console.log("la respuesta que trae API: " +respuesta);
          this.toastr.error(
            'El plan ya existe, por favor elige otro nombre',
            'Error');
        }
      })
    } else {
      this.marcarCamposInvalidos(this.formulariodePlan);

      this.toastr.error("Por favor, llena correctamente todos los campos.", "Error");
    }
  }
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

  //VALIDAR LAS FECHAS
  dateLessThan(from: string, to: string) {
    return (group: FormGroup): { [key: string]: any } => {
      let f = group.controls[from];
      let t = group.controls[to];
      if (f.value > t.value) {
        return {
          dates: `La fecha de inicio debe ser anterior a la fecha de fin`,
        };
      }
      return {};
    };
  }
   //FILTRO DE LAS MEMBRESIAS A MOSTRAR
   aplicarFiltro(productos: Inventario[]): Inventario[] {
    return productos.filter((producto) => {
      return producto.nombreCategoria === "Servicios";
    });
  }

  openDialog(): void {
    this.promocionService.optionShow.next(1);
    this.promocionService.optionShow.subscribe((option) => {});
    const dialogRef = this.dialog.open(AgregarProductoMembresiaComponent, {
      width: "70%",
      height: "90%",
      disableClose: true,
      data: { name: "¿Para quién es esta membresía?" },
    });

    dialogRef.afterClosed().subscribe((nuevoServicio) => {
      this.productoService.obternerInventario(this.idGym)
        .subscribe((respuesta) => {
          if (respuesta )
          this.plan = this.aplicarFiltro(respuesta);
        //console.log("datos membresia: ",this.plan);
        });
    });
  }
}
