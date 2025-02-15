import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { EmergenteCargarFotoComponent } from '../emergente-cargar-foto/emergente-cargar-foto.component';
import { PagoMembresiaEfectivoService } from '../../service/pago-membresia-efectivo.service';
import { MatPaginator } from '@angular/material/paginator'; //para paginacion en la tabla
import { MatTableDataSource } from '@angular/material/table'; //para controlar los datos del api y ponerlos en una tabla
import { EmergenteAperturaPuertoSerialComponent } from '../emergente-apertura-puerto-serial/emergente-apertura-puerto-serial.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MensajeEmergenteComponent } from '../mensaje-emergente/mensaje-emergente.component';
import { NgxSpinnerService } from "ngx-spinner";
import { MensajeEliminarComponent } from "../mensaje-eliminar/mensaje-eliminar.component";
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { RestablecerContraComponent } from '../restablecer-contra/restablecer-contra.component';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MensajeDesactivarComponent } from "../mensaje-desactivar/mensaje-desactivar.component";

import { ColaboradorService } from './../../service/colaborador.service';

import { EventCommunicationServiceService } from '../../service/event-communication-service.service';


@Component({
  selector: 'app-emergente-info-cliente',
  templateUrl: './emergente-info-cliente.component.html',
  styleUrls: ['./emergente-info-cliente.component.css']
})

export class EmergenteInfoClienteComponent implements OnInit{
  url: string = `Finger://?idCliente=${this.data.idCliente}&idSucursal=${this.data.idSucursal}`;
  productos:any;
  currentDate: Date = new Date();
  duracion: any;
  photo: any;
  huella: any;
  img = 'https://';

  imgBase= 'https://';
  dataSource: any;
  displayedColumns: string[] = [
    'ID',
    'Nombre',
    'Membresía',
    'Precio',
    'Duración',
    'Fecha Inicio',
    'Fecha Fin',
    'Status',
    'Eliminar',
  ];
  membresiaHisto: any;
  item: any;

  isActive: boolean = true;
  mostrarEstatus: boolean = true;
  mostrarRestablecer: boolean = true;



  @ViewChild('paginatorHistorialMembre', { static: true }) paginator!: MatPaginator;
  form: FormGroup;

  constructor(public dialog: MatDialog, private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private pagoService: PagoMembresiaEfectivoService,
    private toastr: ToastrService,
    private auth: AuthService,
    public dialogo: MatDialogRef<EmergenteInfoClienteComponent>,
    private http: ColaboradorService,
    private eventCommunicationService: EventCommunicationServiceService,
   
    @Inject(MAT_DIALOG_DATA) public data: any) {

      const sanitizeValue = (value: any): string => {
        return (value === null || value === 'null') ? '' : value;
      };

      // Inicializar el formulario
      this.form = this.fb.group({
        id_cliente: [sanitizeValue(this.data.idCliente), Validators.required],
        id_bodega:[this.data.idSucursal],
        estafeta: [sanitizeValue(this.data.estafeta), Validators.required],
        nombre: [sanitizeValue(this.data.nombre), Validators.required],
        telefono: [sanitizeValue(this.data.telefono)],
        correo: [sanitizeValue(this.data.email)] ,
        password:[]
      });
    }


  cerrarDialogo(): void {
    this.dialogo.close(true);
  }

  ngOnInit() {
    const dato = this.auth.idUser.getValue();
    const dato2 = Number(this.data.idCliente);
    const rol = this.data.rol;

    this.mostrarEstatus = dato !== dato2 && !this.isRecep() && rol !== 'Cliente';
    this.mostrarRestablecer = !this.isRecep() && rol !== 'Cliente';

    this.duracion = this.data.duracion + ' ' + 'días';
    this.photo = this.formatUrl(this.data.foto);
    this.huella = this.data.huella;
    this.productos = JSON.parse(this.data.productos);
    /*this.pagoService.histoClienteMemb(this.data.idCliente).subscribe((respuesta) => {
      this.membresiaHisto = respuesta;
      this.dataSource = new MatTableDataSource(this.membresiaHisto);
      this.dataSource.paginator = this.paginator;
    }); */
    this.UserHIstorial(this.data.idCliente);



  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  isSupadmin(): boolean {
    return this.auth.isSupadmin();
  }

  isRecep(): boolean {
    return this.auth.isRecepcion();
  }



  duracionCalculo2(fechaInicio: string, fechaFin: string) {
    const fechaInicial = new Date(fechaInicio); // Fecha de inicio proporcionada
    const fechaFinal = new Date(fechaFin);     // Fecha de fin proporcionada
    const hoy = new Date();                    // Fecha actual

    // Ajustar las horas
    fechaInicial.setHours(0, 1, 0, 0);  // Inicio a las 00:01
    fechaFinal.setHours(23, 59, 0, 0);  // Fin a las 23:59
    hoy.setHours(0, 0, 0, 0);           // Hoy a las 00:00

    // Comparar fechaInicio con la fecha actual
    const fechaBase = fechaInicial >= hoy ? fechaInicial : hoy;

    // Calcular la diferencia de tiempo entre fechaFinal y fechaBase
    const diferenciaTiempo = fechaFinal.getTime() - fechaBase.getTime();

    // Convertir la diferencia de milisegundos a días
    const diferenciaDias = diferenciaTiempo / (1000 * 3600 * 24);

    // Aplicar la lógica de redondeo
    let diasCalculados;
    if (diferenciaDias > 0 && diferenciaDias < 1) {
        diasCalculados = Math.ceil(diferenciaDias); // Redondear hacia arriba si está entre 0 y 1
    } else if (diferenciaDias >= 1) {
        diasCalculados = Math.floor(diferenciaDias); // Redondear hacia abajo si es mayor a 1
    } else {
        diasCalculados = 0; // Si la diferencia es negativa o 0
    }

    return diasCalculados;
}


MembershipDuration(fechaInicio: string, fechaFin: string) {
  const fechaInicial = new Date(fechaInicio); // Fecha de inicio proporcionada
  const fechaFinal = new Date(fechaFin);     // Fecha de fin proporcionada

  // Ajustar las horas
  fechaInicial.setHours(0, 0, 0, 0);  // Inicio a las 00:00
  fechaFinal.setHours(23, 59, 59, 999); // Fin a las 23:59:59.999

  // Calcular la diferencia de tiempo entre fechaFinal y fechaInicial
  const diferenciaTiempo = fechaFinal.getTime() - fechaInicial.getTime();

  // Convertir la diferencia de milisegundos a días
  const diferenciaDias = diferenciaTiempo / (1000 * 3600 * 24);

  // Aplicar redondeo hacia abajo
  let diasCalculados;
  if (diferenciaDias > 0) {
      diasCalculados = Math.floor(diferenciaDias); // Redondear hacia abajo si es mayor a 1
  } else {
      diasCalculados = 0; // Si la diferencia es negativa o 0
  }

  return diasCalculados;
}


  abrirDialogFoto(data: any): void {
    this.dialogo.close(true);
    this.dialog.open(EmergenteCargarFotoComponent, {
      data: {
        clienteID: `${data.idCliente}`
      },
      disableClose: true
    })
    .afterClosed()
    .subscribe((cerrarDialogo: Boolean) => {
      if (cerrarDialogo) {

      } else {

      }
    });
  }

  abrirPuertoSerial(data: any): void {
    this.dialogo.close(true);
    this.dialog.open(EmergenteAperturaPuertoSerialComponent, {
      data: {
        clienteID: `${data.idCliente}`
      },
    })
    .afterClosed()
    .subscribe((cerrarDialogo: Boolean) => {
      if (cerrarDialogo) {

      } else {

      }
    });
  }

  borrarSucursal(id: any) {

    this.dialog.open(MensajeEliminarComponent, {
      data: `¿Desea eliminar la membresía de tu socio?`,
    })
    .afterClosed()
    .subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.pagoService.deleteMembresia(id).subscribe(
          (respuesta) => {

            if (respuesta === 1) { // Validar si la respuesta es 1
              this.toastr.success('Registro eliminado exitosamente', 'Éxito', {
                positionClass: 'toast-bottom-left',


              });
              this.UserHIstorial(this.data.idCliente);
              this.emitEnventMethod('Borrar usuario')
            } else { // Respuesta no exitosa
              this.toastr.error('No se pudo eliminar el registro', 'Error', {
                positionClass: 'toast-bottom-left',
              });
            }
          },
          (error) => { // Error en la solicitud HTTP
            this.toastr.error('Ocurrió un error al eliminar el registro', 'Error', {
              positionClass: 'toast-bottom-left',
            });
          }
        );
      }
    });
  }

  UserHIstorial(clave: string): void {
    this.pagoService.obtenerActivos(this.auth.idGym.getValue()).subscribe(
      (respuesta: any) => {
        // Filtramos los datos para obtener solo el usuario con la clave proporcionada
        const datosFiltrados = respuesta.data.filter((item: any) => item.clave === clave);
        console.log('datos filtrados',datosFiltrados)

         // Filtramos solo los registros donde id_pedido esté presente (no sea null ni undefined)
         const registrosConPedido = datosFiltrados.filter((item: any) => item.id_pedido);
         console.log(' registrosConPedido',registrosConPedido)


        // Agrupamos los registros por id_pedido directamente (sin aplicar el filtro de conteoPedidos y estatus)
        const agrupadosPorPedido = this.pagoService.agruparPorPedido(registrosConPedido);
        console.log(' agrupadosPorPedido',agrupadosPorPedido)

        const ordenar = agrupadosPorPedido.sort((a, b) => new Date(b.fecha_caducidad).getTime() - new Date(a.fecha_caducidad).getTime());
    
      

        //const ordenar= this.ordenarPedidos(agrupadosPorPedido);
        //console.log(' ordenar',ordenar)
        
        this.dataSource = new MatTableDataSource(ordenar);
        this.dataSource.paginator = this.paginator;
      },
      (error: any) => {

      }
    );


  }


OpenRestablecer(empleados: any) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '70%';
        dialogConfig.disableClose = true;
        dialogConfig.data = empleados;
        this.dialog.open(RestablecerContraComponent, dialogConfig)
          .afterClosed()
          .subscribe((cerrarDialogo: Boolean) => {
            if (cerrarDialogo) {
            }
          });
      }

      onToggle(event: MatSlideToggleChange, idEmpleado: number): void {
        if (!event.checked) {
          const nuevoEstatus = 2;

          const mensaje = '¿Deseas desactivar este usuario? Ten en cuenta que, si lo desactivas, no podrás volver a activarlo.';

          const dialogRef = this.dialog.open(MensajeDesactivarComponent, {
            data: { mensaje: mensaje, idEmpleado: idEmpleado },
          });

          console.log(`ID: ${idEmpleado}, Nuevo estatus: ${nuevoEstatus}`);

          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.http.actualizarEstatus(Number(idEmpleado), nuevoEstatus).subscribe((response) => {
                this.cerrarDialogo();
              });
            } else {
              // Si cancela, restablecer el toggle a true
              event.source.checked = true;
            }
          });
        } else {
          //console.log('El estatus no ha sido cambiado a 0 ya que el toggle está activado.');
        }
      }



  actualizarCliente2(): void {

    this.spinner.show();

    if (!this.form.valid) {

      this.toastr.error("El formulario contiene errores. Por favor, revísalo.");
      this.spinner.hide(); // Asegúrate de ocultar el spinner en este caso
      return;
    }
    this.generarContraseña(9);



    const clienteData = {
      id_cliente: this.form.value.id_cliente,
      estafeta: this.form.value.estafeta,
      id_bodega: this.form.value.id_bodega,
      correo: this.form.value.correo || null,
      telefono: this.form.value.telefono || null,
      nombre: this.form.value.nombre || null,
      password: this.form.value.password || null
    };

    this.pagoService.actualizaDatosCliente2(clienteData).subscribe({
      next: (resultData) => {


        if (resultData?.Estado === 1) {


          if (resultData.Mensaje === 'Actualización de datos exitosa\nContraseña actualizada correctamente.') {

            this.enviarMensajeWhatsApp(this.form.value.telefono, this.form.value.correo, this.form.value.password);
          }

          this.spinner.hide();
          this.cerrarDialogo();
          this.dialog.open(MensajeEmergenteComponent, {
            data: resultData.Mensaje || 'Datos actualizados satisfactoriamente'
          }).afterClosed()
            .subscribe(() => {
              this.emitEnventMethod('Actualizar Cliente')
            
            });

        } else {
          this.spinner.hide();
          this.toastr.error(resultData.Mensaje || 'Hubo un error al actualizar los datos.');

        }
      },
      error: (error) => {
        this.spinner.hide();


        this.toastr.error('Ocurrió un error al procesar la solicitud. Por favor, intenta nuevamente.');
      },
    });
  }


// Método para verificar si los campos no son nulos ni cadenas vacías
private verificarCamposNoNulosYDiferentesDeVacio(): boolean {
  const esCampoValido = (campo: string | undefined): boolean => !!campo && campo.trim() !== '';

  const telefonoEsValido = esCampoValido(this.form.value.telefono);
  const correoEsValido = esCampoValido(this.form.value.correo);

  // Retornar true solo si ambos campos son válidos
  return telefonoEsValido && correoEsValido;
}

// Método para generar una contraseña
generarContraseña(longitud: number): void {
  if (this.verificarCamposNoNulosYDiferentesDeVacio()) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    const contraseña = Array.from({ length: longitud }, () => caracteres.charAt(Math.floor(Math.random() * caracteres.length))).join('');

    // Actualizar el valor del campo `password` en el formulario
    this.form.patchValue({ password: contraseña });
  } else {
    // Si no se cumple la condición, asegurar que el campo `password` esté vacío
    this.form.patchValue({ password: '' });
  }
}

  enviarMensajeWhatsApp(telefono: string, correo: string, password: string) {
    if(telefono && correo){
      const mensaje = `Correo: ${correo}, Contraseña: ${password}`;
      const url = `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank');
    }
  }

    // Método para formatear la cadena
    formatUrl(foto: string): string {
      // Verifica si la cadena es una URL completa
      if (foto && (foto.startsWith('http') || foto.startsWith('https'))) {
        return foto; // Si es una URL completa, devuelve tal cual
      } else {
        // Si no es una URL completa, concatenarla con la base
        return this.imgBase + foto;
      }

    }

    ordenarPedidos(array: any[]): any[] {
      console.log("📌 Array original:", JSON.stringify(array, null, 2));
    
      // 1️⃣ Separar en grupos según las condiciones dadas
      const grupo1 = array.filter(p => p.pedidoActual === "1" && p.estatus === "1");
      const grupo2 = array.filter(p => p.pedidoActual === "0" && p.estatus === "1");
      const grupo3 = array.filter(p => p.estatus === "2");
      const grupo4 = array.filter(p => p.estatus === "0");
    
      console.log("🔹 Grupo 1 (pedidoActual=1, estatus=1):", grupo1);
      console.log("🔹 Grupo 2 (estatus=1, pedidoActual=0):", grupo2);
      console.log("🔹 Grupo 3 (estatus=2):", grupo3);
      console.log("🔹 Grupo 4 (estatus=0):", grupo4);
    
      // 2️⃣ Ordenar cada grupo según las reglas
      grupo1.sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime());
      grupo2.sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime());
      grupo3.sort((a, b) => new Date(b.fecha_caducidad).getTime() - new Date(a.fecha_caducidad).getTime());
      grupo4.sort((a, b) => new Date(b.fecha_caducidad).getTime() - new Date(a.fecha_caducidad).getTime());
    
      console.log("✅ Grupo 1 Ordenado:", grupo1);
      console.log("✅ Grupo 2 Ordenado:", grupo2);
      console.log("✅ Grupo 3 Ordenado:", grupo3);
      console.log("✅ Grupo 4 Ordenado:", grupo4);
    
      // 3️⃣ Combinar los grupos en un solo array
      const resultado = [...grupo1, ...grupo2, ...grupo3, ...grupo4];
    
      console.log("📌 Resultado Final Ordenado:", resultado);
      return resultado;
    }
    
    
    


    emitEnventMethod(button: string){

  const modalId = 'ModalEmergenteInfoCliente'; // Identificador único del modal
  const data = {boton:button }; // Datos opcionales

  this.eventCommunicationService.triggerEvent(modalId, data); // Emitir evento
}


  }
