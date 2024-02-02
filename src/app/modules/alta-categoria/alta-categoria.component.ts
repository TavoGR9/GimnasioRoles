import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CategoriaService } from 'src/app/service/categoria.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { GimnasioService } from 'src/app/service/gimnasio.service';
import { AuthService } from 'src/app/service/auth.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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

  constructor(
    public dialogo: MatDialogRef<AltaCategoriaComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string,
    public formulario: FormBuilder,
    private router: Router,
    private categoriaService: CategoriaService,
    private gimnasioService: GimnasioService,
    private auth: AuthService,
    public dialog: MatDialog
  ) {
    this.formularioCategoria = this.formulario.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      estatus: ['', Validators.required],
      fechaCreacion: ['', Validators.required],
      Gimnasio_idGimnasio:[this.auth.idGym.getValue()],
    });
  }

  ngOnInit(): void {
  }

  enviar(): any {
    if (this.formularioCategoria.valid) {
      this.categoriaService.agregarCategoria(this.formularioCategoria.value).subscribe((respuesta) => {
          this.dialog.open(MensajeEmergentesComponent, {
              data: `Categoria agregada exitosamente`,
            })
            .afterClosed()
            .subscribe((cerrarDialogo: Boolean) => {
              if (cerrarDialogo) {
                this.dialogo.close(true);
              } else {
              }
            });
        });
    } else {
      this.message = 'Por favor, complete todos los campos requeridos.';
    }
  }

  cerrarDialogo(): void {
    this.dialogo.close(true);
  }
  
}
