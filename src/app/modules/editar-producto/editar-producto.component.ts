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
import { inventarioService } from '../../service/inventario.service';

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
  editarProd: any;

  esServicio: boolean = false;

  idUser: any;
  correooo: any;

  usuario: any; // Almacenar datos del usuario
  clave: string | undefined; // Clave específica


  constructor( public dialogo: MatDialogRef<EditarProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb:FormBuilder,
    private toastr: ToastrService,
    private entrada: EntradasService,
    private productoService:ProductoService,
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService,
    private auth:AuthService,
    public dialog: MatDialog,
    public inventarioService: inventarioService){

    this.idProducto = data.idProducto;

    this.inventarioService.obtenerProductoPorIdYIdBodega(this.idProducto, this.auth.idGym.getValue()).subscribe(
      respuesta=>{
        this.editarProd = respuesta;
        console.log('editarProd: ', this.editarProd);


        // Imprimir en consola el nombre de la categoría
        // console.log('Nombre de la categoría:', this.editarProd[0]?.nombreCategoria);


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

         // Deshabilitar el campo y ocultar precioCaja si la categoría es "Servicios"
         if (this.editarProd[0]?.nombreCategoria === 'Servicios') {
          // this.form.get('codigoBarra')?.disable();
          this.esServicio = true;
        }

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
    // this.currentUser = this.auth.getCurrentUser();
    // if(this.currentUser){
    //   this.getSSdata(JSON.stringify(this.currentUser));
    // }

    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
    });

    // this.idUser = this.auth.idUser.getValue();
    // console.log('idUser: ', this.idUser);


    this.correooo = this.auth.email.getValue();
    console.log('correoo: ', this.correooo);

    this.auth.getUsuario(this.correooo).subscribe({
      next: (response) => {
        console.log('response: ', response);

        this.usuario = response[0];
        this.clave = this.usuario.clave;
        console.log('Usuario:', this.usuario);
        console.log('Clave:', this.clave);
      },
      error: (err) => {
        console.error('Error al obtener datos del usuario:', err);
      }
    });
  }

  // getSSdata(data: any){
  //   this.auth.dataUser(data).subscribe({
  //     next: (resultData) => {

  //       this.auth.loggedIn.next(true);
  //         this.auth.role.next(resultData.rolUser);
  //         this.auth.idUser.next(resultData.id);
  //         this.auth.idGym.next(resultData.idGym);
  //         this.auth.nombreGym.next(resultData.nombreGym);
  //         this.auth.email.next(resultData.email);
  //         this.auth.encryptedMail.next(resultData.encryptedMail);
  //     }, error: (error) => { console.log(error); }
  //   });
  // }

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
      existencias:this.form.value.existencia,
      precioSucursal:this.form.value.precioSucursal,
      precioCaja:this.form.value.precioCaja,
      accion: "Edición de producto",
      fecha_actu: fechaFormateada,
      p_id_producto: this.form.value.idProbob,
      codigoB: this.form.value.codigoBarra,
      p_id_bodega: this.form.value.id_bodega,
      mail_actualizador: this.clave,
    }

    const dataArray = [data];
    console.log('Datos a enviar: ', dataArray);

    this.entrada.actualizarProductoEInsertarHistorial(dataArray).subscribe({next: (update) =>{
      console.log('Update: ', update);

      if (update.success == 1) {
        // console.log('Update: ', update);

        this.spinner.hide();
        this.dialog.open(MensajeEmergentesComponent, {data: `Producto actualizado exitosamente`})
          .afterClosed()
          .subscribe((cerrarDialogo: Boolean) => {
          if (cerrarDialogo) {
            this.dialogo.close();

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
