import { Component, OnInit, ViewChild, Inject, ElementRef } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table"; 
import { Producto } from "../../models/producto";
import { ProductoService } from "../../service/producto.service";
import { AuthService } from "../../service/auth.service";
import { FormGroup, FormBuilder, FormArray} from "@angular/forms";
import { DetalleVentaService } from "../../service/detalle-venta.service";
import { MatDialog } from "@angular/material/dialog";
import { Ventas } from "../../models/ventas";
import { VentasService } from "../../service/ventas.service";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import { inventarioService } from "../../service/inventario.service";
import { ToastrService } from "ngx-toastr";
import { MatPaginator } from "@angular/material/paginator";
import { Subject } from 'rxjs';
import { HomeComponent } from "../home/home.component";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { detalleVenta } from "../../models/detalleVenta";
import { NgxSpinnerService } from "ngx-spinner";
import { MensajeEliminarComponent } from "../mensaje-eliminar/mensaje-eliminar.component";
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
  filterTimer: any;
  cliente: any;
  detalles: any;
  producto: any;
  ubicacion: string = "";
  idUsuarioo: number =0;
  lastInsertedId: number =0;
  lastInsertedId3: number = 0;
  totalAPagar: number = 0;
  dineroRecibido: number = 0;
  valorBusqueda: number = 0;
  totalAPagarCorte: number = 0;
  cantidadSolicitada: number = 0;
  mostrarLasVentas: boolean = false;
  detallesCaja: any[] = [];
  productData: Producto[] = []; 
  showTable: boolean = false;
  selectedProducts: any[] = [];
  filteredProd: string[] = [];
  productosC: any[] = [];
  datosParaGuardarDetalleVenta: detalleVenta[] = [];
  private fotoUrl: string | null = null;
  private destroy$: Subject<void> = new Subject<void>();
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  @ViewChild('paginator', { static: true }) paginator!: MatPaginator;
  @ViewChild('input', { static: true }) inputElement!: ElementRef;
  filteredDataSource = new MatTableDataSource<any>([]);
  form: FormGroup;

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

  constructor(
    public dialogo: MatDialogRef<HomeComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string,
    public dialog: MatDialog,
    private auth: AuthService,
    private toastr: ToastrService,
    public formulario: FormBuilder,
    private DetalleVenta: DetalleVentaService,
    private ventasService: VentasService,
    private productoService: ProductoService,
    private fb: FormBuilder,
    private InventarioService: inventarioService,
    private spinner: NgxSpinnerService
  ) {

    this.form = this.fb.group({
      producto: [""],
    });

    this.formularioDetalleVenta = this.formulario.group({
      productos: this.formulario.array([]),
    });
    /* --------------------------------------------------------------*/
    this.productosArray = this.formularioDetalleVenta.get(
      "productos"
    ) as FormArray;
  }



  ngOnInit(): void {
    // this.productoService.comprobar();
    // this.DetalleVenta.comprobar();
    // this.InventarioService.comprobar();
    // this.ventasService.comprobar();
    this.ubicacion = this.auth.nombreGym.getValue();
    this.DetalleVenta.obternerVentaDetalle().subscribe({
      next: (resultData) => {
        this.detalle = resultData;
      },
    });

    this.productoService.obternerProductosV(this.auth.idGym.getValue()).subscribe((respuesta) => {
      this.productData = respuesta;
      this.dataSource = new MatTableDataSource(this.productData);
      this.dataSource.paginator = this.paginator; 
    });
  }

 /* async applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    const result = this.dataSource.data.find((prod) => prod.codigoBarras.toLowerCase() === filterValue.toLowerCase());
    
    if (result) {
      result.cantidad = 1;
      await this.validarYAgregarProducto(result);
      this.filteredDataSource = this.dataSource;
      (event.target as HTMLInputElement).value = '';  
    } else {
    }  
  }*/

    
    
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
       
        const productoExistente = this.selectedProducts.find(p => p.codigoBarras === producto.codigoBarras);

        if (productoExistente ) {
          productoExistente.cantidad += cantidadSolicitada;
          } else {
            this.selectedProducts.push({ ...producto });
          }
          this.totalAPagar = this.selectedProducts.reduce((total, p) => total + (p.precioSucursal * p.cantidad),0);  
          //  producto.cantidad = 0;
          // this.obtenerProducto(producto.idProbob,this.auth.idGym.getValue(),cantidadSolicitada);
         },
         (error) => {
           this.toastr.error("Error al obtener el producto");
        }
    );
  }

  resetearValores() {
    this.selectedProducts = [];
    this.totalAPagar = 0;
    this.dineroRecibido = 0;
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

  imprimirResumen() {
    this.dialog.open(MensajeEliminarComponent,{
      data: `¿Está seguro/a de que desea completar esta venta?`,
    })
    .afterClosed()
    .subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.spinner.show();
    let allProductsValid = true;
    for (let i = 0; i < this.selectedProducts.length; i++) {
      if (this.selectedProducts[i].cantidad > this.selectedProducts[i].existencia) {
        this.toastr.error(`La cantidad es mayor que la existencia para el producto: ${this.selectedProducts[i].nombreProducto}`, 'Error', {
          positionClass: 'toast-bottom-left',
        });
        this.spinner.hide();
        allProductsValid = false;
      }
    }

    if(allProductsValid && this.selectedProducts.length > 0 ){
      if (this.totalAPagar <= this.dineroRecibido) {
        /**FECHA */
        const totalAPagar = this.selectedProducts.reduce((total, producto) => total + producto.precioSucursal * producto.cantidad,0);
        // Enviar datos de ventas
        const datosVentas = {
          total: totalAPagar,
          idUsuario:this.auth.idUser.getValue()
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
              if(response.success == 1){
                const existencias = this.selectedProducts.map((producto) => {
                  return {
                  codigo: producto.codigoBarras,
                  cantidad: producto.cantidad,
                  idBodega: this.auth.idGym.getValue()
                }
                });
                this.DetalleVenta.updateExistencias(existencias).subscribe((data) =>{
                })
                this.spinner.hide();
    
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
              }else {
              this.toastr.error("Error al vender producto");
            }
            }
          );
        });
      } else {
        this.toastr.error("Pago incorrecto, verifica");
      }
      ///////////////////////
     
    }
        
      } else {
      }
    });
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

  async applyFilter(event: Event | null) {
    const filterValue = this.form.get("producto")?.value;
  
    // Búsqueda por nombreProducto, detalleCompra y marca
    const result = this.dataSource.data.find(
      (prod) => (prod.nombreProducto.toLowerCase() + '_' + prod.detalleCompra.toLowerCase() + '_' + prod.marca.toLowerCase()) === filterValue.toLowerCase()
    );
  
    // Búsqueda por codigoBarras
    const result2 = this.dataSource.data.find(
      (prod) => prod.codigoBarras.toLowerCase() === filterValue.toLowerCase()
    );
  
    // Verificar y agregar producto encontrado
    if (result) {
      result.cantidad = 1;
      await this.validarYAgregarProducto(result);
      this.form.get("producto")?.setValue('');
      this.filteredDataSource = this.dataSource;
    } else if (result2) {
      result2.cantidad = 1;
      await this.validarYAgregarProducto(result2);
      this.form.get("producto")?.setValue('');
      this.filteredDataSource = this.dataSource;
    } else {
      const prueba = this.form.get("producto")?.value;
      const contieneSoloNumeros = /^[0-9]+$/.test(prueba);
      if (prueba !== '' && contieneSoloNumeros) {
        const length = prueba.length;
        if (length >= 8) {
          this.toastr.warning('Producto no disponible', 'Producto no disponible');
        }
      }
    }
  }

  buscarPorPro(){
    const productoIngresado = this.form.get("producto")?.value;
      this.InventarioService.buscarProductoPorNombre(this.auth.idGym.getValue()).subscribe({
        next: (respuesta) => {
          const prod = new Set(
            respuesta.nombreproducto.map(
              (productosN: any) => productosN.descripcion+'_'+productosN.detalleCompra+'_'+productosN.marca
            )
          );
          this.productosC = Array.from(prod) as string[];
          this.filteredProd = this.productosC.filter(
      
            (prooduc) =>
              !productoIngresado ||
            prooduc.toLowerCase().includes(productoIngresado.toLowerCase())
            
          );
          
        },
      });
    }
  
    seleccionar(marca: string): void {
      this.form.get('producto')?.setValue(marca);
      this.applyFilter(null); // Aplicar filtro al seleccionar una opción del autocompletado
    }
  
}
