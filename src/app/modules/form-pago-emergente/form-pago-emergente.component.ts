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
  duracion: any ;
  moneyRecibido: number = 0;
  fechaDeInicio: Date | null = null;
  fechaDeFin: Date | null = null;
  ticketInfo: any;
  @Output() actualizarTablas = new EventEmitter<boolean>();
  IspromocionPaquete: any;
  id_promocion: any;
  idProbob: any;
  pagoRespuesta: any;
  dineroDevuelto: any;
  dataGym: any;
  datosTicket:any;
  nombreCliente: any;
  nombreCompleto: any;

  constructor(
    private toastr: ToastrService,
    private auth: AuthService,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private GimnasioService: GimnasioService,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private membresiaService: PagoMembresiaEfectivoService,
    public dialogo: MatDialogRef<FormPagoEmergenteComponent>

  ) {
    this.obtenerFoto();
  }

  private fotoUrl: string | null = null;

  ngOnInit(): void {
    this.precio = 0;
    this.getMembresiasLista(this.data.idSucursal);
    console.log('DATA.sucusal',this.data.idSucursal);
    if (this.data) {
      this.membresiaSeleccionada = this.data.idMem;
      this.nombreCompleto = this.data.nombre;
      this.precio = this.data.precio !== "null" ? this.data.precio : "N/A";
      this.duracion =
        this.data.duracion !== "null" ? this.data.duracion : "N/A";
    }
  }

  getMembresiasLista(idgimnasio: number): void {
    this.membresiaService.membresiasLista(idgimnasio).subscribe(
      (data) => {
        this.membresias = data;
        console.log('respuesta en componente',data)
        console.log('idGimnasio',idgimnasio)
      },
      (error) => {
        console.error("Error al obtener la lista de membresías:", error);
      }
    );
  }
/*
  onMembresiaChange(): void {
    this.membresiaService
      .membresiasInfo(this.membresiaSeleccionada)
      .subscribe((resultado) => {
        this.duracion = resultado.Duracion;
        this.precio = `${resultado.Precio}`;
        this.nombreMembresia = `${resultado.Membresia}`;
      });
  } */

      onMembresiaChange(): void {
        if (!this.membresiaSeleccionada) {
          console.warn('No se seleccionó ninguna membresía o promoción.');
          return;
        }

        const { id, esPromocion } = this.membresiaSeleccionada;

        // Buscar en membresias considerando que los IDs pueden ser strings o números
        const resultado = this.membresias.find((item) =>
          esPromocion
            ? item.id_promocion === id || item.id_promocion === +id
            : item.idProbob === id || item.idProbob === +id
        );

        if (resultado) {
          this.duracion = resultado.descripcion; // Asignar descripción
          this.precio = resultado.precio; // Asignar precio
          this.nombreMembresia = resultado.nombre_producto; // Asignar nombre del producto
          this.IspromocionPaquete = resultado.promocionPaquete;
          this.id_promocion = resultado.id_promocion;
          this.idProbob = resultado.idProbob;
          console.log('id_prom',this.id_promocion, 'idPRobob',this.idProbob);

          console.log('Datos seleccionados:', {
            duracion: this.duracion,
            precio: this.precio,
            nombreMembresia: this.nombreMembresia,
            id_promocion: this.id_promocion,
            idProbob: this.idProbob

          });

          // Preparar datos para el procedimiento
          this.ejecutarProcedimiento(id, esPromocion);
        } else {
          console.warn('No se encontró la membresía o promoción seleccionada:', this.membresiaSeleccionada);
        }
      }


      // Método para ejecutar el procedimiento
      ejecutarProcedimiento(id: string, esPromocion: boolean): void {
        if (esPromocion) {
          console.log('Llamando procedimiento con id_promocion:', id);
          // Aquí llamas tu procedimiento con `id_promocion`
          // this.miServicio.llamarProcedimiento({ id_promocion: id });
        } else {
          console.log('Llamando procedimiento con idProbob:', id);
          // Aquí llamas tu procedimiento con `idProbob`
          // this.miServicio.llamarProcedimiento({ idProbob: id });
        }
      }


      cancelDialogo(): void {
        this.dialogo.close(true);
        this.idSucursal=this.data.idSucursal;
        console.log(this.idSucursal);
        console.log('data form',this.data)
      }

  obtenerFoto() {
    this.GimnasioService.getInfoBodega(this.auth.idGym.getValue()).subscribe(
      (respuesta: any[]) => {  // Asignamos cualquier arreglo
        if (respuesta && respuesta[0] && respuesta[0].foto) {
          let fotoUrl = respuesta[0].foto;

          // Añadir el esquema si no está presente
          if (!/^https?:\/\//i.test(fotoUrl)) {
            fotoUrl = "https://" + fotoUrl;  // Asumimos que la URL siempre será https
          }

          this.fotoUrl = fotoUrl;

         const datosGym ={
          nombreBodega: respuesta[0].nombreBodega,
          direccion: respuesta[0].direccion,
          numeroTelefonico:  respuesta[0].numeroTelefonico,
          fotoUrl: this.fotoUrl

         }

         this.dataGym=datosGym
        }
      },
      (error) => {
        console.error("Error al obtener la foto:", error);
        this.fotoUrl = null;
      }
    );
  }

  succesDialog2() {
    if (this.moneyRecibido >= this.precio) {
      // Si el dinero recibido es suficiente, muestra el spinner y realiza la acción
      this.spinner.show();
      this.onMembresiaChange(); // Llama a la función para cambiar la membresía

      // Configuración del diálogo de confirmación
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = "30%"; // Ajusta el ancho del diálogo
      dialogConfig.height = "auto"; // Ajusta la altura del diálogo
      dialogConfig.disableClose = true; // Deshabilita el cierre del diálogo al hacer clic fuera de él
      dialogConfig.data = {
        mensaje: `¿Está seguro/a de que desea pagar la membresía seleccionada?`,
        cliente: this.data.nombre,
        membresia: this.nombreMembresia,
      };

      // Abre el diálogo de confirmación y maneja la respuesta
      this.dialog
        .open(MensajeAceptarComponent, dialogConfig)
        .afterClosed()
        .subscribe((confirmado: boolean) => {
          if (confirmado) {

              const PrecioCalcular = this.moneyRecibido - this.precio;
              console.log('PrecioCalcular', PrecioCalcular);
              this.dineroDevuelto =   PrecioCalcular;

              const fechaVencimiento = this.calcularFecha(this.duracion); // Duración de la membresía (mensual, anual, etc.)
              console.log(fechaVencimiento)
              // calcular fechas
              //hacer solicitud post
              const dataPromo = {
                p_isPromoPaquete: this.IspromocionPaquete, // Indicar si es una promoción
                p_correo: this.data.correo, // Correo del cliente ---
                p_bodega: this.data.idSucursal, // Ajusta la bodega según el contexto
                p_total: this.precio, // Total pagado
                p_pago: this.moneyRecibido, // Forma de pago
                p_idProbob: this.idProbob, // ID del producto o servicio si lo tienes
                p_claveUser: this.data.idCliente, // Clave del usuario
                p_idPromo:  this.id_promocion, // El ID de la promoción si lo tienes
              };



              const DatosTicket ={

                fechaVencimiento:fechaVencimiento,

                duracion: this.duracion,
                producto: this.nombreMembresia,
                claveUser: this.data.idCliente,
                precio:  this.precio,
                precioLetra: this.convertirNumeroAPalabrasPesos(this.precio),
                pago: this.moneyRecibido,
                pagoLetra:this.convertirNumeroAPalabrasPesos(this.moneyRecibido),
                dineroDevuelto: this.dineroDevuelto,
                dineroDevueltoLetra:this.convertirNumeroAPalabrasPesos(this.dineroDevuelto),
                idPromocion:this.id_promocion,
                idProbob : this.idProbob,
                fechaActual: new Date().toLocaleDateString(), // Fecha en formato local (ej. '12/16/2024')
                 horaActual: new Date().toLocaleTimeString(),  // Hora en formato local (ej. '12:30:00 PM')

                nombreMembresia: this.nombreMembresia,
              id_promocion: this.id_promocion,
              nombreCompleto:this.nombreCompleto

              }


              this.datosTicket= DatosTicket;

              console.log('ticket',DatosTicket);
              this.obtenerFoto()




              //this.imprimirResumen3();


              console.log("data",this.data);
              console.log ('dataPromo',dataPromo);

              this.membresiaService.checkPromoPaquete(dataPromo).subscribe(
                response => {
                  console.log('Respuesta de la API de promociones:', response);

                // Si la compra es exitosa
                if (response.payment ==1)  { // Asumiendo que 'success' es el campo que indica una compra exitosa
                  // Mostrar mensaje de compra exitosa
                  this.dialog.open(MensajeEmergenteComponent, {
                    data: `Pago exitoso, el cambio es de: $${this.dineroDevuelto}`, // Ajusta el mensaje con el precio calculado
                    disableClose: true, // Bloquea el cierre haciendo clic fuera del diálogo
                  }).afterClosed().subscribe((cerrarDialogo: Boolean) => {
                    if (cerrarDialogo) {
                      this.imprimirResumen3(); // Imprimir el resumen si el diálogo se cierra
                    } else {
                      // Aquí puedes agregar cualquier otra lógica si lo necesitas
                    }
                  });
                } else {
                  // Si no es exitoso, mostrar mensaje de error
                  this.spinner.hide();
                  this.toastr.error("Hubo un error al procesar tu pago. Intenta nuevamente.", "¡Error!");
                }
              },
              error => {
                // Si hay un error en la llamada a la API
                console.error('Error al consultar la API de promociones:', error);
                this.spinner.hide();
                this.toastr.error(
                  "Hubo un error al procesar tu pago. Intenta nuevamente."
                );
              }
            );
          }
          this.spinner.hide(); // Se oculta el spinner después de la operación
        });
    } else {
      // Si el dinero recibido es insuficiente, muestra un error
      this.spinner.hide(); // Esconde el spinner si la cantidad es insuficiente
      this.toastr.error(
        "Cantidad insuficiente para cubrir el costo de esta membresía.",
        "¡Error!"
      );
    }
  }

  successDialog() {
    if (this.moneyRecibido >= this.precio) {
     this.spinner.show();
     this.onMembresiaChange();
     setTimeout(() => {
       const dialogConfig = new MatDialogConfig();
       dialogConfig.width = "30%"; // Ajusta el ancho del diálogo
       dialogConfig.height = "auto"; // Ajusta la altura del diálogo, 'auto' para ajustar según el contenido
       dialogConfig.disableClose = true; // Opcional: Deshabilita el cierre del diálogo al hacer clic fuera de él
       dialogConfig.data = {
         mensaje: `¿Está seguro/a de que desea pagar la membresía seleccionada?`,
         cliente: this.data.nombre,
         membresia: this.nombreMembresia,
       };

      this.dialog
        .open(MensajeAceptarComponent, dialogConfig)
        .afterClosed()
        .subscribe((confirmado: boolean) => {
          if (confirmado) {
            if (this.membresiaSeleccionada != undefined) {
                const PrecioCalcular = this.moneyRecibido - this.precio;
                //console.log('PrecioCalcular',PrecioCalcular);
                //console.log('previo',this.fechaDeInicio,this.fechaDeFin);
                if (this.fechaDeInicio && this.fechaDeFin) {
                  console.log(this.fechaDeInicio,this.fechaDeFin)
                  const añoInicio = this.fechaDeInicio.getFullYear();
                  const mesInicio = String(
                    this.fechaDeInicio.getMonth() + 1
                  ).padStart(2, "0"); // Los meses son indexados desde 0
                  const díaInicio = String(
                    this.fechaDeInicio.getDate()
                  ).padStart(2, "0");
                  const fechaFormateada1 = `${añoInicio}-${mesInicio}-${díaInicio}`;

                 const añoFin = this.fechaDeInicio.getFullYear();
                   const mesFin = String(
                     this.fechaDeInicio.getMonth() + 1
                   ).padStart(2, "0");
                   const díaFin = String(this.fechaDeInicio.getDate()).padStart(
                     2,
                     "0"
                   );
                   const fechaFormateada2 = `${añoFin}-${mesFin}-${díaFin}`;
                   this.membresiaService
                     .actualizacionMemebresia(
                       this.data.idCliente,
                       this.membresiaSeleccionada,
                       fechaFormateada1,
                       this.data.detMemID,
                       this.precio,
                       fechaFormateada2,
                       this.auth.idUser.getValue()
                     )
                     .subscribe((dataResponse: any) => {
                       this.spinner.hide();
                       this.actualizarTablas.emit(true);
                       this.dialogo.close(true);
                       this.dialog
                         .open(MensajeEmergenteComponent, {
                           data: `Pago exitoso, el cambio es de: $${PrecioCalcular}`,
                           disableClose: true, // Bloquea el cierre haciendo clic fuera del diálogo
                         })
                         .afterClosed()
                         .subscribe((cerrarDialogo: Boolean) => {
                           if (cerrarDialogo) {
                             this.imprimirResumen();
                           } else {
                           }
                         });
                     });
                 } else {
                   const fechaActual: Date = new Date();
                   const year = fechaActual.getFullYear();
                   const month = String(fechaActual.getMonth() + 1).padStart(
                     2,
                     "0"
                   );
                   const day = String(fechaActual.getDate()).padStart(2, "0");
                   const fechaFormateada = `${year}-${month}-${day}`;
                   let fechaFin: Date = new Date(fechaActual);
                   if (this.duracion == 1) {
                   } else if (this.duracion == 30) {
                     fechaFin.setMonth(fechaFin.getMonth() + 1);
                     if (fechaFin.getMonth() == 0) {
                       fechaFin.setFullYear(fechaFin.getFullYear() + 1);
                     }
                     fechaFin.setDate(fechaFin.getDate() - 1);
                   } else {
                     this.duracion = Number(this.duracion);
                     fechaFin.setDate(fechaFin.getDate() + this.duracion - 1);
                   }

                   const fechaFormateadaFin: string = fechaFin
                     .toISOString()
                     .split("T")[0];

                   this.membresiaService
                     .actualizacionMemebresia(
                       this.data.idCliente,
                       this.membresiaSeleccionada,
                       fechaFormateada,
                       this.data.detMemID,
                       this.precio,
                       fechaFormateadaFin,
                       this.auth.idUser.getValue()
                     )
                     .subscribe((dataResponse: any) => {
                       this.spinner.hide();
                       this.actualizarTablas.emit(true);

                       this.dialogo.close(true);
                      this.dialog
                        .open(MensajeEmergenteComponent, {
                          data: `Pago exitoso, el cambio es de: $${PrecioCalcular}`,
                          disableClose: true, // Bloquea el cierre haciendo clic fuera del diálogo
                        })
                        .afterClosed()
                        .subscribe((cerrarDialogo: Boolean) => {
                          if (cerrarDialogo) {
                            this.imprimirResumen();
                          } else {
                          }
                        });
                    });
                }
            }
          } else {
            this.spinner.hide();
          }
        });
    }, 2000);
  } else {
    this.spinner.hide();
    this.toastr.error(
      "Cantidad suficiente para cubrir el costo de esta membresía.",
      "¡Error!"
    );
  }
  }

imprimirResumen(){
  console.log("Imprimir resumen")
}


enviarDatos(datos:any): void {

  this.membresiaService.checkPromoPaquete(datos).subscribe(
    response => {
      this.pagoRespuesta = response;
      console.log('Respuesta del servidor:', response);
    },
    error => {
      console.error('Error en la solicitud:', error);
    }
  );
}


calcularFecha(duracion: string, fechaInicial?: string): string {
  // Usar la fecha y hora actual si no se proporciona una fecha inicial
  const fecha = fechaInicial ? new Date(fechaInicial) : new Date();

  // Verificar la duración y calcular la fecha final
  switch (duracion.toLowerCase()) {
      case "mensualidad":
          // Agregar un mes
          fecha.setMonth(fecha.getMonth() + 1);
          break;

      case "anualidad":
          // Agregar un año
          fecha.setFullYear(fecha.getFullYear() + 1);
          break;

      case "quincenal":
          // Agregar 15 días
          fecha.setDate(fecha.getDate() + 15);
          break;

      case "visita":
          // Agregar 1 día
          fecha.setDate(fecha.getDate() + 1);
          break;

      default:
          throw new Error("Duración no válida. Use 'mensualidad', 'anualidad', 'quincena' o 'visita'.");
  }

  // Retornar la fecha y hora en formato 'YYYY-MM-DD HH:mm:ss'
  const fechaFinal = fecha.toISOString();
  const [datePart, timePart] = fechaFinal.split("T");
  return `${datePart} ${timePart.split(".")[0]}`; // Formato 'YYYY-MM-DD HH:mm:ss'
}

imprimirResumen2() {

// Calcular cambio

//Convertir precio a palabras

//Convertir pago a palabras


//Obtner datos
  //clave
  //fecha actual
  //fecha fin
  //producto
  // precio y precio en numeero
  // cambio y cambio en numero
// hora actual

  //logo
  //direccion gym
  // sucursal
  // nombre sucursla


  if (this.precio <= this.moneyRecibido) {
    const PrecioCalcular = this.moneyRecibido - this.precio;
    this.membresiaService
      .ticketPagoInfo(this.data.idCliente)
      .subscribe((respuesta) => {
        if (respuesta && respuesta.length > 0) {
          const ticketInfo = respuesta[0];
          const totalEnPesos = this.convertirNumeroAPalabrasPesos(
            this.precio
          );
          const totalEnPesosRecibido = this.convertirNumeroAPalabrasPesos(
            this.moneyRecibido
          );
          const totalEnPesosCambio =
            this.convertirNumeroAPalabrasPesos(PrecioCalcular);

          const fechaActual = new Date().toLocaleDateString("es-MX"); // Obtener solo la fecha en formato local de México
          const horaActual = new Date().toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",

          }); // Obtener solo la hora en formato local de México

          const ventanaImpresion = window.open("", "_blank");
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
                  this.dataGym.foto
                    ? `<img class="logo" src="${this.dataGym.foto}" alt="Logo">`
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
                        <p>Total a Pagar: $${this.precio}</p>
                      </div>
                    </div>
                    <div>
                      <div class="total">
                        <p>Dinero recibido: $${this.moneyRecibido}</p>
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
/*

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

  /*

  successDialog() {
    if (this.moneyRecibido >= this.precio) {
    this.spinner.show();
    this.onMembresiaChange();
    setTimeout(() => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = "30%"; // Ajusta el ancho del diálogo
      dialogConfig.height = "auto"; // Ajusta la altura del diálogo, 'auto' para ajustar según el contenido
      dialogConfig.disableClose = true; // Opcional: Deshabilita el cierre del diálogo al hacer clic fuera de él
      dialogConfig.data = {
        mensaje: `¿Está seguro/a de que desea pagar la membresía seleccionada?`,
        cliente: this.data.nombre,
        membresia: this.nombreMembresia,
      };

      this.dialog
        .open(MensajeAceptarComponent, dialogConfig)
        .afterClosed()
        .subscribe((confirmado: boolean) => {
          if (confirmado) {
            if (this.membresiaSeleccionada != undefined) {
                const PrecioCalcular = this.moneyRecibido - this.precio;
                console.log('PrecioCalcular',PrecioCalcular);
                console.log('previo',this.fechaDeInicio,this.fechaDeFin);
                if (this.fechaDeInicio && this.fechaDeFin) {
                  console.log(this.fechaDeInicio,this.fechaDeFin)
                  const añoInicio = this.fechaDeInicio.getFullYear();
                  const mesInicio = String(
                    this.fechaDeInicio.getMonth() + 1
                  ).padStart(2, "0"); // Los meses son indexados desde 0
                  const díaInicio = String(
                    this.fechaDeInicio.getDate()
                  ).padStart(2, "0");
                  const fechaFormateada1 = `${añoInicio}-${mesInicio}-${díaInicio}`;

                  const añoFin = this.fechaDeInicio.getFullYear();
                  const mesFin = String(
                    this.fechaDeInicio.getMonth() + 1
                  ).padStart(2, "0");
                  const díaFin = String(this.fechaDeInicio.getDate()).padStart(
                    2,
                    "0"
                  );
                  const fechaFormateada2 = `${añoFin}-${mesFin}-${díaFin}`;
                  this.membresiaService
                    .actualizacionMemebresia(
                      this.data.idCliente,
                      this.membresiaSeleccionada,
                      fechaFormateada1,
                      this.data.detMemID,
                      this.precio,
                      fechaFormateada2,
                      this.auth.idUser.getValue()
                    )
                    .subscribe((dataResponse: any) => {
                      this.spinner.hide();
                      this.actualizarTablas.emit(true);
                      this.dialogo.close(true);
                      this.dialog
                        .open(MensajeEmergenteComponent, {
                          data: `Pago exitoso, el cambio es de: $${PrecioCalcular}`,
                          disableClose: true, // Bloquea el cierre haciendo clic fuera del diálogo
                        })
                        .afterClosed()
                        .subscribe((cerrarDialogo: Boolean) => {
                          if (cerrarDialogo) {
                            this.imprimirResumen();
                          } else {
                          }
                        });
                    });
                } else {
                  const fechaActual: Date = new Date();
                  const year = fechaActual.getFullYear();
                  const month = String(fechaActual.getMonth() + 1).padStart(
                    2,
                    "0"
                  );
                  const day = String(fechaActual.getDate()).padStart(2, "0");
                  const fechaFormateada = `${year}-${month}-${day}`;
                  let fechaFin: Date = new Date(fechaActual);
                  if (this.duracion == 1) {
                  } else if (this.duracion == 30) {
                    fechaFin.setMonth(fechaFin.getMonth() + 1);
                    if (fechaFin.getMonth() == 0) {
                      fechaFin.setFullYear(fechaFin.getFullYear() + 1);
                    }
                    fechaFin.setDate(fechaFin.getDate() - 1);
                  } else {
                    this.duracion = Number(this.duracion);
                    fechaFin.setDate(fechaFin.getDate() + this.duracion - 1);
                  }

                  const fechaFormateadaFin: string = fechaFin
                    .toISOString()
                    .split("T")[0];

                  this.membresiaService
                    .actualizacionMemebresia(
                      this.data.idCliente,
                      this.membresiaSeleccionada,
                      fechaFormateada,
                      this.data.detMemID,
                      this.precio,
                      fechaFormateadaFin,
                      this.auth.idUser.getValue()
                    )
                    .subscribe((dataResponse: any) => {
                      this.spinner.hide();
                      this.actualizarTablas.emit(true);

                      this.dialogo.close(true);

                      this.dialog
                        .open(MensajeEmergenteComponent, {
                          data: `Pago exitoso, el cambio es de: $${PrecioCalcular}`,
                          disableClose: true, // Bloquea el cierre haciendo clic fuera del diálogo
                        })
                        .afterClosed()
                        .subscribe((cerrarDialogo: Boolean) => {
                          if (cerrarDialogo) {
                            this.imprimirResumen();
                          } else {
                          }
                        });
                    });
                }
            }
          } else {
            this.spinner.hide();
          }
        });
    }, 2000);
  } else {
    this.spinner.hide();
    this.toastr.error(
      "Cantidad suficiente para cubrir el costo de esta membresía.",
      "¡Error!"
    );
  }
  }

  imprimirResumen() {
    if (this.precio <= this.moneyRecibido) {
      const PrecioCalcular = this.moneyRecibido - this.precio;
      this.membresiaService
        .ticketPagoInfoPed(this.data.idCliente)
        .subscribe((respuesta) => {
          if (respuesta && respuesta.length > 0) {
            const ticketInfo = respuesta[0];
            const totalEnPesos = this.convertirNumeroAPalabrasPesos(
              this.precio
            );
            const totalEnPesosRecibido = this.convertirNumeroAPalabrasPesos(
              this.moneyRecibido
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
                     `<img class="logo" src="${this.fotoUrl}" alt="Logo">`
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
                        <p>Total a Pagar: $${this.precio}</p>
                      </div>
                    </div>
                    <div>
                      <div class="total">
                        <p>Dinero recibido: $${this.moneyRecibido}</p>
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

  */



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

imprimirResumen3() {
    // Calcular cambio
    // Convertir precio a palabras
    // Convertir pago a palabras
    // Obtener datos
    // clave
    // fecha actual
    // fecha fin
    // producto
    // precio y precio en número
    // cambio y cambio en número
    // hora actual
    // logo
    // dirección gym
    // sucursal
    // nombre sucursal

    /*
    if (this.precio <= this.moneyRecibido) {
      const PrecioCalcular = this.moneyRecibido - this.precio;
      this.membresiaService
        .ticketPagoInfo(this.data.idCliente)
        .subscribe((respuesta) => {
          if (respuesta && respuesta.length > 0) {
            const ticketInfo = respuesta[0];
            const totalEnPesos = this.convertirNumeroAPalabrasPesos(this.precio);
            const totalEnPesosRecibido = this.convertirNumeroAPalabrasPesos(this.moneyRecibido);
            const totalEnPesosCambio = this.convertirNumeroAPalabrasPesos(PrecioCalcular);

            const fechaActual = new Date().toLocaleDateString("es-MX"); // Obtener solo la fecha en formato local de México
            const horaActual = new Date().toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            }); // Obtener solo la hora en formato local de México
    */

            console.log(this.datosTicket);
            console.log(this.dataGym);
            console.log(this.dataGym.direccion)



    const ventanaImpresion = window.open("", "_blank");

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
                  this.dataGym.fotoUrl
                    ? `<img class="logo" src="${this.dataGym.fotoUrl}" alt="Logo">`
                    : ""
                }
                <p class="direccion">${this.dataGym.direccion}</p>
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
                              <td>${this.datosTicket.nombreCompleto}</td>
                              <td>${this.dataGym.nombreBodega}</td>
                              <td>${this.datosTicket.nombreMembresia}</td>
                              <td>${this.datosTicket.fechaActual}</td>
                              <td>${this.datosTicket.fechaVencimiento}</td>
                              <td>$${this.datosTicket.precio}</td>
                            </tr>
                      </tbody>
                    </table>
                    <hr>
                    <div>
                      <p>(${this.datosTicket.precioLetra} PESOS)</p>
                      <div class="total">
                        <p>Total a Pagar: $${this.datosTicket.precio}</p>
                      </div>
                    </div>
                    <div>
                      <div class="total">
                        <p>Dinero recibido: $${this.datosTicket.pago}</p>
                        <p>Cambio: $${this.datosTicket.dineroDevuelto}</p>
                      </div>
                    </div>
                    <div class="fecha-hora">
                      <p>Fecha: ${this.datosTicket.fechaActual}</p> <!-- Fecha -->
                      <p>Hora: ${this.datosTicket.horaActual}</p> <!-- Hora -->
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
      const image: HTMLImageElement | null = ventanaImpresion.document.querySelector("img");
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
  } // Cierre correcto de la función


}
