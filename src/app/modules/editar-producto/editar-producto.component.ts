import { Component, OnInit, Inject, ChangeDetectionStrategy} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MessageService } from 'primeng/api'; 
import { ProductoService } from '../../service/producto.service';
import { MatDialog } from "@angular/material/dialog";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../service/auth.service';
import { NgxSpinnerService } from "ngx-spinner";
import { Subject } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { EntradasService } from '../../service/entradas.service';
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
  categorias: any[] = [];
  sabores: string[] = [];
  marcas: string[] = [];
  subcategorias: string[] = [];
  filteredSabores: string[] = [];
  filteredCategorias: string[] = [];
  filteredSubCategorias: string[] = [];
  filteredMarcas: string[] = [];
  private productoSubject = new Subject<void>();
  matcher = new MyErrorStateMatcher();

  constructor( public dialogo: MatDialogRef<EditarProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb:FormBuilder,
    private toastr: ToastrService,
    private entrada: EntradasService,
    private productoService:ProductoService,
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService,
    private auth:AuthService,
    public dialog: MatDialog){

    this.idProducto = data.idProducto;
    this.productoService.consultarProductosJ(this.idProducto).subscribe(
      respuesta=>{
        this.form.setValue({
          codigoBarra:respuesta [0]['codigoBarras'],       
          nomsubcate:respuesta [0]['subCategoria'],
          nombreCategoriaP:respuesta [0]['nombreCategoria'],
          descripcion:respuesta [0]['nombreProducto'],
          marcaP:respuesta [0]['marca'],
          detalleCompra:respuesta [0]['detalleCompra'],
          detalleUnidadMedida:respuesta [0]['marca'],
          precioCaja:respuesta [0]['precioCaja'],
          existencia:respuesta [0]['existencia'],
          precioSucursal:respuesta [0]['precioSucursal'],
          idBodPro:respuesta [0]['idBodPro'],
          idProbob:respuesta [0]['idProbob'],
          id_bodega:respuesta [0]['id_bodega']
        });
      }
      
    );

    this.fechaCreacion = this.obtenerFechaActual();
    this.form = this.fb.group({
      detalleUnidadMedida: ["pza", Validators.required],
      detalleCompra: [""],
      marcaP: [""],
      codigoBarra: [""],
      nombreCategoriaP: [""],
      nomsubcate: [""],
      descripcion: [""],
      precioCaja: [''],
      existencia: [''],
      precioSucursal: [''],
      idBodPro: [''],
      idProbob: [''],
      id_bodega: ['']
    });
  }

  validarNumeroDecimal(event: any) {
    const input = event.target.value;
    const pattern = /^\d+(\.\d{0,2})?$/;
    if (!pattern.test(input)) {
      // Si el valor no coincide con el patrón, se elimina el último carácter
      this.form.get('cantidadUnidades')?.setValue(input.slice(0, -1));
    }
  }

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }
    
    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
    });  
  }

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

  obtenerFechaActual(): string {
    const fechaActual = new Date();
    return this.datePipe.transform(fechaActual, 'yyyy-MM-dd HH:mm:ss') || '';
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

  actualizar(){
    const fechaActual: Date = new Date();
    const dia: string = fechaActual.getDate().toString().padStart(2, '0'); 
    const mes: string = (fechaActual.getMonth() + 1).toString().padStart(2, '0'); 
    const año: string = fechaActual.getFullYear().toString(); 
    const fechaFormateada: string = `${año}-${mes}-${dia}`;
    const data = {
      ultimo_id:this.form.value.idBodPro,
      existencia:this.form.value.existencia,
      precioSucursal:this.form.value.precioSucursal,
      precioCaja:this.form.value.precioCaja,
      accion: "Edición de nuevo producto",
      fecha_actu: fechaFormateada,
      p_id_producto: this.form.value.idProbob,
      p_id_bodega: this.form.value.id_bodega
    }

    this.entrada.actualizarProducto(data).subscribe({next: (update) =>{
      if (update.success == 1) {
        this.spinner.hide();
        this.dialog.open(MensajeEmergentesComponent, {data: `Entrada agregada exitosamente`})
          .afterClosed()
          .subscribe((cerrarDialogo: Boolean) => {
          if (cerrarDialogo) {
          } else {
          }
          }); 
        } else {
          this.toastr.error(update.message, 'Error', {
            positionClass: 'toast-bottom-left',
          });
        }
      }});     
}

infoCategoria(event: number) {
  this.idCategoria = event;
}

cerrarDialogo(): void {
  this.dialogo.close(true);
}

}
