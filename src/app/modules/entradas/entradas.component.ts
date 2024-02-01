import { DatePipe } from '@angular/common'; //para obtener fecha del sistema
import { Component, OnInit, HostListener, Inject} from '@angular/core';
import { Producto } from 'src/app/models/producto';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/service/auth.service';
import { EntradasService } from 'src/app/service/entradas.service';
import { ProveedorService } from 'src/app/service/proveedor.service';
import { MensajeEmergenteComponent } from '../mensaje-emergente/mensaje-emergente.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EntradaProducto } from 'src/app/models/entradas';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

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

/**
 * DEBES COLOCAR EL Providers o no se visualizan los input del formulario
 */
@Component({
  selector: 'app-entradas',
  templateUrl: './entradas.component.html',
  styleUrls: ['./entradas.component.css'],
  providers: [DatePipe],
})
export class EntradasComponent implements OnInit {
  hide = true;
  form: FormGroup;
  matcher = new MyErrorStateMatcher();
  ubicacion: string; //nombre del gym
  id: number; // id gym
  idUsuario: number;
  fechaRegistro: string; //fecha de ingreso del producto
  //Variables para guardar las lista de productos
  listaProductos: any;
  listaProducto: Producto[] = [];
  idProducto: number = 0;
 

  //guardar lista proveedores y id
  listaProveedores: any;
  idProveedor: number = 0;

  constructor(

    public dialogo: MatDialogRef<EntradasComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string,

    private fb: FormBuilder,
    private auth: AuthService,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private entrada: EntradasService,
    private proveedor: ProveedorService,
    private dialog: MatDialog,
    private router:Router,
  ) {
    this.ubicacion = this.auth.nombreGym.getValue();
    this.id = this.auth.idGym.getValue();
    this.idUsuario = this.auth.userId.getValue();
    this.fechaRegistro = this.obtenerFechaActual();

    this.form = this.fb.group({
      idGym: [this.id],
      idProducto: ['', Validators.compose([Validators.required])],
      idProveedor: [1],
      idUsuario: [this.idUsuario],
      fechaEntrada: [this.fechaRegistro],
      cantidad: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9]+$/), //solo numeros enteros
        ]),
      ],
      precioVenta: [
        '',
        Validators.compose([
          Validators.required, Validators.pattern(/^\d+(\.\d{0,2})?$/), //solo acepta dos decimales
        ]),
      ],
      precioCompra: [
        '',
        Validators.compose([
          Validators.required, Validators.pattern(/^\d+(\.\d{0,2})?$/), //solo acepta dos decimales
        ]),
      ],
    });
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent): void {
    if (this.form.valid) {
    // Verifica que el evento se produzca dentro del formulario antes de agregar a la tabla
    if (event.target && (event.target as HTMLElement).closest('form')) {
      this.agregarATabla();
      event.preventDefault(); // Evita la acción predeterminada del Enter
    }}
  }
  /**
   * Llenar los mat select
   */
  ngOnInit(): void {
    //Traer la lista de productos para mat select
    this.entrada.listaProductos().subscribe({
      next: (resultData) => {
        console.log(resultData);
        this.listaProductos = resultData;
      },
      error: (error) => {
        console.error(error);
      },
    });

    //lista de proveedores mat select
    this.proveedor.obternerProveedor().subscribe({
      next: (resulData) => {
        console.log(resulData);
        // Transformar los nombres de propiedades para poder mostrar en mat select (no acepta espacios)
        if (Array.isArray(resulData)) {
          this.listaProveedores = resulData.map((proveedor: { [x: string]: any }) => {
            return {
              ...proveedor,
              nombreEmpresa: proveedor['razon social'],
            };
          });
        } else {
          console.error('resulData is not an array.');
        }
        
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  /**
   * Metodo que se invoca cada que selecionas una opcion del select
   * @param event
   */
  infoProducto(event: number) {
    console.log('Opción seleccionada:', event);
    this.idProducto = event;
  }

  /**
   * Metodo que se invoca cada que selecionas una opcion del select
   * @param event
   */
  infoProveedor(event: number) {
    console.log('Opción seleccionada proveedor:', event);
    this.idProveedor = event;
  }

  obtenerFechaActual(): string {
    const fechaActual = new Date();
    return this.datePipe.transform(fechaActual, 'yyyy-MM-dd') || '';
  }

  // Función para limpiar el formulario
  limpiarFormulario(): void {
    this.form.reset();
    
  }


  tablaDatos: any[] = [];
  

  agregarATabla() {

    console.log("hola");
    // Verificar si el formulario y sus controles no son nulos
    if (this.form && this.form.get('idProducto') && this.form.get('idProveedor') && this.form.get('cantidad')) {
      console.log("hola2");
      const idProductoSeleccionado = this.form.get('idProducto')!.value;
      console.log('ID Producto Seleccionado:', idProductoSeleccionado);
      const idPrecioVenta = this.form.get('precioVenta')!.value;
      console.log('ID idPrecioVenta Seleccionado:', idPrecioVenta);
      const idPrecioCompra = this.form.get('precioCompra')!.value;
      
      
      console.log('Lista de Productos:', this.listaProductos);
      const productoSeleccionado = this.listaProductos.find((producto: any) => producto.idProducto === idProductoSeleccionado);
  
      console.log('Producto Seleccionado:', productoSeleccionado);
  
      const fechaActual = new Date();
      const año = fechaActual.getFullYear();
      const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
      const día = String(fechaActual.getDate()).padStart(2, '0');
  
      const fechaFormateada = `${año}-${mes}-${día}`;
  
      if (productoSeleccionado) {
        // Verificar si el producto ya está en la tabla
        const indiceProducto = this.tablaDatos.findIndex(item => item.Producto_idProducto === idProductoSeleccionado);
  
        if (indiceProducto !== -1) {
          // Si el producto ya está en la tabla, actualiza la cantidad
          this.tablaDatos[indiceProducto].cantidad += this.form.get('cantidad')!.value;
        } else {
          // Si el producto no está en la tabla, agrégalo
          const nuevoDato = {
            Producto_idProducto: idProductoSeleccionado,  // Asegúrate de tener esta propiedad en tu objeto dato
            nombreProducto: productoSeleccionado.nombre,
            Proveedor_idProveedor: 1,
            cantidad: this.form.get('cantidad')!.value,
            fechaEntrada: fechaFormateada,
            //Gimnasio_idGimnasio: this.id,
            Gimnasio_idGimnasio: 1,
            Usuarios_idUsuarios: 1,
            //Usuarios_idUsuarios: this.idUsuario,
            precioCompra: idPrecioCompra,
            precioVenta: idPrecioVenta
            // Otras propiedades según tus campos
          };
    
          this.tablaDatos.push(nuevoDato);
        }
  
        this.form.reset(); // Puedes reiniciar el formulario después de agregar los datos
      } else {
        console.warn('Producto no encontrado en listaProductos');
      }
    }
  }
  

  // tu-componente.component.ts

 
  registrar(): any {
    console.log(this.tablaDatos, "dataToSend");
  
    if (this.tablaDatos.length > 0) {
    
      const dataToSend: any[] = this.tablaDatos;
      console.log(dataToSend, "dataToSend");
      
      this.entrada.agregarEntradaProducto(dataToSend).subscribe({
        next: (respuesta) => {
          console.log(respuesta, "esta es la respuesta");
  
          if (respuesta.success) {
            this.dialog
              .open(MensajeEmergenteComponent, {
                data: `Entrada agregada exitosamente`,
              })
              .afterClosed()
              .subscribe((cerrarDialogo: Boolean) => {
                if (cerrarDialogo) {
                  this.router.navigateByUrl('/admin/home');
                } else {
                }
              });
            this.limpiarFormulario();
          } else {
            this.toastr.error(respuesta.message, 'Error', {
              positionClass: 'toast-bottom-left',
            });
          }
        },
        error: (paramError) => {
          console.error(paramError); // Muestra el error del API en la consola para diagnóstico
          // accedemos al atributo error y al key
          this.toastr.error(paramError.error.message, 'Error', {
            positionClass: 'toast-bottom-left',
          });
        },
      });
    } else {
      this.toastr.error('Completa el formulario', 'Error', {
        positionClass: 'toast-bottom-left',
      });
    }
  }


  cerrarDialogo(): void {
    this.dialogo.close(true);
  }
 
}
