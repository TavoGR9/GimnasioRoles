import { Component, OnInit, Inject, EventEmitter, Output } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { PagoMembresiaEfectivoService } from "../../service/pago-membresia-efectivo.service";
import { MensajeEmergenteComponent } from "../mensaje-emergente/mensaje-emergente.component";
import { ToastrService } from "ngx-toastr";
import { GimnasioService } from "../../service/gimnasio.service";
import { AuthService } from "../../service/auth.service";
import { NgxSpinnerService } from "ngx-spinner";
import { MensajeAceptarComponent } from "../mensaje-aceptar/mensaje-aceptar.component";
import { MatDialogConfig } from "@angular/material/dialog";

// PARA LLAMAR PRODUCTOS EN LUGAR DE MEMBRESIAS
import { ProductoService } from "../../service/producto.service";
import { tap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";


@Component({
  selector: "app-form-pago-emergente",
  templateUrl: "./form-pago-emergente.component.html",
  styleUrls: ["./form-pago-emergente.component.css"],
})
export class FormPagoEmergenteComponent implements OnInit {
  idSucursal: number = 0;
  membresias: any[] = [];
  membresiaSeleccionada: any;
  precioSeleccionado: any;
  idMembresiaSelec: any;
  nombreMembresia: any;
  precio: any;
  duracion: number = 0;
  moneyRecibido: number = 0;
  fechaDeInicio: Date | null = null;
  fechaDeFin: Date | null = null;
  ticketInfo: any;
  @Output() actualizarTablas = new EventEmitter<boolean>();

  // PARA REEMPLAZAR MEMBRESIAS POR PRODUCTOS
  productos: any[] = []; //Llamar productos en lugar de membresias
  productosFiltrados: any[] = []; // Esta será la lista filtrada de productos para la categoría "servicios"
  membresiaProdSeleccionada: any; // Seleccionar producto tipo membresia
  nombreMembresiaProd: any; // Nombre del producto tipo membresia
  precioSucursal: any; // Precio del producto tipo membresia
  duracionMem: number = 0; // Duracion del producto tipo membresia
  idProductobod: number = 0; // id del idProbob
  moneyRecibidoProd: number = 0; // Pago del producto tipo membresia
  message: string = ""; // messages
  serviceForm!: FormGroup; // formulario reactivo

  constructor(
    private toastr: ToastrService,
    private auth: AuthService,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private GimnasioService: GimnasioService,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private membresiaService: PagoMembresiaEfectivoService,
    public dialogo: MatDialogRef<FormPagoEmergenteComponent>,
    // PARA REEMPLAZAR MEMBRESIAS POR PRODUCTOS
    private productoService: ProductoService,
    private form: FormBuilder
  ) {
    this.obtenerFoto();

    // PARA REEMPLAZAR MEMBRESIAS POR PRODUCTOS
    this.serviceForm = this.form.group({
      id_pedidos: [0],
      membresiaProdSeleccionada: ["", Validators.required],
      Gimnasio_idGimnasio: [this.auth.idGym.value, Validators.required],
      created_by: [this.auth.idUser.getValue()],
    });
  }

  private fotoUrl: string | null = null;

  ngOnInit(): void {
    this.getIdGym();

    this.precio = 0;
    // this.getMembresiasLista(this.data.idSucursal);

    // if (this.data) {
    //   this.membresiaSeleccionada = this.data.idMem;
    //   console.log('Membresia seleccionada: ', this.membresiaSeleccionada);

    //   this.precio = this.data.precio !== "null" ? this.data.precio : "N/A";
    //   this.duracion =
    //     this.data.duracion !== "null" ? this.data.duracion : "N/A";

    // }

    // PARA REEMPLAZAR MEMBRESIAS POR PRODUCTOS
    this.getProductosLista(this.data.idSucursal);

    if (this.data) {
      this.membresiaProdSeleccionada = this.data.idProbob;

      this.precioSucursal = this.data.precioSucursal !== "null" ? this.data.precioSucursal : "N/A";
    }
  }

  getIdGym() {
    this.auth.idGym.subscribe((respuesta) => {
      this.idSucursal = respuesta;
    });
  }

  // getMembresiasLista(idgimnasio: number): void {
  //   this.membresiaService.membresiasLista(idgimnasio).subscribe(
  //     (data) => {
  //       this.membresias = data;
  //       console.log('LISTA: ', this.membresias);

  //     },
  //     (error) => {
  //       console.error("Error al obtener la lista de membresías:", error);
  //     }
  //   );
  // }

  // onMembresiaChange(): void {
  //   this.membresiaService
  //     .membresiasInfo(this.membresiaSeleccionada)
  //     .subscribe((resultado) => {
  //       this.duracion = resultado.Duracion;
  //       this.precio = `${resultado.Precio}`;
  //       this.nombreMembresia = `${resultado.Membresia}`;
  //     });
  // }

  cancelDialogo(): void {
    this.dialogo.close(true);
  }

  convertirNumeroAPalabrasPesos(numero: number): string {
    const unidades = [
      "CERO",
      "UN",
      "DOS",
      "TRES",
      "CUATRO",
      "CINCO",
      "SEIS",
      "SIETE",
      "OCHO",
      "NUEVE",
    ];
    const decenas = [
      "DIEZ",
      "ONCE",
      "DOCE",
      "TRECE",
      "CATORCE",
      "QUINCE",
      "DIECISEIS",
      "DIECISIETE",
      "DIECIOCHO",
      "DIECINUEVE",
    ];
    const decenasCompuestas = [
      "VEINTE",
      "TREINTA",
      "CUARENTA",
      "CINCUENTA",
      "SESENTA",
      "SETENTA",
      "OCHENTA",
      "NOVENTA",
    ];
    const centenas = [
      "CIENTO",
      "DOSCIENTOS",
      "TRESCIENTOS",
      "CUATROCIENTOS",
      "QUINIENTOS",
      "SEISCIENTOS",
      "SETECIENTOS",
      "OCHOCIENTOS",
      "NOVECIENTOS",
    ];

    const decimales = [
      "CERO",
      "UN",
      "DOS",
      "TRES",
      "CUATRO",
      "CINCO",
      "SEIS",
      "SIETE",
      "OCHO",
      "NUEVE",
    ];

    const miles = "MIL";
    const millones = "MILLÓN";
    const millonesPlural = "MILLONES";

    let palabras = "";
    const entero = Math.floor(numero);
    const decimal = Math.round((numero - entero) * 100); // Obtiene los dos decimales

    if (numero === 0) {
      palabras = "CERO";
    } else if (numero < 10) {
      palabras = unidades[numero];
    } else if (numero < 20) {
      palabras = decenas[numero - 10];
    } else if (numero < 100) {
      palabras = decenasCompuestas[Math.floor(numero / 10) - 2];
      if (numero % 10 !== 0) palabras += ` Y ${unidades[numero % 10]}`;
    } else if (numero < 1000) {
      palabras = centenas[Math.floor(numero / 100) - 1];
      if (numero % 100 !== 0)
        palabras += ` ${this.convertirNumeroAPalabrasPesos(numero % 100)}`;
    } else if (numero < 10000) {
      palabras = unidades[Math.floor(numero / 1000)] + ` ${miles}`;
      if (numero % 1000 !== 0)
        palabras += ` ${this.convertirNumeroAPalabrasPesos(numero % 1000)}`;
    } else if (numero < 1000000) {
      palabras =
        this.convertirNumeroAPalabrasPesos(Math.floor(numero / 1000)) +
        ` ${miles}`;
      if (numero % 1000 !== 0)
        palabras += ` ${this.convertirNumeroAPalabrasPesos(numero % 1000)}`;
    } else {
      palabras = "Número demasiado grande";
    }

    return palabras;
  }

  obtenerFoto() {
    this.GimnasioService.consultarFoto(this.auth.idGym.getValue()).subscribe(
      (respuesta) => {
        if (respuesta && respuesta[0] && respuesta[0].foto) {
          let fotoUrl = respuesta[0].foto;
          // Añadir el esquema si no está presente
          if (!/^https?:\/\//i.test(fotoUrl)) {
            fotoUrl = "https://" + fotoUrl;
          }
          this.fotoUrl = fotoUrl;
        }
      },
      (error) => {
        console.error("Error al obtener la foto:", error);
        this.fotoUrl = null;
      }
    );
  }

  // imprimirResumen() {
  //   if (this.precio <= this.moneyRecibido) {
  //     const PrecioCalcular = this.moneyRecibido - this.precio;
  //     this.membresiaService
  //       .ticketPagoInfo(this.data.idCliente)
  //       .subscribe((respuesta) => {
  //         if (respuesta && respuesta.length > 0) {
  //           const ticketInfo = respuesta[0];
  //           const totalEnPesos = this.convertirNumeroAPalabrasPesos(
  //             this.precio
  //           );
  //           const totalEnPesosRecibido = this.convertirNumeroAPalabrasPesos(
  //             this.moneyRecibido
  //           );
  //           const totalEnPesosCambio =
  //             this.convertirNumeroAPalabrasPesos(PrecioCalcular);
  //           const ventanaImpresion = window.open("", "_blank");
  //           const fechaActual = new Date().toLocaleDateString("es-MX"); // Obtener solo la fecha en formato local de México
  //           const horaActual = new Date().toLocaleTimeString("es-MX", {
  //             hour: "2-digit",
  //             minute: "2-digit",
  //           }); // Obtener solo la hora en formato local de México
  //           if (ventanaImpresion) {
  //             ventanaImpresion.document.open();
  //             ventanaImpresion.document.write(`
  //             <html>
  //               <head>
  //                 <style>
  //                   body {
  //                     font-family: 'Arial', sans-serif;
  //                     margin: 0;
  //                     padding: 0;
  //                     background-color: #f5f5f5;
  //                   }
  //                   .ticket {
  //                     width: 80%;
  //                     max-width: 600px;
  //                     margin: 20px auto;
  //                     background-color: #fff;
  //                     border-radius: 4px;
  //                     padding: 20px;
  //                   }

  //                   h1 {
  //                     text-align: center;
  //                     color: #333;
  //                     margin-bottom: 20px;
  //                   }
  //                   table {
  //                     width: 100%;
  //                     border-collapse: collapse;
  //                     margin-bottom: 20px;
  //                   }
  //                   th, td {
  //                     padding: 8px;
  //                     border-bottom: 1px solid #ddd;
  //                     text-align: left;
  //                   }
  //                   th {
  //                     background-color: #f2f2f2;
  //                   }
  //                   .total {
  //                     text-align: right;
  //                     margin-top: 20px;
  //                     font-weight: bold;
  //                   }
  //                   .total p {
  //                     margin: 5px 0;
  //                     font-size: 1.1em;
  //                   }
  //                   hr {
  //                     border: none;
  //                     border-top: 1px dashed #ccc;
  //                     margin: 20px 0;
  //                   }
  //                   .brand {
  //                     text-align: center;
  //                     color: #888;
  //                     font-size: 20px;
  //                     margin-top: 20px;
  //                   }
  //                   .fecha-hora {
  //                     display: flex;
  //                     justify-content: space-between;
  //                   }
  //                   .logo {
  //                     display: block;
  //                     margin: 0 auto 20px;
  //                     max-width: 150px;
  //                     width: 100%;
  //                     height: auto;
  //                   }
  //                   .direccion{
  //                    font-size: 0.8em;
  //                   text-align: center;
  //                   }
  //                 </style>
  //               </head>
  //               <body>
  //               <div class="ticket">
  //               ${
  //                 this.fotoUrl
  //                   ? `<img class="logo" src="${this.fotoUrl}" alt="Logo">`
  //                   : ""
  //               }
  //               <p class="direccion">${this.auth.nombreGym.getValue()}</p>
  //                   <table>
  //                     <thead>
  //                       <tr>
  //                         <th>Nombre</th>
  //                         <th>Sucursal</th>
  //                         <th>Membresia</th>
  //                         <th>Fecha Inicio</th>
  //                         <th>Fecha Fin</th>
  //                         <th>Total</th>
  //                       </tr>
  //                     </thead>
  //                     <tbody>
  //                           <tr>
  //                             <td>${ticketInfo.Nombre}</td>
  //                             <td>${ticketInfo.Sucursal}</td>
  //                             <td>${ticketInfo.Membresia}</td>
  //                             <td>${ticketInfo.Fecha_Inicio}</td>
  //                             <td>${ticketInfo.Fecha_Fin}</td>
  //                             <td>$${ticketInfo.Precio}</td>
  //                           </tr>
  //                     </tbody>
  //                   </table>
  //                   <hr>
  //                   <div>
  //                     <p>(${totalEnPesos} PESOS)</p>
  //                     <div class="total">
  //                       <p>Total a Pagar: $${this.precio}</p>
  //                     </div>
  //                   </div>
  //                   <div>
  //                     <div class="total">
  //                       <p>Dinero recibido: $${this.moneyRecibido}</p>
  //                       <p>Cambio: $${PrecioCalcular}</p>
  //                     </div>
  //                   </div>
  //                   <div class="fecha-hora">
  //                     <p>Fecha: ${fechaActual}</p> <!-- Fecha -->
  //                     <p>Hora: ${horaActual}</p> <!-- Hora -->
  //                   </div>
  //                   <div class="brand">
  //                     <p>Gracias por su compra</p>
  //                     <p>¡Vuelva pronto!</p>
  //                   </div>
  //                 </div>
  //               </body>
  //             </html>
  //           `);
  //             ventanaImpresion.document.close();

  //             // Esperar a que la imagen se cargue antes de imprimir
  //             const image: HTMLImageElement | null =
  //               ventanaImpresion.document.querySelector("img");
  //             if (image) {
  //               image.onload = () => {
  //                 ventanaImpresion.print();
  //                 ventanaImpresion.close();
  //               };

  //               image.onerror = (error) => {
  //                 console.error("Error al cargar la imagen:", error);
  //                 ventanaImpresion.print();
  //                 ventanaImpresion.close();
  //               };
  //             } else {
  //               ventanaImpresion.print();
  //               ventanaImpresion.close();
  //             }
  //           }
  //         } else {
  //           console.error(
  //             "La respuesta del servicio no contiene los datos necesarios para generar el ticket."
  //           );
  //         }
  //       });
  //   } else {
  //     this.toastr.error("Ingresa el pago");
  //   }
  // }

  // successDialog() {
  //   if (this.moneyRecibido >= this.precio) {
  //   this.spinner.show();
  //   this.onMembresiaChange();
  //   setTimeout(() => {
  //     const dialogConfig = new MatDialogConfig();
  //     dialogConfig.width = "30%"; // Ajusta el ancho del diálogo
  //     dialogConfig.height = "auto"; // Ajusta la altura del diálogo, 'auto' para ajustar según el contenido
  //     dialogConfig.disableClose = true; // Opcional: Deshabilita el cierre del diálogo al hacer clic fuera de él
  //     dialogConfig.data = {
  //       mensaje: `¿Está seguro/a de que desea pagar la membresía seleccionada?`,
  //       cliente: this.data.nombre,
  //       membresia: this.nombreMembresia,
  //     };

  //     this.dialog
  //       .open(MensajeAceptarComponent, dialogConfig)
  //       .afterClosed()
  //       .subscribe((confirmado: boolean) => {
  //         if (confirmado) {
  //           if (this.membresiaSeleccionada != undefined) {
  //               const PrecioCalcular = this.moneyRecibido - this.precio;

  //               if (this.fechaDeInicio && this.fechaDeFin) {
  //                 const añoInicio = this.fechaDeInicio.getFullYear();
  //                 const mesInicio = String(
  //                   this.fechaDeInicio.getMonth() + 1
  //                 ).padStart(2, "0"); // Los meses son indexados desde 0
  //                 const díaInicio = String(
  //                   this.fechaDeInicio.getDate()
  //                 ).padStart(2, "0");
  //                 const fechaFormateada1 = `${añoInicio}-${mesInicio}-${díaInicio}`;

  //                 const añoFin = this.fechaDeInicio.getFullYear();
  //                 const mesFin = String(
  //                   this.fechaDeInicio.getMonth() + 1
  //                 ).padStart(2, "0");
  //                 const díaFin = String(this.fechaDeInicio.getDate()).padStart(
  //                   2,
  //                   "0"
  //                 );
  //                 const fechaFormateada2 = `${añoFin}-${mesFin}-${díaFin}`;
  //                 this.membresiaService
  //                   .actualizacionMemebresia(
  //                     this.data.idCliente,
  //                     this.membresiaSeleccionada,
  //                     fechaFormateada1,
  //                     this.data.detMemID,
  //                     this.precio,
  //                     fechaFormateada2,
  //                     this.auth.idUser.getValue()
  //                   )
  //                   .subscribe((dataResponse: any) => {
  //                     this.spinner.hide();
  //                     this.actualizarTablas.emit(true);
  //                     this.dialogo.close(true);
  //                     this.dialog
  //                       .open(MensajeEmergenteComponent, {
  //                         data: `Pago exitoso, el cambio es de: $${PrecioCalcular}`,
  //                         disableClose: true, // Bloquea el cierre haciendo clic fuera del diálogo
  //                       })
  //                       .afterClosed()
  //                       .subscribe((cerrarDialogo: Boolean) => {
  //                         if (cerrarDialogo) {
  //                           this.imprimirResumen();
  //                         } else {
  //                         }
  //                       });
  //                   });
  //               } else {
  //                 const fechaActual: Date = new Date();
  //                 const year = fechaActual.getFullYear();
  //                 const month = String(fechaActual.getMonth() + 1).padStart(
  //                   2,
  //                   "0"
  //                 );
  //                 const day = String(fechaActual.getDate()).padStart(2, "0");
  //                 const fechaFormateada = `${year}-${month}-${day}`;
  //                 let fechaFin: Date = new Date(fechaActual);
  //                 if (this.duracion == 1) {
  //                 } else if (this.duracion == 30) {
  //                   fechaFin.setMonth(fechaFin.getMonth() + 1);
  //                   if (fechaFin.getMonth() == 0) {
  //                     fechaFin.setFullYear(fechaFin.getFullYear() + 1);
  //                   }
  //                   fechaFin.setDate(fechaFin.getDate() - 1);
  //                 } else {
  //                   this.duracion = Number(this.duracion);
  //                   fechaFin.setDate(fechaFin.getDate() + this.duracion - 1);
  //                 }

  //                 const fechaFormateadaFin: string = fechaFin
  //                   .toISOString()
  //                   .split("T")[0];

  //                 this.membresiaService
  //                   .actualizacionMemebresia(
  //                     this.data.idCliente,
  //                     this.membresiaSeleccionada,
  //                     fechaFormateada,
  //                     this.data.detMemID,
  //                     this.precio,
  //                     fechaFormateadaFin,
  //                     this.auth.idUser.getValue()
  //                   )
  //                   .subscribe((dataResponse: any) => {
  //                     this.spinner.hide();
  //                     this.actualizarTablas.emit(true);

  //                     this.dialogo.close(true);

  //                     this.dialog
  //                       .open(MensajeEmergenteComponent, {
  //                         data: `Pago exitoso, el cambio es de: $${PrecioCalcular}`,
  //                         disableClose: true, // Bloquea el cierre haciendo clic fuera del diálogo
  //                       })
  //                       .afterClosed()
  //                       .subscribe((cerrarDialogo: Boolean) => {
  //                         if (cerrarDialogo) {
  //                           this.imprimirResumen();
  //                         } else {
  //                         }
  //                       });
  //                   });
  //               }
  //           }
  //         } else {
  //           this.spinner.hide();
  //         }
  //       });
  //   }, 2000);
  // } else {
  //   this.spinner.hide();
  //   this.toastr.error(
  //     "Cantidad suficiente para cubrir el costo de esta membresía.",
  //     "¡Error!"
  //   );
  // }
  // }



  // PARA REEMPLAZAR MEMBRESIAS POR PRODUCTOS CON CATEGORIA SERVICIOS
  getProductosLista(idgimnasio: number): void {
    this.productoService.obternerProductos(idgimnasio).subscribe(
      (data) => {
        this.productos = data;
        // Filtrar productos para que solo se incluyan aquellos con categoría "servicios"
        this.productosFiltrados = this.productos.filter(producto => producto.nombreCategoria === 'Servicios');
        console.log('LISTA DE PRODUCTOS FILTRADOS: ', this.productosFiltrados);

      },
      (error) => {
        console.error("Error al obtener la lista de productos: ", error);
      }
    );
  }


  onMembresiaProdChange(): void {
    this.productoService.consultarProductosJ(this.membresiaProdSeleccionada, this.data.idSucursal)
      .subscribe((resultado) => {
        if (resultado && resultado.length > 0) {
          this.precioSucursal = resultado[0].precioSucursal || "N/A";
          this.nombreMembresiaProd = `${resultado[0].nombreProducto + ' - ' + resultado[0].marca}`;
          this.duracionMem = resultado[0].duracion || "N/A";
          this.idProductobod = resultado[0].idProbob;

          // Asigna la duración basada en el nombre del producto
          const nombreProducto = resultado[0].nombreProducto.toLowerCase();
          if (nombreProducto.includes('mensualidad')) {
            this.duracionMem = 30;
          } else if (nombreProducto.includes('anualidad')) {
            this.duracionMem = 365;
          } else if (nombreProducto.includes('quincena')) {
            this.duracionMem = 15;
          } else if (nombreProducto.includes('visita') || nombreProducto.includes('día') || nombreProducto.includes('dia')) {
            this.duracionMem = 1;
          } else {
            this.duracionMem = 0; // Valor predeterminado en caso de no coincidencia
          }
        } else {
          this.precioSucursal = "N/A";
        }
        console.log('Duración del producto seleccionado: ', this.duracionMem);
        console.log('Precio del producto seleccionado: ', this.precioSucursal);
        console.log('idProbob: ', this.idProductobod);

      },
      (error) => {
        console.error("Error al consultar el precio del producto:", error);
        this.precioSucursal = "N/A";
      }
    );
  }

  validarFormulario() {
    if (this.serviceForm.invalid) {
      if (!this.serviceForm.value.membresiaProdSeleccionada || this.serviceForm.value.membresiaProdSeleccionada.length === 0) {
        this.toastr.error('Agregar o seleccionar primero una membresia', 'Error');
      }
      Object.values(this.serviceForm.controls).forEach((control) => {
        control.markAsTouched();
      });
    } else {
      if (this.moneyRecibidoProd >= this.precioSucursal) {
        this.spinner.show();

        setTimeout(() => {
          const dialogConfig = new MatDialogConfig();
          dialogConfig.width = "30%";
          dialogConfig.disableClose = true;
          dialogConfig.data = {
            mensaje: "¿Está seguro/a de que desea pagar la membresía seleccionada?",
            cliente: this.data.nombre,
            membresia: this.nombreMembresiaProd,
          };

          this.dialog.open(MensajeAceptarComponent, dialogConfig)
            .afterClosed()
            .subscribe((confirmado: boolean) => {
              if (confirmado) {
                this.procesarPedido();
              } else {
                this.spinner.hide();
              }
            });
        }, 2000);
      } else {
        this.toastr.error("La cantidad no es suficiente para cubrir el costo de esta membresía.", "¡Error!");
      }
    }
  }

  procesarPedido() {
    console.log("IDGym : ", this.idSucursal);
    this.serviceForm.patchValue({
      Gimnasio_idGimnasio: this.idSucursal,
    });
    let formValue = this.serviceForm.value
    console.log('datos del form: ', formValue);

    const PrecioCalcular = this.moneyRecibidoProd - this.precioSucursal;
    const fechaDInicio = this.fechaDeInicio || new Date();
    const fechaDFin = this.fechaDeFin || this.calcularFechaFin(this.nombreMembresiaProd, fechaDInicio);
    const fechaDInicioFormateada = this.formatDate(fechaDInicio);
    const fechaDFinFormateada = this.formatDate(fechaDFin);

    this.data.dateStart = fechaDInicioFormateada;
    this.data.dateEnd = fechaDFinFormateada;
    this.data.precio = this.precioSucursal;
    this.data.duracion = this.duracionMem;

    const updatedValues = {
      ...this.serviceForm.value, // Expande los valores actuales del formulario
        fechaInicio: this.data.dateStart,    // Agrega nuevos campos
        fechaFin: this.data.dateEnd,
        precio: this.data.precio,
        duracion: this.data.duracion,
        idCliente: this.data.idCliente,
    };
    console.log('Form actualizado: ', updatedValues);

    this.membresiaService.agregarPedido(updatedValues).subscribe((respuesta) => {
      if (respuesta) {
        if (respuesta.success == '1') {
          this.spinner.hide();
          this.mostrarDialogoExito(PrecioCalcular);
          this.dialogo.close(respuesta);
        } else {
          this.message = "Hubo un error al agregar.";
          console.error("Error al agregar", respuesta);
        }
      } else {
        this.message = "No se pudo conectar con el servidor.";
      }
    });
  }

  successDialogPago() {
    if (this.moneyRecibidoProd >= this.precioSucursal) {
      this.spinner.show();
      this.onMembresiaProdChange();

      // const fechaInicio = this.fechaDeInicio || new Date();
      // const fechaFin = this.fechaDeFin || this.calcularFechaFin(this.nombreMembresiaProd, fechaInicio);

      // const fechaInicioFormateada = this.formatDate(fechaInicio);
      // const fechaFinFormateada = this.formatDate(fechaFin);

      // this.data.precio = this.precioSucursal;
      // this.data.duracion = this.duracion;
      // this.data.membresia = this.nombreMembresiaProd;
      // this.data.dateStart = fechaInicioFormateada;
      // this.data.dateEnd = fechaFinFormateada;

      setTimeout(() => {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = "30%";
        dialogConfig.disableClose = true;
        dialogConfig.data = {
          mensaje: "¿Está seguro/a de que desea pagar la membresía seleccionada?",
          cliente: this.data.nombre,
          membresia: this.nombreMembresiaProd,
        };

        const fechaDInicio = this.fechaDeInicio || new Date();
        const fechaDFin = this.fechaDeFin || this.calcularFechaFin(this.nombreMembresiaProd, fechaDInicio);
        const fechaDInicioFormateada = this.formatDate(fechaDInicio);
        const fechaDFinFormateada = this.formatDate(fechaDFin);

        this.data.precio = this.precioSucursal;
        this.data.duracion = this.duracionMem;
        this.data.membresia = this.nombreMembresiaProd;
        this.data.dateStart = fechaDInicioFormateada;
        this.data.dateEnd = fechaDFinFormateada;
        this.data.idMem = this.idProductobod;

        console.log('Datos del cliente antes de confirmar: ', this.data);
        // console.log('Fecha Fin: ', this.data.dateEnd);
        // console.log('Fecha Inicio: ', this.data.dateStart);
        // console.log('Id detalle membresia: ', this.data.detMemID);
        // console.log('Duracion: ', this.data.duracion);
        // console.log('Id del cliente: ', this.data.idCliente);
        // console.log('Membresia: ', this.data.membresia);
        // console.log('Precio: ', this.data.precio);
        // console.log('Id Creador: ', this.auth.idUser.getValue());

        this.dialog.open(MensajeAceptarComponent, dialogConfig)
          .afterClosed()
          .subscribe((confirmado: boolean) => {
            if (confirmado) {
              this.procesarPago();
            } else {
              this.spinner.hide();
            }
          });
      }, 2000);
    } else {
      this.spinner.hide();
      this.toastr.error("La cantidad no es suficiente para cubrir el costo de esta membresía.", "¡Error!");
    }
  }

  procesarPago() {
    const PrecioCalcular = this.moneyRecibidoProd - this.precioSucursal;
    const fechaInicio = this.fechaDeInicio || new Date();
    const fechaFin = this.fechaDeFin || this.calcularFechaFin(this.nombreMembresiaProd, fechaInicio);

    const fechaInicioFormateada = this.formatDate(fechaInicio);
    const fechaFinFormateada = this.formatDate(fechaFin);

    this.data.precio = this.precioSucursal;
    this.data.duracion = this.duracionMem;
    this.data.membresia = this.nombreMembresiaProd;
    this.data.dateStart = fechaInicioFormateada;
    this.data.dateEnd = fechaFinFormateada;

    console.log('Datos del cliente: ', this.data);
    console.log('Id del cliente: ', this.data.idCliente);
    console.log('Membresia: ', this.data.membresia);
    console.log('Fecha Inicio: ', this.data.dateStart);
    console.log('Id detalle membresia: ', this.data.detMemID);
    console.log('Precio: ', this.data.precio);
    console.log('Fecha Fin: ', this.data.dateEnd);
    console.log('Id Creador: ', this.auth.idUser.getValue());

    console.log('Datos enviados al servicio actualizacionMemebresiaProd:', {
      idCliente: this.data.idCliente,
      membresiaSeleccionada: this.data.membresia,
      fechaInicio: this.data.dateStart,
      detMemID: this.data.detMemID,
      precio: this.data.precio,
      fechaFin: this.data.dateEnd,
      idUsuario: this.auth.idUser.getValue()
    });

    this.membresiaService
      .actualizacionMemebresiaProd(
        this.data.idCliente,
        this.data.membresia,
        this.data.dateStart,
        this.data.detMemID,
        this.data.precio,
        this.data.dateEnd,
        this.auth.idUser.getValue()
      )
      .pipe(
        tap((response) => {
          console.log('Respuesta del servicio actualizacionMemebresiaProd:', response);
        })
      )
      .subscribe(() => {
        this.spinner.hide();
        this.actualizarTablas.emit(true);
        this.dialogo.close(true);
        this.mostrarDialogoExito(PrecioCalcular);
      });
  }

  mostrarDialogoExito(cambio: number) {
    this.dialog.open(MensajeEmergenteComponent, {
      data: `Pago exitoso, el cambio es de: $${cambio}`,
      disableClose: true,
    })
    .afterClosed()
    .subscribe((cerrarDialogo: Boolean) => {
      if (cerrarDialogo) {
        this.imprimirResumenProd();
      }
    });
  }

  // Calcula la fecha fin
  calcularFechaFin(nombreProducto: string, fechaInicio: Date = new Date()): Date {
    let diasDuracion = 0;

    if (nombreProducto.toLowerCase().includes("mensualidad")) {
      diasDuracion = 30;
    } else if (nombreProducto.toLowerCase().includes("anualidad")) {
      diasDuracion = 365;
    } else if (nombreProducto.toLowerCase().includes("quincena")) {
      diasDuracion = 15;
    } else if (nombreProducto.toLowerCase().includes("visita") || nombreProducto.toLowerCase().includes("día") || nombreProducto.toLowerCase().includes("dia")) {
      diasDuracion = 1;
    } else {
      throw new Error("No se pudo determinar la duración del producto basado en su nombre.");
    }

    return new Date(fechaInicio.getTime() + diasDuracion * 24 * 60 * 60 * 1000);
  }

  // Formato de fecha YYYY-MM-DD
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  imprimirResumenProd() {
    if (this.precioSucursal <= this.moneyRecibidoProd) {
      const PrecioCalcular = this.moneyRecibidoProd - this.precioSucursal;
      this.membresiaService
        .ticketPagoInfoPed(this.data.idCliente)
        .subscribe((respuesta) => {
          if (respuesta && respuesta.length > 0) {
            const ticketInfo = respuesta[0];
            const totalEnPesos = this.convertirNumeroAPalabrasPesos(
              this.precioSucursal
            );
            const totalEnPesosRecibido = this.convertirNumeroAPalabrasPesos(
              this.moneyRecibidoProd
            );
            const totalEnPesosCambio =
              this.convertirNumeroAPalabrasPesos(PrecioCalcular);
            const ventanaImpresion = window.open("", "_blank");
            const fechaActual = new Date().toLocaleDateString("es-MX"); // Obtener solo la fecha en formato local de México
            const horaActual = new Date().toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            }); // Obtener solo la hora en formato local de México
            if (ventanaImpresion) {
              ventanaImpresion.document.open();
              ventanaImpresion.document.write(`
              <html>
                <head>
                  <style>
                    body {
                      font-family: 'Arial', sans-serif;
                      margin: 0;
                      padding: 0;
                      background-color: #f5f5f5;
                    }
                    .ticket {
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
                    .total {
                      text-align: right;
                      margin-top: 20px;
                      font-weight: bold;
                    }
                    .total p {
                      margin: 5px 0;
                      font-size: 1.1em;
                    }
                    hr {
                      border: none;
                      border-top: 1px dashed #ccc;
                      margin: 20px 0;
                    }
                    .brand {
                      text-align: center;
                      color: #888;
                      font-size: 20px;
                      margin-top: 20px;
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
                    .direccion{
                     font-size: 0.8em;
                    text-align: center;
                    }
                  </style>
                </head>
                <body>
                <div class="ticket">
                ${
                  this.fotoUrl
                    ? `<img class="logo" src="${this.fotoUrl}" alt="Logo">`
                    : ""
                }
                <p class="direccion">${this.auth.nombreGym.getValue()}</p>
                    <table>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Sucursal</th>
                          <th>Membresia</th>
                          <th>Fecha Inicio</th>
                          <th>Fecha Fin</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                            <tr>
                              <td>${ticketInfo.Nombre}</td>
                              <td>${ticketInfo.Sucursal}</td>
                              <td>${ticketInfo.Membresia}</td>
                              <td>${ticketInfo.Fecha_Inicio}</td>
                              <td>${ticketInfo.Fecha_Fin}</td>
                              <td>$${ticketInfo.Precio}</td>
                            </tr>
                      </tbody>
                    </table>
                    <hr>
                    <div>
                      <p>(${totalEnPesos} PESOS)</p>
                      <div class="total">
                        <p>Total a Pagar: $${this.precioSucursal}</p>
                      </div>
                    </div>
                    <div>
                      <div class="total">
                        <p>Dinero recibido: $${this.moneyRecibidoProd}</p>
                        <p>Cambio: $${PrecioCalcular}</p>
                      </div>
                    </div>
                    <div class="fecha-hora">
                      <p>Fecha: ${fechaActual}</p> <!-- Fecha -->
                      <p>Hora: ${horaActual}</p> <!-- Hora -->
                    </div>
                    <div class="brand">
                      <p>Gracias por su compra</p>
                      <p>¡Vuelva pronto!</p>
                    </div>
                  </div>
                </body>
              </html>
            `);
              ventanaImpresion.document.close();

              // Esperar a que la imagen se cargue antes de imprimir
              const image: HTMLImageElement | null =
                ventanaImpresion.document.querySelector("img");
              if (image) {
                image.onload = () => {
                  ventanaImpresion.print();
                  ventanaImpresion.close();
                };

                image.onerror = (error) => {
                  console.error("Error al cargar la imagen:", error);
                  ventanaImpresion.print();
                  ventanaImpresion.close();
                };
              } else {
                ventanaImpresion.print();
                ventanaImpresion.close();
              }
            }
          } else {
            console.error(
              "La respuesta del servicio no contiene los datos necesarios para generar el ticket."
            );
          }
        });
    } else {
      this.toastr.error("Ingresa el pago");
    }
  }


}
