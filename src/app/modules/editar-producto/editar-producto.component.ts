
import { Component, OnInit, Inject, ChangeDetectionStrategy} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api'; /**siempre debes importarlo */
//import { ToastrService } from 'ngx-toastr';
//import { ColaboradorService } from 'src/app/service/colaborador.service';
import { ProductoService } from 'src/app/service/producto.service';

import { MatDialog } from "@angular/material/dialog";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import { CategoriaService } from 'src/app/service/categoria.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/service/auth.service';
import { NgxSpinnerService } from "ngx-spinner";
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, formulario: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = formulario && formulario.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-editar-producto',
  templateUrl: './editar-producto.component.html',
  styleUrls: ['./editar-producto.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe, MessageService],
})
export class EditarProductoComponent implements OnInit{
  form: FormGroup;
  gimnasio: any;
  message: string = '';
  producto: any;
  idCategoria: number = 0;
  listaCategorias: any;
  idProducto: any;
  fechaCreacion: string;

  constructor( public dialogo: MatDialogRef<EditarProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb:FormBuilder,
    private activeRoute: ActivatedRoute, 
    private productoService:ProductoService,
    private datePipe: DatePipe,
    private router:Router,
    private spinner: NgxSpinnerService,
    private auth:AuthService,
    public dialog: MatDialog,
    private categoriaService: CategoriaService,){

    this.idProducto = data.idProducto;
    console.log(this.idProducto, "this.idProducto");
    //llamar al servicio datos empleado - pasando el parametro capturado por url
    this.productoService.consultarProductosJ(this.idProducto).subscribe(
      respuesta=>{
        //asignar valor a los campos correspondientes al fomulario
        console.log(respuesta, "respuesta");
        this.form.setValue({
          nombre:respuesta [0]['nombre'],
          descripcion:respuesta [0]['descripcion'],
          codigoBarra:respuesta [0]['codigoBarra'],
          idCategoria:respuesta [0]['Categoria_idCategoria'],
          Gimnasio_idGimnasio:respuesta [0]['Gimnasio_idGimnasio'],
          fechaCreacion:respuesta [0]['fechaCreacion'],
          unidadMedicion:respuesta [0]['unidadMedicion'],
          cantidadUnidades:respuesta [0]['cantidadUnidades'],
          color:respuesta [0]['color'],
          longitud:respuesta [0]['longitud'],
          sabor:respuesta [0]['sabor'],
          talla:respuesta [0]['talla'],
          marca:respuesta [0]['marca'],
        });
      }
      
    );

    this.fechaCreacion = this.obtenerFechaActual();
   
    this.form = this.fb.group({
      nombre: [ '',Validators.compose([Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u),]),],
      descripcion: ['', Validators.required],
      fechaCreacion: [this.fechaCreacion],
      codigoBarra: ['', [Validators.minLength(12), Validators.maxLength(15)]],
      idCategoria: ['', Validators.compose([Validators.required])],
      Gimnasio_idGimnasio: [this.auth.idGym.getValue()],
      unidadMedicion: ['NA', Validators.compose([Validators.required])],
      cantidadUnidades: [0,Validators.compose([Validators.required,Validators.pattern(/^[0-9]+$/)])],
      color: ['NA',Validators.compose([Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u)])],
      longitud: ['NA'],
      sabor: ['NA',Validators.compose([Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u)])],
      talla: [''],
      marca: ['',Validators.compose([Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u)])]
    });
  }

  //insanciar objeto para manejar el tipo de error en las validaciones
  matcher = new MyErrorStateMatcher();

  //mandar a llamar el sevicio correspondiente al llenado del combo sucursal
  ngOnInit(): void {
    this.categoriaService.obternerCategoria().subscribe({
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


  actualizar(){
    this.productoService.actualizarProducto(this.idProducto,this.form.value).subscribe(
      (response) => {
        this.spinner.hide();
        this.dialog.open(MensajeEmergentesComponent, {
          data: `Producto actualizado exitosamente`,
        })
        .afterClosed()
        .subscribe((cerrarDialogo: Boolean) => {
          if (cerrarDialogo) {
            this.dialogo.close(true);
          } else {
            
          }
        });
      },
      (error) => {
        console.error('Error al actualizar producto:', error);
        // Manejo de errores
      }
    );
}

infoCategoria(event: number) {
  this.idCategoria = event;
}

cerrarDialogo(): void {
  this.dialogo.close(true);
}

}
