import { Component, OnInit, Inject, EventEmitter, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { PagoMembresiaEfectivoService } from '../../service/pago-membresia-efectivo.service';
import { MensajeEmergenteComponent } from '../mensaje-emergente/mensaje-emergente.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-form-pago-emergente',
  templateUrl: './form-pago-emergente.component.html',
  styleUrls: ['./form-pago-emergente.component.css']
})
export class FormPagoEmergenteComponent implements OnInit{

  idSucursal: number = 0;
  membresias: any[] = [];
  membresiaSeleccionada: any;
  idMembresiaSelec: any;
  nombreMembresia: any;
  precio: any;
  duracion: any;
  moneyRecibido: number = 0; // =0
  ticketInfo: any;
  @Output() actualizarTablas = new EventEmitter<boolean>();
  

  constructor(
    private toastr: ToastrService, 
    public dialog: MatDialog, 
    @Inject(MAT_DIALOG_DATA)
  public data: any,
    private membresiaService: PagoMembresiaEfectivoService, 
    public dialogo: MatDialogRef<FormPagoEmergenteComponent>,
  ) { }

              
  ngOnInit(): void {
    console.log(this.data, "data");
    // Llamar al servicio para obtener la lista de membresías
    this.precio = 0;
    this.duracion = 'días';
    //console.log('el detalle membresia del cliente es: ', this.data.detMemID )
    /*if(this.data.action == 'Online' ){
      this.idMembresiaSelec = this.data.idMem;
      console.log('membresia seleccionada: ', this.idMembresiaSelec);
    }*/

    //console.log('ID del cliente:', this.data.idCliente);

    this.getMembresiasLista(this.data.idSucursal);
  }

  getMembresiasLista(idgimnasio: number): void {
    this.membresiaService.membresiasLista(idgimnasio)
      .subscribe(data => {
        this.membresias = data;
      }, error => {
        console.error('Error al obtener la lista de membresías:', error);
      });
  }

  onMembresiaChange(): void {
    this.membresiaService.membresiasInfo(this.membresiaSeleccionada).subscribe((resultado)=> {
      this.duracion = `${resultado.Duracion} días`;
      this.precio = `${resultado.Precio}`;
      this.nombreMembresia = `${resultado.Membresia}`;
    });
  }

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
  
    imprimirResumen() {       
      if (this.precio <= this.moneyRecibido) {
        const PrecioCalcular = this.moneyRecibido - this.precio ;
        this.membresiaService.ticketPagoInfo(this.data.idCliente).subscribe((respuesta) => {
          if (respuesta && respuesta.length > 0) {
            const ticketInfo = respuesta[0];
            const totalEnPesos = this.convertirNumeroAPalabrasPesos(this.precio);
            const totalEnPesosRecibido = this.convertirNumeroAPalabrasPesos(this.moneyRecibido);
            const totalEnPesosCambio = this.convertirNumeroAPalabrasPesos(PrecioCalcular);
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
                  <title>Ticket de Compra</title>
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
                  </style>
                </head>
                <body> 
                <div class="ticket">
                <div style="display: flex; justify-content: center; align-items: center;">
                  <img src='../../../../../../assets/img/logo.jpeg)' alt="Logo" style="max-width: 300px; height: auto;">
                </div>
                    <h1>Ticket de Compra</h1>
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
              ventanaImpresion.print();
              ventanaImpresion.close();
            } else {
              console.error('No se pudo abrir la ventana de impresión.');
            }
          } else {
            console.error('La respuesta del servicio no contiene los datos necesarios para generar el ticket.');
          }
        });
      
      } else {
        this.toastr.error("Ingresa el pago");
      }
    }
  
    successDialog(): void {    
      if (this.membresiaSeleccionada != undefined){
        //console.log('membresia seleccionada antes de pagar:', this.membresiaSeleccionada );
        if(this.moneyRecibido >= this.precio){
          const PrecioCalcular = this.moneyRecibido - this.precio;
          this.membresiaService.actualizacionMemebresia(this.data.idCliente, this.membresiaSeleccionada, this.data.detMemID).subscribe((dataResponse: any)=> {
          this.actualizarTablas.emit(true);
          
          this.dialogo.close(true);
          
          this.dialog.open(MensajeEmergenteComponent, {
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
      
        }else{
          this.toastr.error('No alcanza para pagar esta membresia', 'Error!!!');
        }
      }
      else {
        this.toastr.warning('Selecciona una membresía', 'Alerta!!!');
      }
    }
}
