
import { Component, OnInit, Inject, ChangeDetectionStrategy} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api'; /**siempre debes importarlo */
//import { ToastrService } from 'ngx-toastr';
//import { ColaboradorService } from 'src/app/service/colaborador.service';
import { ProductoService } from '../../service/producto.service';

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
  private idGym: number = 0;
  currentUser: string = '';
  sabores: string[] = [];
  filteredSabores: string[] = [];

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
    //llamar al servicio datos empleado - pasando el parametro capturado por url
    this.productoService.consultarProductosJ(this.idProducto).subscribe(
     
      respuesta=>{
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
      cantidadUnidades: [0,Validators.compose([Validators.required])],
      color: ['NA',Validators.compose([Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u)])],
      longitud: ['NA'],
      sabor: ['NA',Validators.compose([Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u)])],
      talla: [''],
      marca: ['',Validators.compose([Validators.required,Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u)])]
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
  //insanciar objeto para manejar el tipo de error en las validaciones
  matcher = new MyErrorStateMatcher();

  //mandar a llamar el sevicio correspondiente al llenado del combo sucursal
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


  actualizar(){
    this.spinner.show();
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
