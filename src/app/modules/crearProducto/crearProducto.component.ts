import { ChangeDetectionStrategy, Component, OnInit, Inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { MessageService } from 'primeng/api'; /**siempre debes importarlo */
import { ToastrService } from 'ngx-toastr';
import { CategoriaService } from 'src/app/service/categoria.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/service/auth.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MensajeEmergenteComponent } from '../mensaje-emergente/mensaje-emergente.component';
import { ProductoService } from 'src/app/service/producto.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    formulario: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = formulario && formulario.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'crear-producto',
  templateUrl: './crearProducto.component.html',
  styleUrls: ['./crearProducto.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe, MessageService],
})
export class CrearProductoComponent implements OnInit {
  fechaCreacion: string;
  form: FormGroup;
  matcher = new MyErrorStateMatcher();
  idCategoria: number = 0;
  listaCategorias: any;
  uploadedFiles: File[] = [];

  constructor(
    public dialogo: MatDialogRef<CrearProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private auth: AuthService,
    private productoService: ProductoService,
    private httpClient: HttpClient,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.fechaCreacion = this.obtenerFechaActual();
    // formulario
    this.form = this.fb.group({
      nombre: [ '',Validators.compose([Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u),]),],
      descripcion: ['', Validators.required],
      fechaCreacion: [this.fechaCreacion],
      codigoBarra: [''],
      idCategoria: ['', Validators.compose([Validators.required])],
      unidadMedicion: ['NA', Validators.compose([Validators.required])],
      cantidadUnidades: [0,Validators.compose([Validators.required,Validators.pattern(/^[0-9]+$/)])],
      color: ['NA',Validators.compose([Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u)])],
      longitud: ['NA'],
      sabor: ['NA',Validators.compose([Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u)])],
      marca: ['',Validators.compose([Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u)])]
    });
  }

  ngOnInit(): void {
    this.categoriaService.consultarListaCategoria(this.auth.idGym.getValue()).subscribe({
      next: (respuesta) => {
        this.listaCategorias = respuesta;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  obtenerFechaActual(): string {
    const fechaActual = new Date();
    return this.datePipe.transform(fechaActual, 'yyyy-MM-dd HH:mm:ss') || '';
  }

  infoCategoria(event: number) {
    this.idCategoria = event;
  }

  cerrarDialogo(): void {
    this.dialogo.close(true);
  }
 
  onFileSelect(event: any) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
    // event.files contiene la lista de archivos seleccionados
    const selectedFiles = event.files;
    // Obtén el valor actual del control 'files' en el formulario
    const currentFiles = this.form.get('files')?.value || [];
    // Agrega los nuevos archivos al valor actual
    const updatedFiles = [...currentFiles, ...selectedFiles];
    // Actualiza el valor del control 'files' en el formulario con la nueva lista de archivos
    this.form.patchValue({ files: updatedFiles });
  }

  registrar(): any {
    if (this.form.valid) { 
      this.productoService.creaProducto(this.form.value).subscribe({
          next: (respuesta) => {
            if (respuesta.success) {
            this.dialog.open(MensajeEmergenteComponent, {
              data: `Categoria agregada exitosamente`,
            }).afterClosed().subscribe((cerrarDialogo: Boolean) => {
              if (cerrarDialogo) {
                this.dialogo.close(true);
              } else {
              }
            });
            } else {
              this.toastr.error(respuesta.message, 'Error', {
                positionClass: 'toast-bottom-left',
              });
              console.error(respuesta.error);
            }
          },
          error: (paramError) => {
            console.error(paramError); // Muestra el error del api en la consola para diagnóstico
            //accedemos al atributo error y al key
            this.toastr.error(paramError.error.message, 'Error', {
              positionClass: 'toast-bottom-left',
            });
          },
        });

       /* this.uploadService
        .subirImagenes(this.uploadedFiles)
        .subscribe({
          next: (respuesta) => {
            console.log(respuesta);

            if (respuesta.success) {
              this.toastr.success(respuesta.message, 'Exito', {
                positionClass: 'toast-bottom-left',
              });
            } else {
              this.toastr.error(respuesta.message, 'Error', {
                positionClass: 'toast-bottom-left',
              });
            }
          },
          error: (paramError) => {
            console.error(paramError); // Muestra el error del api en la consola para diagnóstico
            //accedemos al atributo error y al key
            this.toastr.error(paramError.error.message, 'Error', {
              positionClass: 'toast-bottom-left',
            });
          },
        });*/
    } else {
      this.toastr.error('Completa el formulario', 'Error', {
        positionClass: 'toast-bottom-left',
      });
    }
  }
}
