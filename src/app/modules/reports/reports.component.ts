import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Chart from 'chart.js/auto';
import { format } from 'date-fns';
import { AuthService } from 'src/app/service/auth.service';
import { SerialService } from 'src/app/service/serial.service';
import * as SerialPort from 'serialport';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  form: FormGroup;
  listaSucursales: any;
  existe_grtafica!: Chart;

  constructor(private fb: FormBuilder, private service: AuthService, private serialService: SerialService) {
    this.form = this.fb.group({
      sucursal: [""],
      p_inicial: ["", Validators.required],
      p_final: ["", Validators.required]
    });
  }

  ngOnInit(): void {
    if ("serial" in navigator) {
      // The Web Serial API is supported.
      console.log("Es compatible...")
    }

    //Traer lista de sucursales 
    this.service.list_sucursales().subscribe({
      next: (resultData) => {
        this.listaSucursales = resultData;
      }, error: (error) => { console.log(error); }
    });

  }

  //Dar formato a fecha
  formatearFecha(fechaOriginal: string): string {
    // Convertir la fecha a un objeto Date
    const fechaObj = new Date(fechaOriginal);

    // Formatear la fecha en el formato YYYY/MM/DD
    const fechaFormateada = format(fechaObj, 'yyyy-MM-dd');
    return fechaFormateada;
  }

  //Consultar reporte
  consult(): void {
    //Llamar funcion para dar formato a fecha
    let inicial = this.formatearFecha(this.form.value.p_inicial);
    let final = this.formatearFecha(this.form.value.p_final);
    this.form.value.p_inicial = inicial;
    this.form.value.p_final = final;
    console.log(this.form.value);
    this.service.chart_sucursales(this.form.value).subscribe({
      next: (resultData) => {
        console.log(resultData);
        // Extraer los nombres de gimnasios y las ventas
        const sucursalesResult = resultData.map((item: any) => item.nombreGym);
        const ventasResult = resultData.map((item: any) => item.ventas);
        this.showChart(sucursalesResult, ventasResult);
      }, error: (error) => { console.log(error); }
    });
  }

  //Graficar datos
  showChart(sucursales: any, ventas: any): void {

    if (this.existe_grtafica) {
      this.existe_grtafica.destroy();
    }

    this.existe_grtafica = new Chart("myChart", {
      type: 'bar',
      data: {
        labels: sucursales,
        datasets: [{
          label: 'Periodo: ' + this.form.value.p_inicial + ' - ' + this.form.value.p_final,
          data: ventas,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 205, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(201, 203, 207, 0.2)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
            'rgb(201, 203, 207)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }


  //Pruebas para manejar el puerto serial
  async onConnectButtonClick(): Promise<void> {
    await this.serialService.connectAndSendData();
  }

  private selectedPort: any;
  private selectedPort2: SerialPort | null = null;
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
  


}
