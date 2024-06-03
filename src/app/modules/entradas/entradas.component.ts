import { DatePipe } from '@angular/common'; //para obtener fecha del sistema
import { Component, OnInit} from '@angular/core';
//import { Producto } from '../../models/producto';
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
import { AuthService } from '../../service/auth.service';
import { EntradasService } from '../../service/entradas.service';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from "ngx-spinner";
import { forkJoin } from 'rxjs';
import { GimnasioService } from "../../service/gimnasio.service";

interface Producto {
  idProbob: number;
  descripcion: string;
  marca: string;
  detalleCompra: string;
}
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
  selector: 'app-entradas',
  templateUrl: './entradas.component.html',
  styleUrls: ['./entradas.component.css'],
  providers: [DatePipe],
})
export class EntradasComponent implements OnInit {
  hide = true;
  form: FormGroup;
  matcher = new MyErrorStateMatcher();
  ubicacion: string; 
  id: number; 
  idUsuario: number;
  fechaRegistro: string; 
  listaProductos: any;
  listaProducto: Producto[] = [];
  idProducto: number = 0;
  message: string = '';
  listaProveedores: any;
  idProveedor: number = 0;
  currentUser: string = '';
  idGym: number = 0;
  tablaDatos: any[] = [];
  isLoading: boolean = true; 
  habilitarBoton: boolean = false;
  private fotoUrl: string | null = null;

  constructor(
   // public dialogo: MatDialogRef<EntradasComponent>,
    //@Inject(MAT_DIALOG_DATA) public mensaje: string,
    private fb: FormBuilder,
    private auth: AuthService,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private entrada: EntradasService,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private GimnasioService: GimnasioService
  ) {
    this.obtenerFoto();
    this.ubicacion = this.auth.nombreGym.getValue();
    this.id = this.auth.idGym.getValue();
    this.idUsuario = this.auth.idUser.getValue();
    this.fechaRegistro = this.obtenerFechaActual();
    this.form = this.fb.group({
      idGym: [this.id],
      idProbob: ['', Validators.compose([Validators.required])],
      idProveedor: [1],
      idUsuario: [this.idUsuario],
      fechaEntrada: [this.fechaRegistro],
      exis: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9]+$/), //solo numeros enteros
        ]),
      ],
      precciosucu: [
        '',
        Validators.compose([
          Validators.required, Validators.pattern(/^\d+(\.\d{0,2})?$/), //solo acepta dos decimales
        ]),
      ],
      precioCaja: [
        '',
        Validators.compose([
          Validators.required, Validators.pattern(/^\d+(\.\d{0,2})?$/), //solo acepta dos decimales
        ]),
      ],
    });
  }

  handleEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault(); // Evitar que el navegador envíe el formulario
    }
  }
  
  ngOnInit(): void {
    // this.entrada.comprobar();
    this.auth.comprobar().subscribe((respuesta)=>{ 
      this.habilitarBoton = respuesta.status;
    });

    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }
    this.auth.idGym.subscribe((data) => {
      if(data) {
        this.idGym = data;
        this.listaTablas();
      }
    });
    this.loadData();
    this.buscarProducto();
  }

  loadData() {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  getSSdata(data: any){
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
          this.auth.role.next(resultData.rolUser);
          this.auth.idUser.next(resultData.clave);
          this.auth.idGym.next(resultData.idGym);
          this.auth.nombreGym.next(resultData.nombreGym);
          this.auth.email.next(resultData.email);
          this.auth.encryptedMail.next(resultData.encryptedMail);
      }, error: (error) => { console.log(error); }
    });
  }

  listaTablas(){
    this.entrada.listaProductos().subscribe({
      next: (resultData) => {
        this.listaProductos = resultData.productos;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  filteredProducto: any[] = [];
  productoss: any[] = [];

  buscarProducto() {
    const marcaIngresado = this.form.get('idProbob')?.value;
    this.entrada.listaProductos().subscribe({
      next: (respuesta) => {
        const marcasU = new Set(
          respuesta.productos.map((product: any) => ({
            idProd: product.idProbob,
            nombre: `${product.descripcion} ${product.marca} ${product.detalleCompra}`
          }))
        );
        this.productoss = Array.from(marcasU);
        this.filteredProducto = this.productoss.filter(
          (product) =>
            !marcaIngresado ||
            product.nombre.toLowerCase().includes(marcaIngresado.toLowerCase())
        );
      }
    });
  }


  displayFn(product: any): string {
   
    return product && product.nombre ? product.nombre : '';
  }

  onProductSelected(product: any) {
    this.infoProducto(product.idProd);
    
  }

  infoProducto(event: number) {
    this.idProducto = event;
  }

  obtenerFechaActual(): string {
    const fechaActual = new Date();
    return this.datePipe.transform(fechaActual, 'yyyy-MM-dd') || '';
  }

  limpiarFormulario(): void {
    this.form.reset();
  }

  agregarATabla() {
    if (this.form.valid) { 
      this.form.get('idProbob')?.setValue(this.form.value.idProbob.idProd);
    if (this.form && this.form.get('idProbob') && this.form.get('exis')) {
      const idProductoSeleccionado = this.form.get('idProbob')!.value;
      const idPrecioVenta = this.form.get('precciosucu')!.value;
      const idPrecioCompra = this.form.get('precioCaja')!.value;
      const productoSeleccionado = this.listaProductos.find((producto: any) => producto.idProbob === idProductoSeleccionado);
     /*solo sirve para mostrar fecha*/
      const fechaActual = new Date();
      const año = fechaActual.getFullYear();
      const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
      const día = String(fechaActual.getDate()).padStart(2, '0');
      const fechaFormateada = `${año}-${mes}-${día}`;

      if (productoSeleccionado) {
        const indiceProducto = this.tablaDatos.findIndex(item => item.id_Probob === idProductoSeleccionado);
        if (indiceProducto !== -1) {
          // Si el producto ya está en la tabla, actualiza la cantidad
          this.tablaDatos[indiceProducto].exis += this.form.get('exis')!.value;
         
        } else {
          const nuevoDato = {
            id_Probob: idProductoSeleccionado,  
            descripcion: productoSeleccionado.descripcion,
            marca:productoSeleccionado.marca,
            detalle:productoSeleccionado.detalleCompra,
            exis: this.form.get('exis')!.value,
            fechaEntrada: fechaFormateada,
            valor: this.auth.idGym.getValue(),
            precioCaja: idPrecioCompra,
            preccio: 0,
            fechaE: "0000-00-00",
            precciosucu: idPrecioVenta
          };
          this.tablaDatos.push(nuevoDato);
        }
        this.form.reset();
      } else {
        console.warn('Producto no encontrado en listaProductos');
      }
    }}else{
      this.message = 'Por favor, complete todos los campos requeridos.';
      this.marcarCamposInvalidos(this.form);
    }
  }
  
  registrar(): any {
    if (this.tablaDatos.length > 0) {
      this.spinner.show();
      const dataToSend: any[] = this.tablaDatos;
      const registrosParaEnviar: any[] = [];
      const registrosAc: any[] = [];
      let hayRegistrosNuevos = false;
      let hayRegistrosParaEditar = false;
      let update: any[] = [];
      const verificaciones = dataToSend.map((item) =>
        this.entrada.verficarProducto(this.auth.idGym.getValue(), item.id_Probob)
      );
      forkJoin(verificaciones).subscribe((results) => {
        results.forEach((data, index) => {
          const id_Probob = dataToSend[index].id_Probob;
          if (data.success === 0) {
            // Producto no existe, agregar a registrosParaEnviar
            const fechaActual: Date = new Date();
            const dia: string = fechaActual.getDate().toString().padStart(2, "0");
            const mes: string = (fechaActual.getMonth() + 1)
              .toString()
              .padStart(2, "0");
            const año: string = fechaActual.getFullYear().toString();
            const fechaFormateada: string = `${año}-${mes}-${dia}`;
            registrosParaEnviar.push({
              exis: dataToSend[index].exis,
              precioCaja: dataToSend[index].precioCaja,
              precciosucu: dataToSend[index].precciosucu,
              preccio: dataToSend[index].preccio,
              id_Probob: id_Probob,
              valor: dataToSend[index].valor,
              fechaE: dataToSend[index].fechaE,
              fechaEntrada: dataToSend[index].fechaEntrada,
              accion: "Registro de nuevo producto",
              fecha_actu: fechaFormateada
            });
            hayRegistrosNuevos = true;
          } else if (data.success === 1) {
            hayRegistrosParaEditar = true;
            const fechaActual: Date = new Date();
            const dia: string = fechaActual.getDate().toString().padStart(2, "0");
            const mes: string = (fechaActual.getMonth() + 1)
              .toString()
              .padStart(2, "0");
            const año: string = fechaActual.getFullYear().toString();
            const fechaFormateada: string = `${año}-${mes}-${dia}`;
    
            registrosAc.push({
              accion: "Edición de nuevo producto",
              fecha_actu: fechaFormateada,
              existencias: dataToSend[index].exis,
              p_id_producto: id_Probob,
              precioSucursal: dataToSend[index].precciosucu,
              precioCaja: dataToSend[index].precioCaja,
              p_id_bodega: this.auth.idGym.getValue(),
              ultimo_id: data.idBodPro,
            });
          }
        });
        // Procesamos los registros después de recibir todas las respuestas
        if (hayRegistrosNuevos) {
          this.enviarRegistros(registrosParaEnviar);

        }
        if (hayRegistrosParaEditar) {
          this.actualizarReg(registrosAc);
        }
      });
    } else {
      this.toastr.error("Agrega algo a la tabla antes de enviar", "Error", {
        positionClass: "toast-bottom-left",
      });
      this.message = "Por favor, complete todos los campos requeridos.";
      this.marcarCamposInvalidos(this.form);
    }    
  }
  
  enviarRegistros(registrosParaEnviar: any[]) {
    this.entrada.agregarEntradaProducto(registrosParaEnviar).subscribe({
      next: (respuesta) => {
        if (respuesta.success == 1) {
          this.spinner.hide();
          this.dialog
            .open(MensajeEmergentesComponent, {
              data: `Entrada agregada exitosamente`,
            })
            .afterClosed()
            .subscribe((cerrarDialogo: Boolean) => {
              if (cerrarDialogo) {
                this.form.reset();
                this.tablaDatos = [];
              }
            });
            this.imprimirResumen();
        } else {
          this.toastr.error(respuesta.message, 'Error', {
            positionClass: 'toast-bottom-left',
          });
        }
      },
      error: (paramError) => {
        console.error(paramError);
        this.toastr.error(paramError.error.message, 'Error', {
          positionClass: 'toast-bottom-left',
        });
      },
    });
  }

  actualizarReg(registrosAc: any[]){
    this.entrada.actualizarProducto(registrosAc).subscribe({
      next: (update) => {
        if (update.success == 1) {
          this.spinner.hide();
          this.dialog
            .open(MensajeEmergentesComponent, {
              data: `Entrada agregada exitosamente`,
            })
            .afterClosed()
            .subscribe((cerrarDialogo: Boolean) => {
              if (cerrarDialogo) {
                this.form.reset();
                this.tablaDatos = [];
              } else {
              }
            });
            this.imprimirResumen();
        } else {
          this.toastr.error(update.message, "Error", {
            positionClass: "toast-bottom-left",
          });
        }
      },
    });
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

  cerrarDialogo(): void { 
  }
 
  obtenerFoto() {
    this.GimnasioService.consultarFoto(this.auth.idGym.getValue()).subscribe(
      respuesta => {
        if (respuesta && respuesta[0] && respuesta[0].foto) {
          let fotoUrl = respuesta[0].foto;
          // Añadir el esquema si no está presente
          if (!/^https?:\/\//i.test(fotoUrl)) {
            fotoUrl = 'https://' + fotoUrl;
          }
          this.fotoUrl = fotoUrl;
        }
      },
      error => {
        console.error('Error al obtener la foto:', error);
        this.fotoUrl = null;
      }
    );
  }
  

  imprimirResumen() {
    const fechaActual = new Date().toLocaleDateString();
    const horaActual = new Date().toLocaleTimeString();
  
    // Calcular el total de cantidad y el total de precio
    let totalCantidad = 0;
    let totalPrecio = 0;

    const ventanaImpresion = window.open("", "_blank");
    if (ventanaImpresion) {
      ventanaImpresion.document.open();
      ventanaImpresion.document.write(`
        <html>
          <head>
          ${this.fotoUrl ? `<img class="logo" src="${this.fotoUrl}" alt="Logo">` : ''}
            <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .resumen {
              width: 80%;
              max-width: 600px;
              margin: 20px auto;
              background-color: #fff;
              border-radius: 4px;
              padding: 20px;
            }
            h1 {
              text-align: center;
              color: #333;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              padding: 8px;
              border-bottom: 1px solid #ddd;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .fecha-hora {
              display: flex;
              justify-content: space-between;
            }
            .logo {
              display: block;
              margin: 0 auto 20px;
              max-width: 150px;
              width: 100%;
              height: auto;
            }
          </style>
          </head>
          <body>
            <div class="resumen">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio de compra</th>
                    <th>Total</th>
                    <!-- Agrega más columnas según sea necesario -->
                  </tr>
                </thead>
                <tbody>
                  ${this.tablaDatos
                    .map(
                      (fila) => {
                        // Calcular el total para cada fila
                        const totalFila = fila.exis * fila.precioCaja;
                        // Agregar el total de la fila al total general
                        totalCantidad += fila.exis;
                        totalPrecio += totalFila;
                        // Generar la fila de la tabla
                        return `
                          <tr>
                            <td>${fila.descripcion} ${fila.marca}_${fila.detalle}</td>
                            <td>${fila.exis}</td>
                            <td>$${fila.precioCaja.toFixed(2)}</td>
                            <td>$${totalFila.toFixed(2)}</td>
                          </tr>
                        `;
                      }
                    )
                    .join('')}
                </tbody>
              </table>
              <p style="text-align: left;">Precio total de compra: $${totalPrecio.toFixed(2)}</p>
              <div class="fecha-hora">
                <p>Fecha: ${fechaActual}</p> <!-- Fecha -->
                <p>Hora: ${horaActual}</p> <!-- Hora -->
              </div>
            </div>
          </body>
        </html>
      `);
      ventanaImpresion.document.close();
      // Esperar a que la imagen se cargue antes de imprimir
      const image: HTMLImageElement | null = ventanaImpresion.document.querySelector('img');
      if (image) {
        image.onload = () => {
          ventanaImpresion.print();
          ventanaImpresion.close();
        };

        image.onerror = (error) => {
          console.error('Error al cargar la imagen:', error);
          ventanaImpresion.print();
          ventanaImpresion.close();
        };
      } else {
        ventanaImpresion.print();
        ventanaImpresion.close();
      }
    }
  }

  quitarArchivo(index: number): void {
    this.tablaDatos.splice(index, 1);
  }
}
