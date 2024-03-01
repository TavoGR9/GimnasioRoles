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
import { CategoriaService } from '../../service/categoria.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/service/auth.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { ProductoService } from '../../service/producto.service';
import { Observable, Subject } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { AltaCategoriaComponent } from '../alta-categoria/alta-categoria.component';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';
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
  private idGym: number = 0;
  message: string = '';
  currentUser: string = '';
  categorias: any[] = [];
  //sabores: any[] = [];

  constructor(
    public dialogo: MatDialogRef<CrearProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private ngZone: NgZone,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private auth: AuthService,
    private productoService: ProductoService,
    private httpClient: HttpClient,
    private router: Router,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService
  ) {
    this.fechaCreacion = this.obtenerFechaActual();
    // formulario
    this.form = this.fb.group({
      nombre: [ '',Validators.compose([Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u),]),],
      descripcion: [''],
      fechaCreacion: [this.fechaCreacion],
      codigoBarra: [''],
      idCategoria: ['', Validators.compose([Validators.required])],
      Gimnasio_idGimnasio: [this.auth.idGym.getValue()],
      unidadMedicion: ['NA', Validators.compose([Validators.required])],
      cantidadUnidades: [0,Validators.compose([Validators.required])],
      color: ['NA',Validators.compose([Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u)])],
      longitud: ['NA'],
      sabor: ['NA',Validators.compose([Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u)])],
      talla: [''],
      marca: ['',Validators.compose([Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u)])]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }
    
    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
      this.listaTabla();
    });  
    
  }

  listaTabla(){
    this.categoriaService.consultarListaCategoria(this.idGym).subscribe({
      next: (respuesta) => {
        this.listaCategorias = respuesta;
      },
      error: (error) => {
        //console.log(error);
      },
    });

  };

  getSSdata(data: any){
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
          this.auth.role.next(resultData.rolUser);
          this.auth.userId.next(resultData.id);
          this.auth.idGym.next(resultData.idGym);
          this.auth.nombreGym.next(resultData.nombreGym);
          this.auth.email.next(resultData.email);
          this.auth.encryptedMail.next(resultData.encryptedMail);
      }, error: (error) => { console.log(error); }
    });
  }

  altaCategoria(): void {
    const dialogRef = this.dialog.open(AltaCategoriaComponent, {
      width: '60%',
      height: '70%',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((nuevoServicio) => {
       if (nuevoServicio.registroInsertado) {
         if (!Array.isArray(this.listaCategorias)) {
           this.listaCategorias = [];
         }
         this.listaCategorias.push(nuevoServicio.registroInsertado);
       }
     });
  }
  
  validarNumeroDecimal(event: any) {
    const input = event.target.value;
    // Patrón para aceptar números decimales
    const pattern = /^\d+(\.\d{0,2})?$/;
    
    if (!pattern.test(input)) {
      // Si el valor no coincide con el patrón, se elimina el último carácter
      this.form.get('cantidadUnidades')?.setValue(input.slice(0, -1));
    }
  }
  


// Declarar la propiedad sabores con un tipo de arreglo de cadenas
sabores: string[] = [];
filteredSabores: string[] = [];


buscarSabores() {
  const saborIngresado = this.form.get('sabor')?.value;
//  console.log(`Buscando sabores para: ${saborIngresado}`);
  this.productoService.consultarsabores(this.idGym).subscribe({
    next: (respuesta) => {
      const saboresUnicos = new Set(respuesta.sabores.map((sabor: any) => sabor.sabor));
      this.sabores = Array.from(saboresUnicos) as string[];

      this.filteredSabores = this.sabores.filter(sabor =>
        !saborIngresado || sabor.toLowerCase().includes(saborIngresado.toLowerCase())
      );
    }
  });
}


 

  obtenerFechaActual(): string {
    const fechaActual = new Date();
    return this.datePipe.transform(fechaActual, 'yyyy-MM-dd HH:mm:ss') || '';
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

  private productoSubject = new Subject<void>();

  /*registrar(): any {
    if (this.form.valid) { 
      this.spinner.show();
      this.form.setValue({
        idCategoria: this.form.value.idCategoria,
      });
      console.log(this.form.value, "this.form.value")
      this.productoService.creaProducto(this.form.value).subscribe({
          next: (respuesta) => {
            if (respuesta.success) {
              idPlan: respuesta.id,
              this.spinner.hide();
            this.dialog.open(MensajeEmergentesComponent, {
              data: `Producto agregada exitosamente`,
            }).afterClosed().subscribe((cerrarDialogo: Boolean) => {
              if (cerrarDialogo) {
                this.productoSubject.next();
                this.dialogo.close(true);
              } else {
              }
            });
            } else {
              this.toastr.error(respuesta.message, 'Error', {
                positionClass: 'toast-bottom-left',
              });
              //console.error(respuesta.error);
            }
          },
          error: (paramError) => {
           // console.error(paramError); // Muestra el error del api en la consola para diagnóstico
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
  /*  } else {
      this.message = 'Por favor, complete todos los campos requeridos.';
    this.marcarCamposInvalidos(this.form);
    }
  }*/

  registrar(): any {
    if (this.form.valid) { 
      this.spinner.show();
      this.productoService.creaProducto(this.form.value).subscribe({
        next: (respuesta) => {
          if (respuesta.success) {
            // Aquí hay un error, debería ser una coma en lugar de dos puntos
            // idPlan: respuesta.id,
            this.spinner.hide();
  
            this.dialog.open(MensajeEmergentesComponent, {
              data: `Producto agregado exitosamente`,
            }).afterClosed().subscribe((cerrarDialogo: Boolean) => {
              if (cerrarDialogo) {
                this.productoSubject.next();
                this.dialogo.close(true);
              } else {
                // Puedes agregar lógica adicional aquí si es necesario
              }
            });
          } else {
            this.toastr.error(respuesta.message, 'Error', {
              positionClass: 'toast-bottom-left',
            });
            //console.error(respuesta.error);
          }
        },
        error: (paramError) => {
          //console.error(paramError); // Muestra el error del api en la consola para diagnóstico
          // Accedemos al atributo error y al key
          this.toastr.error(paramError.error.message, 'Error', {
            positionClass: 'toast-bottom-left',
          });
        },
      });
    } else {
      this.message = 'Por favor, complete todos los campos requeridos.';
      this.marcarCamposInvalidos(this.form);
    }
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
