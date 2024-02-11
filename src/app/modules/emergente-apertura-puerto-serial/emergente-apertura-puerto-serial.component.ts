import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PagoMembresiaEfectivoService } from 'src/app/service/pago-membresia-efectivo.service';

@Component({
  selector: 'app-emergente-apertura-puerto-serial',
  templateUrl: './emergente-apertura-puerto-serial.component.html',
  styleUrls: ['./emergente-apertura-puerto-serial.component.css']
})
export class EmergenteAperturaPuertoSerialComponent implements OnInit {
  // Recuperar la fecha actual
  currentDate: Date = new Date();
  // Manejar eventos de puerto serial
  selectedPort: any = null;
  writer: any = null;
  reader: any = null;
  // Manejar estado del puerto
  existsPort: boolean = false;
  // Mostar contenedor si el usuario esta activo
  showContent: boolean= false;
  // Capturar valor de variables pasadas desde el componente padre
  vStatus: string="";
  // Almacenar respuesta del servicio
  membresiaHisto: any;

  constructor( private toastr: ToastrService, private pagoService: PagoMembresiaEfectivoService,
    public dialogo: MatDialogRef<EmergenteAperturaPuertoSerialComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }
    
  ngOnInit(): void {
    console.log(this.data.clienteID);
    this.pagoService.histoClienteMemb(this.data.clienteID).subscribe((respuesta) => {
      console.log('historial:',respuesta);
      this.membresiaHisto = respuesta;
    });
    //this.showContent = this.estaEnRango(this.membresiaHisto.Fecha_Inicio, this.membresiaHisto.Fecha_Fin);
      //this.vStatus = this.membresiaHisto.Status;
  }

  // Cerrar mat-dialod
  cerrarDialogo(): void {
    this.dialogo.close(true);
  }

  // Validacion de status de cliente
  estaEnRango(fechaInicio: string, fechaFin: string): boolean {
    const fechaInicioDate = this.parseFecha(fechaInicio);
    const fechaFinDate = this.parseFecha(fechaFin);
    return this.currentDate >= fechaInicioDate && this.currentDate <= fechaFinDate;
  }

  private parseFecha(fecha: string): Date {
    const partes = fecha.split('/');
    const fechaLocal = new Date(+partes[2], +partes[1] - 1, +partes[0]);
    return new Date(fechaLocal.getTime() + fechaLocal.getTimezoneOffset() * 60000);
  }
  
  // Manejar la apertura del puerto

  // Apertura del puerto 
  async requestSerialPort() {
    if ('serial' in navigator) {
      try {
        if (!this.selectedPort) {
          // Solicita al usuario seleccionar un puerto
          const port = await (navigator as any).serial.requestPort();
          // Abrir puerto
          await port.open({ baudRate: 9600 }); // Cambiar 'baudrate' a 'baudRate'
  
          // Almacenar el puerto seleccionado
          this.selectedPort = port;
  
          // Obtener el escritor (writer) para enviar datos
          const writer = port.writable.getWriter();
  
          // Función para enviar datos
          async function enviarDatos(texto: string) {
            const encoder = new TextEncoder();
            await writer.write(encoder.encode(texto));
            console.log("dato enviado");
          }
  
          // Enviar un texto a través del puerto serie
          enviarDatos("1");
  
          // Obtener el lector (reader) para recibir datos
          const reader = port.readable.getReader();
  
          // Función para leer los datos entrantes
          async function leerDatos() {
            try {
              while (true) {
                const { value, done } = await reader.read();
                if (done) {
                  console.log('Lector finalizado');
                  break;
                }
                console.log('Datos recibidos:', new TextDecoder().decode(value));
              }
            } catch (error) {
              console.error('Error al leer los datos:', error);
            } finally {
              reader.releaseLock();
            }
          }
  
          // Iniciar la lectura de datos
          leerDatos();
  
        }
      } catch (error) {
        console.error('Error al interactuar con el puerto serie:', error);
      }
    }
  }

  // Apeertura del puerto
  async openSerialPort() {
    if ('serial' in navigator) {
      try {
        if (!this.selectedPort) {
          const port = await (navigator as any).serial.requestPort();
          await port.open({ baudRate: 9600 });

          this.selectedPort = port;
          this.writer = port.writable.getWriter();
          this.reader = port.readable.getReader();
        }
      } catch (error) {
        console.error('Error al interactuar con el puerto serie:', error);
      }
    }
  }

  // Enviar datos al puerto abierto
  async enviarDatos(texto: string) {
    const encoder = new TextEncoder();
    await this.writer.write(encoder.encode(texto));
    console.log("enviado");
    this.toastr.success('Apertura de torniquete correcta, puedes acceder!!!', 'Éxito');
    this.dialogo.close(true);
  }

  // Leer respuesta de dispositivo conectado al puerto serial
  async leerDatos() {
    try {
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) {
          console.log('Lector finalizado');
          break;
        }
        console.log('Datos recibidos:', new TextDecoder().decode(value));
      }
    } catch (error) {
      console.error('Error al leer los datos:', error);
    } finally {
      this.reader.releaseLock();
    }
  }

  // Enviar informacion al puerto serial
  enviarDatosPorPuertoSerial() {
    //this.openSerialPort();
    if (this.selectedPort) {
      this.enviarDatos("1");
    } else {
      console.error('El puerto serie no está abierto');
    }
  }

  eventoX(){
    this.openSerialPort();
  }

}
