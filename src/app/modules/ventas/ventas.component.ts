import { Component, OnInit, ViewChild , Inject} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table"; //para controlar los datos del api y ponerlos en una tabla
import { Producto } from "../../models/producto";
import { ProductoService } from "../../service/producto.service";
import { AuthService } from "../../service/auth.service";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
  FormGroupDirective,
  NgForm,
} from "@angular/forms";
import { DetalleVentaService } from "../../service/detalle-venta.service";
import { MatDialog } from "@angular/material/dialog";
import { ClienteService } from "../../service/cliente.service";
import { Ventas } from "../../models/ventas";
import { VentasService } from "../../service/ventas.service";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import { inventarioService } from "../../service/inventario.service";
import { ToastrService } from "ngx-toastr";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HomeComponent } from "../home/home.component";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { detalleVenta } from "../../models/detalleVenta";
import { DialogStateService } from "../../service/dialogState.service";
import { GimnasioService } from "../../service/gimnasio.service";
interface Cliente {
  ID_Cliente: number;
  nombre: string;
  apPaterno: string;
  apMaterno: string;
}

@Component({
  selector: "app-home",
  templateUrl: "./ventas.component.html",
  styleUrls: ["./ventas.component.css"],
})
export class VentasComponent implements OnInit {
  isMaximized = false;
  productosArray: FormArray;
  formularioDetalleVenta: FormGroup;
  datosParaGuardarVenta: Ventas[] = [];
  detalle: any;
  cliente: any;
  detalles: any;
  producto: any;
  ubicacion: string = "";
  idUsuarioo: number =0;
  lastInsertedId: number =0;
  lastInsertedId3: number = 0;
  totalAPagar: number = 0;
  dineroRecibido: number = 0;
  totalAPagarCorte: number = 0;
  cantidadSolicitada: number = 0;
  mostrarLasVentas: boolean = false;
  detallesCaja: any[] = [];
  productData: Producto[] = []; 
  showTable: boolean = false;
  
  selectedProducts: any[] = [];
  datosParaGuardarDetalleVenta: detalleVenta[] = [];
  columnas: string[] = [
    "nombreProducto",
    "cantidadElegida",
    "precioUnitario",
    "fechaVenta",
  ];

  columnMapping: { [key: string]: string } = {
    "Código de Barras": "codigoBarras",
    "Detalle": "detalleCompra",
    "Nombre del Producto": "nombreProducto",
    "Precio de Sucursal": "precioSucursal",
    "Existencias": "existencia"
  };
  
  displayedColumns: string[] = [
    "Código de Barras",
    "Nombre del Producto",
    "Detalle",
    "Precio de Sucursal",
    "Existencias",
    "cantidad",
    "acciones",
  ];

  private fotoUrl: string | null = null;
  

  private destroy$: Subject<void> = new Subject<void>();
  
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  @ViewChild('paginator', { static: true }) paginator!: MatPaginator;

  constructor(
    public dialogo: MatDialogRef<HomeComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string,
    public dialog: MatDialog,
    private auth: AuthService,
    private toastr: ToastrService,
    public formulario: FormBuilder,
    private DetalleVenta: DetalleVentaService,
    private ventasService: VentasService,
    private clienteService: ClienteService,
    private productoService: ProductoService,
    private InventarioService: inventarioService,
    private dialogStateService: DialogStateService,
    private GimnasioService: GimnasioService
  ) {
    this.obtenerFoto();
    const userId = this.auth.idUser.getValue(); // id del usuario
    /* --------------------------------------------------------------*/
    this.formularioDetalleVenta = this.formulario.group({
      productos: this.formulario.array([]),
    });
    /* --------------------------------------------------------------*/
    this.productosArray = this.formularioDetalleVenta.get(
      "productos"
    ) as FormArray;
  }

  handleFilterInput(event: any) {
    const value = event.target.value;
    // Verificar si value no es null antes de continuar
    if (value !== null) {
      // Si el valor del filtro está vacío, ocultar la tabla
      this.showTable = value.trim() !== '';
    }
  }

  ngAfterViewInit(): void {
      this.productoService.obternerProductosV(this.auth.idGym.getValue()).subscribe((respuesta) => {
          this.productData = respuesta;
          this.dataSource = new MatTableDataSource(this.productData);
          this.dataSource.paginator = this.paginator; 
        });
  }

  ejecutarServicio(): void {
    /*this.DetalleVenta.obternerEstatus().subscribe((result) => {
    });*/
  }

  /* MAXIMIZAR PANTALLA*/
  toggleMaximize() {
    this.isMaximized = !this.isMaximized;
    this.dialogStateService.updateMaximizeState(this.isMaximized);
  }

  ngOnInit(): void {
    // this.productoService.comprobar();
    // this.DetalleVenta.comprobar();
    // this.InventarioService.comprobar();
    // this.ventasService.comprobar();
    interval(10000)
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.ejecutarServicio();
    });

    this.ubicacion = this.auth.nombreGym.getValue();
    //datos de detalle venta
    this.DetalleVenta.obternerVentaDetalle().subscribe({
      next: (resultData) => {
        this.detalle = resultData;
      },
    });
  }

  /*FILTRO*/
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  resetearValores() {
    this.selectedProducts = [];
    this.totalAPagar = 0;
    this.dineroRecibido = 0;
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
    if (this.totalAPagar <= this.dineroRecibido) {
      /**FECHA */
      const fechaActual = new Date();
      const offset = fechaActual.getTimezoneOffset(); // Obtiene el offset en minutos
      fechaActual.setMinutes(fechaActual.getMinutes() - offset);
      const fechaVenta = fechaActual.toISOString().replace("T", " ").split(".")[0];
      const totalAPagar = this.selectedProducts.reduce((total, producto) => total + producto.precioSucursal * producto.cantidad,0);
      // Enviar datos de ventas
      const datosVentas = {
        Cliente_ID_Cliente: 0,
        Caja_idCaja: 1,
        fechaVenta: fechaVenta,
        total: totalAPagar,
      };
      this.ventasService.agregarVentas(datosVentas).subscribe((response) => {
        const lastInsertedId3 = response.lastInsertedId3;
        const detallesVenta = this.selectedProducts.map((producto) => {
          return {
            Ventas_idVentas: lastInsertedId3,
            Producto_idProducto: producto.idProbob,
            nombreProducto: producto.nombreProducto + " " + producto.marca + ", " + producto.detalleCompra,
            cantidadElegida: producto.cantidad,
            precioUnitario: producto.precioSucursal,
            Gimnasio_idGimnasio: this.auth.idGym.getValue(),
            importe: producto.cantidad * producto.precioSucursal,
          };
        });
        this.DetalleVenta.agregarVentaDetalle(detallesVenta).subscribe(
          (response) => {
            const existencias = this.selectedProducts.map((producto) => {
              return {
              codigo: producto.codigoBarras,
              cantidad: producto.cantidad
            }
            });
            this.DetalleVenta.updateExistencias(existencias).subscribe((data) =>{
            })

            this.dialog.open(MensajeEmergentesComponent, {
              data: `Productos registrados correctamente`,
            })
            .afterClosed()
            .subscribe((cerrarDialogo: Boolean) => {
              if (cerrarDialogo) {
                this.dialogo.close(true);
                this.resetearValores();
              } else {
              }
            });
          }
        );
      });
    } else {
      this.toastr.error("Pago incorrecto, verifica");
    }
    ///////////////////////
    if (this.totalAPagar <= this.dineroRecibido) {
      const totalCantidad = this.selectedProducts.reduce(
        (total, producto) => producto.cantidad,
        0
      );
      const totalEnPesos = this.convertirNumeroAPalabrasPesos(this.totalAPagar);
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
            </style>
          </head>
          
          <body>
            <div class="ticket">
            ${this.fotoUrl ? `<img class="logo" src="${this.fotoUrl}" alt="Logo">` : ''}
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.selectedProducts
                    .map(
                      (producto) => `
                      <tr>
                        <td>${producto.nombreProducto}</td>
                        <td>${producto.cantidad}</td>
                        <td>$${producto.precioSucursal}</td>
                        <td>$${producto.precioSucursal * producto.cantidad}</td>
                      </tr>
                    `
                    )
                    .join("")}
                </tbody>
              </table>
              <hr>
              <p>Cantidad total de productos: ${totalCantidad}</p>
              <div class="total">
              
                <p>Total a Pagar: $${this.totalAPagar}</p>
                </div>
                <p>(${totalEnPesos} PESOS)</p>
                <div class="total">
                <p>Dinero recibido: $${this.dineroRecibido}</p>
                <p>Cambio: $${this.dineroRecibido - this.totalAPagar}</p>
                
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
    } else {
      this.toastr.error("Ingresa el pago");
    }
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

  obtenerProducto(id: any, idGimnasio: any, cantidadSolicitada: number): void {
    this.InventarioService.obtenerProductoPorId(id, idGimnasio).subscribe({
      next: (data) => {
        this.producto = data; 
        if (data[0].existencia < cantidadSolicitada) {     
          this.toastr.error("No hay suficiente stock disponible para esta cantidad");
        } else {
        }
        if (data[0].existencia < 5) {
          this.toastr.warning(`Quedan solo ${data[0].existencia} productos disponibles`);
        }
      },
      error: (error) => {
        console.error("Error al obtener el producto:", error);
      },
    });
  }

  validarYAgregarProducto(producto: any) {
   this.InventarioService.obtenerProductoPorId(producto.idProbob, this.auth.idGym.getValue()).subscribe(
      (data) => {
        const productoObtenido = data[0];
        if (!productoObtenido) {
          this.toastr.error("Producto no encontrado");
          return;
        }
        const cantidadDisponible = productoObtenido.existencia;
        const cantidadSolicitada = producto.cantidad;
        if (cantidadDisponible < cantidadSolicitada) {
          this.toastr.error("No hay suficiente stock disponible para esta cantidad");
          return;
        }
        if (cantidadDisponible < 5) {
          this.toastr.warning(`Quedan solo ${cantidadDisponible} productos disponibles`);
        }
        const productoExistente = this.selectedProducts.find(p => p.codigoBarras === producto.codigoBarras);
        if (productoExistente) {
          productoExistente.cantidad += cantidadSolicitada;
        } else {
          this.selectedProducts.push({ ...producto });
        }
        this.totalAPagar = this.selectedProducts.reduce(
          (total, p) => total + (p.precioSucursal * p.cantidad),
          0
        );
        
        
        producto.cantidad = 0;
        this.obtenerProducto(producto.idProbob,this.auth.idGym.getValue(),cantidadSolicitada);
      },
      (error) => {
        this.toastr.error("Error al obtener el producto");
      }
    );
  }

  cerrarDialogo(): void {
    this.dialogo.close(true);
  }

  quitarArchivo(index: number): void {
    this.selectedProducts.splice(index, 1);
    this.totalAPagar = this.selectedProducts.reduce(
      (total, p) => total + (p.precioSucursal * p.cantidad),
      0
    );
  }
  
}
