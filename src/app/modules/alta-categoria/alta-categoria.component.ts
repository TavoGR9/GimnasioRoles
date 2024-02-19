import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CategoriaService } from './../../service/categoria.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { GimnasioService } from 'src/app/service/gimnasio.service';
import { AuthService } from 'src/app/service/auth.service';
import { Observable, Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from "ngx-spinner";


@Component({
  selector: 'app-alta-categoria',
  templateUrl: './alta-categoria.component.html',
  styleUrls: ['./alta-categoria.component.css']
})
export class AltaCategoriaComponent implements OnInit {
  formularioCategoria: FormGroup;
  message: string = '';
  hide = true;
  gimnasio: any;
  fechaRegistro: string = '';

  constructor(
    public dialogo: MatDialogRef<AltaCategoriaComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string,
    public formulario: FormBuilder,
    private router: Router,
    private categoriaService: CategoriaService,
    private gimnasioService: GimnasioService,
    private auth: AuthService,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService
  ) {
    //this.fechaRegistro = this.obtenerFechaActual();
    const fechaActual = new Date().toISOString().split('T')[0];
    this.formularioCategoria = this.formulario.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      estatus: ['', Validators.required],
      //fechaCreacion: ['', Validators.required],
      //fechaCreacion: [this.fechaRegistro],
      fechaCreacion: [fechaActual],
      Gimnasio_idGimnasio:[this.auth.idGym.getValue()],
    });
  }

  ngOnInit(): void {
   
  }

  obtenerFechaActual(): string {
    const fechaActual = new Date();
    const dia = fechaActual.getDate();
    const mes = fechaActual.getMonth() + 1; // Los meses comienzan desde 0
    const año = fechaActual.getFullYear();

    // Formatea la fecha como "07/02/2024" para mostrar en la interfaz de usuario
    const fechaFormateada = `${dia < 10 ? '0' + dia : dia}/${mes < 10 ? '0' + mes : mes}/${año}`;

    return fechaFormateada;
  }  

  private categoriasSubject = new Subject<void>();

enviar(): any {
  if (this.formularioCategoria.valid) {
    this.spinner.show();
    this.categoriaService.agregarCategoria(this.formularioCategoria.value).subscribe((respuesta) => {
      // Cierra el diálogo después de agregar la categoría y notificar el cambio
      this.spinner.hide();
      this.dialog.open(MensajeEmergentesComponent, {
        data: `Categoria agregada exitosamente`,
      })
      .afterClosed()
      .subscribe((cerrarDialogo: Boolean) => {
        if (cerrarDialogo) {
          this.categoriasSubject.next();
          this.dialogo.close(true);
        } else {
          // Hacer algo si no se quiere cerrar el diálogo
        }
      });

    });
  } else {
    this.message = 'Por favor, complete todos los campos requeridos.';
    this.marcarCamposInvalidos(this.formularioCategoria);
  }
}

cerrarDialogo(): void {
  this.dialogo.close(true);
}

marcarCamposInvalidos(formGroup: FormGroup) {
  Object.keys(formGroup.controls).forEach((campo) => {
    const control = formGroup.get(campo);
    if (control instanceof FormGroup) {
      this.marcarCamposInvalidos(control);
    } else {
      if (control) {
        control.markAsTouched();
      };
    }
  });
}

  
}
