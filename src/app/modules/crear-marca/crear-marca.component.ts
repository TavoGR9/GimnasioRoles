import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AuthService } from "../../service/auth.service";
import { CategoriaService } from '../../service/categoria.service';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-crear-marca',
  templateUrl: './crear-marca.component.html',
  styleUrls: ['./crear-marca.component.css']
})
export class CrearMarcaComponent implements OnInit {
  serviceForm!: FormGroup;
  idGym: number = 0;
  idService: number = 0;
  marcasDisponibles: any;
  seleccionado: number = 0;
  message: string = "";

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private auth: AuthService,
    private categoriaService: CategoriaService,
    private dialogRef: MatDialogRef<CrearMarcaComponent>,
    private spinner: NgxSpinnerService
  ) {
    this.serviceForm = this.fb.group({
      id_marcas: [0],
      marcaP: ["",[Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u),],],
    });
  }

  ngOnInit(): void {
    this.getIdGym();

    // this.categoriaService.obtenerMarcasSer().subscribe((res) => {
    //   if (res) {
    //     this.marcasDisponibles = res;
    //   } else {
    //     console.error("No se pudieron obtener las marcas.");
    //   }
    // });
  }

  getIdGym() {
    this.auth.idGym.subscribe((respuesta) => {
      this.idGym = respuesta;
    });
  }

  validaFormService() {
    if (this.serviceForm.invalid) {
      this.message = "Por favor, complete todos los campos requeridos.";
      this.marcarCamposInvalidos(this.serviceForm);
    } else {
      this.spinner.show();

      const newMarca = {
        ...this.serviceForm.value,
        idGimnasio: this.idGym  // Incluye el idGym en el objeto de la nueva marca
      };

      this.categoriaService.agregarMarcaSer2(newMarca).subscribe((respuesta) => {
        if (respuesta) {
          if (respuesta.success == '1') {
            this.spinner.hide();
            const dialogRefConfirm = this.dialog.open(MensajeEmergentesComponent, {
              data: `¡Servicio agregado con éxito!`,
            });
            dialogRefConfirm.afterClosed().subscribe(() => {
              this.dialogRef.close(respuesta);
            });
          } else {
            this.spinner.hide();
            this.message = "Hubo un error al agregar la marca.";
            console.error("Error al agregar marca", respuesta);
          }
        } else {
          this.spinner.hide();
          this.message = "No se pudo conectar con el servidor.";
        }
      });
    }
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
