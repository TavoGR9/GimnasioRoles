import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AuthService } from "../../service/auth.service";
import { CategoriaService } from '../../service/categoria.service';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-editar-marca',
  templateUrl: './editar-marca.component.html',
  styleUrls: ['./editar-marca.component.css']
})
export class EditarMarcaComponent {

  serviceForm!: FormGroup;
  idGym: number = 0;
  idMarca: number = 0;
  marca: any;
  marcasDisponibles: any;
  seleccionado: number = 0;
  message: string = "";

  esServicio: boolean = true;


  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private auth: AuthService,
    private categoriaService: CategoriaService,
    private dialogRef: MatDialogRef<EditarMarcaComponent>,
    private spinner: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data: any,

  ) {

    this.idMarca = data.idMarca;

    this.serviceForm = this.fb.group({
      id_marcas: [0],
      marcaP: ["",[Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u),],],
      servicio: ["", Validators.required],
      fk_idGimnasio: [0],
    });
  }

  ngOnInit(): void {
    this.getIdGym();

    if (this.idMarca) {
      this.categoriaService.getMarcaService2(this.idMarca).subscribe((res) => {
        if (res.success === 1 && res.data) {
          this.marca = res.data[0];
          // console.log('Datos de la marca recibidos:', this.marca);

          // Llenar el formulario con los datos de la marca
          this.serviceForm.patchValue({
            id_marcas: this.marca.id_marcas,
            marcaP: this.marca.marca,
            servicio: this.marca.servicio,
            fk_idGimnasio: this.idGym,
          });
        }
      });
    }
  }


  getIdGym() {
    this.auth.idGym.subscribe((respuesta) => {
      this.idGym = respuesta;
    });
  }

  actualizarForm() {
    if (this.serviceForm.invalid) {
      this.marcarCamposInvalidos(this.serviceForm);
      this.message = "Por favor, complete los campos obligatorios correctamente.";
      return;
    }
    this.spinner.show();
    // console.log('Datos a enviar: ', this.serviceForm.value);

    this.categoriaService.updateMarcaService2(this.serviceForm.value).subscribe((res) => {
      this.spinner.hide();
      if (res && res.success) {
        const dialogRefConfirm = this.dialog.open(MensajeEmergentesComponent, { data: `¡Servicio actualizado con éxito!` });
        dialogRefConfirm.afterClosed().subscribe(() => {
          this.categoriaService.confirmButton.next(true);
          this.dialogRef.close();
        });
      } else {
        this.message = res.message || "Error al actualizar la marca.";
        console.error("Error en la actualización", res);
      }
    }, (error) => {
      this.spinner.hide();
      this.message = "Error en la conexión al servidor.";
      console.error("Error al actualizar la marca:", error);
    });
  }

  marcarCamposInvalidos(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((campo) => {
      const control = formGroup.get(campo);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  cancelar() {
    this.dialogRef.close();
  }

}
