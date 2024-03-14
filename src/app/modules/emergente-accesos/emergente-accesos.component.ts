import { Component, OnInit, ElementRef, Inject, ViewChild} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA,MatDialog } from '@angular/material/dialog';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import { HuellaService } from '../../service/huella.service';
import { interval, Subscription } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { EmergenteAperturaPuertoSerialComponent } from '../emergente-apertura-puerto-serial/emergente-apertura-puerto-serial.component';
import { ToastrService } from 'ngx-toastr';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-emergente-accesos',
  templateUrl: './emergente-accesos.component.html',
  styleUrls: ['./emergente-accesos.component.css']
})
export class EmergenteAccesosComponent implements OnInit{

  IdFormControl = new FormControl('');
  matcher = new MyErrorStateMatcher();
  clienteIdControl = new FormControl();
  cliente: any;
  img:string =  'https://';
  private subscription: Subscription = new Subscription(); // Inicializar la propiedad subscription
  idGuardado: any; // Variable para almacenar el ID recibido la primera vez
  //realizandoBusqueda: boolean = false;
  @ViewChild('inputField') inputField!: ElementRef;

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
  portIsOpen: boolean = false;
  clientSelected: boolean = false;


  constructor(
    public dialogo: MatDialogRef<EmergenteAccesosComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string,
    private serviceHuella: HuellaService,
    public dialog: MatDialog,
    private toastr: ToastrService
    ) {
      this.clientSelected = false;
     }

    ngOnInit(): void {
      // Obtener el ID la primera vez y guardarlo en la variable idGuardado
      this.serviceHuella.ultimoAcceso().subscribe((data: any) => {
        this.cliente = data.cliente;
        this.idGuardado = this.cliente.ID_Cliente;
        this.dialogo.updateSize('600px', 'auto');
      });
    
      // Ejecutar la tarea cada 5 segundos
      this.subscription = interval(5000).pipe(
        startWith(0),
        switchMap(() => this.serviceHuella.ultimoAcceso())
      ).subscribe((data: any) => {
        // Solo actualiza si el idFormControl está vacío
        if (!this.IdFormControl.value) {
          this.cliente = data.cliente;
          // Comparar el ID recibido con el ID guardado
          if (this.cliente.ID_Cliente !== this.idGuardado) {
            // Si son diferentes, actualizar la información y guardar el nuevo ID
            this.idGuardado = this.cliente.ID_Cliente;
            this.dialogo.updateSize('600px', 'auto');
          }
        }
      });
    }
  
    ngOnDestroy(): void {
      // Liberar la suscripción al destruir el componente
      this.subscription.unsubscribe();
    }
  
    cerrarDialogo(): void {
      this.cerrarPuertoSerial().then(() => {
        this.dialogo.close(true);
      }).catch((error) => {
        console.error('Error al cerrar el puerto serie:', error);
        this.dialogo.close(true);
      });
    }

    async cerrarPuertoSerial(): Promise<void> {
      if (!this.selectedPort) {
        console.log('No hay puerto abierto');
        return;
      }
    
      try {
        // Cancela las operaciones de escritura pendientes
        if (this.writer) {
          await this.writer.abort();
          this.writer = null;
        }
    
        // Cancela las operaciones de lectura pendientes
        if (this.reader) {
          await this.reader.cancel();
          await this.reader.releaseLock();
          this.reader = null;
        }
    
        // Cierra el puerto serial
        await this.selectedPort.close();
        this.selectedPort = null;
        console.log('Puerto serie cerrado correctamente');
      } catch (error) {
        console.error('Error al cerrar el puerto serie:', error);
      }
    }
    
  
    buscarCliente(): void {
      const clienteId = this.IdFormControl.value as string; // Utiliza IdFormControl para obtener el valor del campo de entrada
      if (clienteId) {
        this.serviceHuella.accesoID(clienteId)
          .subscribe(
            (data: any) => {
              if(data){
                this.clientSelected = true;
                this.cliente = data.cliente; // Asigna directamente los datos del cliente
                console.log("info: ", this.cliente);
                console.log("el id del cliente es: ", this.cliente.ID);
                // Ajusta el tamaño del diálogo después de que se han cargado los datos del cliente
                this.dialogo.updateSize('600px', 'auto');
              }
            },
            error => {
              console.error('Error al buscar cliente:', error);
            }
          );
      }
    }
    
  //para mandar la solicitud para abrir torniquete
  accesoManual(): void {
    this.IdFormControl.setValue('');
    if (this.inputField) {
      this.inputField.nativeElement.value = '';
    }
  }

  /*sendSerialData() {
    // Verifica si el puerto ya está abierto
      if (this.selectedPort) {
        this.serviceHuella.insertarAsistencia(this.cliente.ID).subscribe((data: any) => {
          console.log("data: ", data);
          if(data.status == "success"){
            this.enviarDatosPorPuertoSerial();
          }
        });
        this.enviarDatosPorPuertoSerial();
      } else {
        this.openSerialPort();
      }
  }*/


  sendSerialData() {
    if (this.selectedPort) {
      if (this.clientSelected) {
        // Se ha seleccionado un cliente, enviar datos por el puerto serial
        this.serviceHuella.insertarAsistencia(this.cliente.ID).subscribe((data: any) => {
          if(data){
            this.enviarDatosPorPuertoSerial();
            console.log("data: ", data);
            this.IdFormControl.setValue('');
          }
          /*if(data.status == "success"){
            this.enviarDatosPorPuertoSerial();
          }*/
        });
      } else {
        // No se ha seleccionado un cliente, mostrar un mensaje de error
        console.error('No se ha seleccionado un cliente para acceder.');
        this.toastr.error('Selecciona un cliente porfavor!', 'Error');
        // Aquí puedes mostrar un mensaje o realizar la acción que desees
      }
    } else {
      this.openSerialPort();
    }
  }
  
  
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


  async openSerialPort() {
    if ('serial' in navigator) {
      try {
        // Solicita abrir el puerto
        const port = await (navigator as any).serial.requestPort();
  
        // Abre el puerto antes de obtener el escritor y el lector
        await port.open({ baudRate: 9600 });
  
        // Almacena el puerto seleccionado y los objetos writer y reader
        this.selectedPort = port;
        console.log('Puerto serie abierto:', port.getInfo());
        this.writer = port.writable.getWriter();
        this.reader = port.readable.getReader();
        console.log('Puerto serie abierto:', port);
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
    //this.dialogo.close(true);
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
