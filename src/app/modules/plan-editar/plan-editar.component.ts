import { Component, OnInit, Inject } from "@angular/core";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from "../../service/auth.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import 'moment-timezone';

import { PromocionService } from "./../../service/promocion.service";
import { ProductoService } from "./../../service/producto.service";
import { Inventario } from "../../models/inventario";
import { ToastrService } from "ngx-toastr";
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: "app-membresias-editar",
  templateUrl: "./plan-editar.component.html",
  styleUrls: ["./plan-editar.component.css"],
})
export class planEditarComponent {
  formulariodePlan: FormGroup;
  plan: any[] = [];
  selectedMembresias: any[] = [];

  servicios: any[] = [];//se usa
  membresias: any[] = [];//se usa
  idMem: any;//se usa
  paquete: any;

  constructor(
    public dialogo: MatDialogRef<planEditarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public formulario: FormBuilder,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,

    private promocionService:PromocionService,
    private productoService:ProductoService,
    private toastr: ToastrService,

  ) {
    this.idMem = data.id_promocion;

    this.formulariodePlan = this.formulario.group(
      {
        id_promocion:["", Validators.required],
        titulo: ["", Validators.required],
        fechaInicio: ["", Validators.required],
        fechaFin: ["", Validators.required],
        precio: ["", Validators.required],
        existencias: ["", Validators.required],
        Gimnasio_idGimnasio: [this.auth.idGym.getValue(), Validators.required],

        membresias: [[], Validators.required]

      }
    );
  }


  //OBTENER LOS DATOS
  ngOnInit(): void {

    const idGym = this.auth.idGym.getValue();
    const idPromo = this.idMem;

    this.promocionService.listaPlanes(idGym).pipe(
      switchMap((respuesta) => {
        const data = respuesta.data;

        if(!Array.isArray(data)) {
          throw new Error('La respuesta no contiene un arreglo válido.');
        }

        this.servicios = this.filtrarDatos(data, idPromo);

        //Guardamos el id de paquete para usarlo despues
        this.paquete = Number(this.servicios[0]?.idChoProm || 0);
        console.log("Estatus inicializado:", this.paquete);


        return this.productoService.obternerInventario(idGym);
      }),
      catchError((error) => {
        console.log('Error al obtener datos: ',error.message);
        return of(null);
      })
    ).subscribe((respuestaInventario) => {
      if(!respuestaInventario) return;

      const datos = this.aplicarFiltro(respuestaInventario);

      this.plan = this.mapearInventario(datos);
      this.membresias = this.mapearMembresias(this.servicios);

      //FILTRAR MEMBRESIAS SELECCIONADAS
      this.selectedMembresias =this.plan.filter((plan) =>
        this.membresias.some((membresia) => membresia.idProbob === plan.idProbob)
      );


      //CONFIGURAR FORMULARIO
      this.formulariodePlan.patchValue({
        id_promocion: this.servicios[0].id_promocion,
        titulo: this.servicios[0].nombrePromocion,
        //status: this.servicios[0].estatus,
        existencias: this.servicios[0].existencias,
        precio: this.servicios[0].PrecioPaquete,

        membresias: this.paquete === 1
        ? (Array.isArray(this.selectedMembresias) ? this.selectedMembresias : [this.selectedMembresias]) // muchos
        : this.selectedMembresias ? this.selectedMembresias[0] : null // unicos

      });
        let fechaDate = new Date(this.servicios[0].FechaInicio + ' 0:00:00');
        this.formulariodePlan.controls['fechaInicio'].setValue(fechaDate);
        let fechaDate2 = new Date(this.servicios[0].FechaFin + ' 0:00:00');
        this.formulariodePlan.controls['fechaFin'].setValue(fechaDate2);

    });

  }

///ACRUALIZAR LOS PLANES
actualizar() {
  if(this.formulariodePlan.valid) {
    const formularioData = this.formulariodePlan.value;
    if (
      !formularioData.titulo?.trim() ||
      !formularioData.precio ||
      !formularioData.fechaInicio ||
      !formularioData.fechaFin
    ) {
      this.toastr.error("Todos los campos son obligatorios, un campo esta vacio", "Error");
      return;
      }

      // Verifica idChoProm y membresias
      if(formularioData.membresias.length <= 1 && this.paquete === 1){
        this.toastr.error("Eligue más de una opción en membresias", "Error");
        return;
      }

      // Validar que las fechas sean correctas
      const dateValidation = this.dateLessThan('fechaInicio', 'fechaFin')(
      this.formulariodePlan
      );

      if (dateValidation && dateValidation['dates']) {
        this.toastr.error(dateValidation['dates'], 'Error');
        return; // Evita continuar si hay error en las fechas
      }

      //mostrar boton de carga
      this.spinner.show();

      this.promocionService.updatePlanesMem(formularioData).subscribe((respuesta) =>{
        this.spinner.hide();

        if(respuesta.success == 1){
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
          this.toastr.error("No se pudo editar el plan", "Error");
        }
      })


    } else {
      this.marcarCamposInvalidos(this.formulariodePlan);
      this.toastr.error("Por favor, llena correctamente todos los campos.", "Error");
    }
  }


  cerrarDialogo() {
    this.dialogo.close(true);
  }

  //Validacion de los campos
  isFieldInvalid(field: string, error: string): boolean {
    const control = this.formulariodePlan.get(field);
    return control?.errors?.[error] && (control?.touched ?? false);
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

  //firltra los datos solo por id de la promocion llamada
  private filtrarDatos(data: { id_promocion: number; [key: string]: any }[], id_promo: number): any[] {
    // Filtrar los datos asegurando que ambos sean números
    return data.filter(item => item.id_promocion === id_promo);
  }

  //FILTRO PARA SOLO MOSTRAR MEMBRESIAS
  aplicarFiltro(productos: Inventario[]): Inventario[] {
    return productos.filter((producto) => {
      return producto.nombreCategoria === "Servicios";
    });
  }

  //fechas
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

  /** FUNCIONES PRIVADAS **/
  private mapearInventario(inventario: any[]): any[]{
    return inventario.map((data) => ({
      idProbob: data.idProbob,
      nombreProducto: data.nombreProducto,
      nombreCategoria: data.nombreCategoria,
      marca: data.marca,
    }) );
  }

  private mapearMembresias(servivios: any[]): any[] {
    return this.servicios.map((servicio) => ({
      idProbob: servicio.idProbob,
    }))
  }




}
