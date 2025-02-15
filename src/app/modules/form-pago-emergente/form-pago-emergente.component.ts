import { Component, OnInit, Inject, EventEmitter, Output } from "@angular/core";
import {  MatDialogRef,  MAT_DIALOG_DATA,  MatDialog,} from "@angular/material/dialog";
import { PagoMembresiaEfectivoService } from "../../service/pago-membresia-efectivo.service";
import { MensajeEmergenteComponent } from "../mensaje-emergente/mensaje-emergente.component";
import { ToastrService } from "ngx-toastr";
import { GimnasioService } from "../../service/gimnasio.service";
import { AuthService } from "../../service/auth.service";
import { NgxSpinnerService } from "ngx-spinner";
import { MensajeAceptarComponent } from "../mensaje-aceptar/mensaje-aceptar.component";
import { MatDialogConfig } from "@angular/material/dialog";
import { EventCommunicationServiceService } from "../../service/event-communication-service.service";


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
  receivedMoney: number = 0;
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
  fechaVencimientoMembresia:string='';
  fechaInicioMembresia: string='';

  constructor(
    private toastr: ToastrService,
    private auth: AuthService,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private GimnasioService: GimnasioService,
    private eventCommunicationService:EventCommunicationServiceService,
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
   
      },
      (error) => {
        console.error("Error al obtener la lista de membresías:", error);
        this.toastr.error('No se encontratron membresias');
      }
    );
  }


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
   

     

          // Preparar datos para el procedimiento
         
        } else {
          console.warn('No se encontró la membresía o promoción seleccionada:', this.membresiaSeleccionada);
        }
      }




      cancelDialogo(): void {
        this.dialogo.close(true);
        this.idSucursal=this.data.idSucursal;
       
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
      
        this.fotoUrl = null;
      }
    );
  }

  succesDialog2() {
    if (this.receivedMoney >= this.precio) {
        this.spinner.show(); // ⬅️ Mostrar spinner antes de abrir el diálogo

        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = "30%";
        dialogConfig.height = "auto";
        dialogConfig.disableClose = true;
        dialogConfig.data = {
            mensaje: `¿Está seguro/a de que desea pagar la membresía seleccionada?`,
            cliente: this.data.nombre,
            membresia: this.nombreMembresia,
        };

        this.dialog.open(MensajeAceptarComponent, dialogConfig)
            .afterClosed()
            .subscribe((confirmado: boolean) => {
                if (!confirmado) {
                    this.spinner.hide(); // ⬅️ Si el usuario cancela, ocultar el spinner
                    return;
                }

                const PrecioCalcular = this.receivedMoney - this.precio;
                this.dineroDevuelto = PrecioCalcular;

                const dataPromo = {
                    p_isPromoPaquete: this.IspromocionPaquete,
                    p_correo: this.data.correo,
                    p_bodega: this.data.idSucursal,
                    p_total: this.precio,
                    p_pago: this.receivedMoney,
                    p_idProbob: this.idProbob,
                    p_claveUser: this.data.idCliente,
                    p_idPromo: this.id_promocion,
                    p_idEmpleado: this.auth.idUser.getValue(),
                };

                this.obtenerFoto();

                this.membresiaService.checkPromoPaquete(dataPromo).subscribe(
                    response => {
                        if (response.payment !== 1) { 
                            this.spinner.hide(); // ⬅️ Ocultar spinner si el pago no fue exitoso
                            this.toastr.error(`Hubo un error al procesar tu pago. ${response.message} Intenta nuevamente.`, "¡Error!");
                            return;
                        }

                        this.fechaInicioMembresia = response.Fecha_inicio;
                        this.fechaVencimientoMembresia = response.Fecha_Fin.split(' ')[0];

                        this.datosTicket = {
                            fechaVencimiento: this.fechaVencimientoMembresia,
                            fechaInicioMembresia: this.fechaInicioMembresia,
                            duracion: this.duracion,
                            producto: this.nombreMembresia,
                            claveUser: this.data.idCliente,
                            precio: this.precio,
                            precioLetra: this.convertirNumeroAPalabrasPesos(this.precio),
                            pago: this.receivedMoney,
                            pagoLetra: this.convertirNumeroAPalabrasPesos(this.receivedMoney),
                            dineroDevuelto: this.dineroDevuelto,
                            dineroDevueltoLetra: this.convertirNumeroAPalabrasPesos(this.dineroDevuelto),
                            idPromocion: this.id_promocion,
                            idProbob: this.idProbob,
                            fechaActual: new Date().toLocaleDateString(),
                            horaActual: new Date().toLocaleTimeString(),
                            nombreMembresia: this.nombreMembresia,
                            id_promocion: this.id_promocion,
                            nombreCompleto: this.nombreCompleto,
                        };

                        this.dialog.open(MensajeEmergenteComponent, {
                            data: `Pago exitoso, el cambio es de: $${this.dineroDevuelto}`,
                            disableClose: true,
                        }).afterClosed().subscribe((cerrarDialogo: boolean) => {
                            if (!cerrarDialogo) {
                                this.spinner.hide(); // ⬅️ Ocultar spinner si se cierra el diálogo sin imprimir
                            } else {
                                this.imprimirResumen3();
                                this.emitEnventMethod('pago emergente exitoso')
                            }
                        });
                    },
                    error => {
                        this.spinner.hide(); // ⬅️ Si hay un error en la API, ocultar el spinner
                        console.error('Error al consultar la API de promociones:', error);
                        this.toastr.error("Hubo un error al procesar tu pago. Intenta nuevamente.");
                    }
                );
            });
    } else {
        this.spinner.hide(); // ⬅️ Si el dinero es insuficiente, ocultar el spinner
        this.toastr.error("Cantidad insuficiente para cubrir el costo de esta membresía.", "¡Error!");
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

imprimirResumen3() {



            //fechaInicioMembresia
            //fechaVencimientoMembresia



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
                              <td>${this.datosTicket.fechaInicioMembresia}</td>
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
          this.spinner.hide(); // ⬅️ Se oculta después de imprimir
          this.cancelDialogo();
        };

        image.onerror = (error) => {
          console.error("Error al cargar la imagen:", error);
          ventanaImpresion.print();
          ventanaImpresion.close();
          this.spinner.hide(); // ⬅️ Se oculta después de imprimir
          this.cancelDialogo();
        };
      } else {
        ventanaImpresion.print();
        ventanaImpresion.close();
        this.spinner.hide(); // ⬅️ Se oculta después de imprimir
        this.cancelDialogo();
      }
    }
  } // Cierre correcto de la función

  emitEnventMethod(button: string){

    const modalId = 'ModalEmergenteInfoCliente'; // Identificador único del modal
    const data = {boton:button }; // Datos opcionales
  
    this.eventCommunicationService.triggerEvent(modalId, data); // Emitir evento
  }
  

}
