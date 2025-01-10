import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
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
  @ViewChild('paginatorHistorialMembre', { static: true }) paginator!: MatPaginator;
  form: FormGroup;

  constructor(public dialog: MatDialog, private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private pagoService: PagoMembresiaEfectivoService,
    private toastr: ToastrService,
    private auth: AuthService,
    public dialogo: MatDialogRef<EmergenteInfoClienteComponent>,
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
    console.log('idCliente', this.data.idCliente);
    console.log('data de lista mebresias:',this.data)

  }
// en desuhso
  estaEnRango(fechaInicio: string, fechaFin: string): boolean {
    const fechaInicioDate = this.parseFecha(fechaInicio);
    const fechaFinDate = this.parseFecha(fechaFin);
    return this.currentDate >= fechaInicioDate && this.currentDate <= fechaFinDate;
  }

  duracionCalculo(fechaFin: string){
    const fechaFinal= new Date (fechaFin)
    const hoy = new Date();  // Fecha actual
    hoy.setHours(0, 0, 0, 0); // Establecer a las 00:00 para evitar que las horas afecten el cálculo
    fechaFinal.setHours(0, 0, 0, 0);

    const diferenciaTiempo = fechaFinal.getTime() - hoy.getTime();  // Diferencia en milisegundos

    // Convertir la diferencia de milisegundos a días completos
    const diferenciaDias = Math.floor(diferenciaTiempo / (1000 * 3600 * 24));  // Redondear hacia abajo

    // Si la diferencia es menor a 0, devolver 0
    return diferenciaDias < 0 ? 0 : diferenciaDias;
  
    
  }

  duracionCalculo2(fechaInicio: string, fechaFin: string) {
    const fechaInicial = new Date(fechaInicio); // Fecha de inicio proporcionada
    const fechaFinal = new Date(fechaFin);     // Fecha de fin proporcionada
    const hoy = new Date();                    // Fecha actual

    // Ajustar las horas a 00:00 para evitar que las horas afecten el cálculo
    fechaInicial.setHours(0, 0, 0, 0);
    fechaFinal.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);

    // Comparar fechaInicio con la fecha actual
    const fechaBase = fechaInicial >= hoy ? fechaInicial : hoy;

    // Calcular la diferencia de tiempo entre fechaFinal y fechaBase
    const diferenciaTiempo = fechaFinal.getTime() - fechaBase.getTime();

    // Convertir la diferencia de milisegundos a días completos
    const diferenciaDias = Math.floor(diferenciaTiempo / (1000 * 3600 * 24));

    // Si la diferencia es menor a 0, devolver 0
    return diferenciaDias < 0 ? 0 : diferenciaDias;
}




  //En desuhso
  private parseFecha(fecha: string): Date {
    const partes = fecha.split('/');
    const fechaLocal = new Date(+partes[2], +partes[1] - 1, +partes[0]);
    return new Date(fechaLocal.getTime() + fechaLocal.getTimezoneOffset() * 60000);
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


  // NO se USA o lo dejaron incompleto (borrar)
  abrirDialogCapturarHuella(data: any): void {
  }


  //No se usa para nada  (borrar)
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
 
  
  actualizar(): void {
    if(!this.form.valid){
      return;
    }
    this.spinner.show();
    console.log(this.form.value);
    this.pagoService.actualizaDatosCliente(this.form.value).subscribe({
      next: (resultData) => {
        this.spinner.hide();
        this.cerrarDialogo();
        this.dialog.open(MensajeEmergenteComponent, {
          data: `Datos actualizados satisfacoriamente`,
        })
        .afterClosed()
        .subscribe((cerrarDialogo: Boolean) => {
          if (cerrarDialogo) {

          } else {
    
          } 
        });
      }, error: (error) => { console.log(error); }
    });
  } 

    actualizarCliente(): void {
      console.log(this.form.value);
      this.spinner.show();
      
    
      if (!this.form.valid) {
        console.log("Formulario no válido");
        return;
      }
    
      // Mostrar spinner mientras se procesa la solicitud
    
    
      // Capturar los valores del formulario
   
    
      // Llamar al servicio para actualizar los datos del cliente
      this.pagoService.actualizaDatosCliente(this.form.value).subscribe({
        next: (resultData) => {
         
          console.log(resultData);
    
          // Verificar el estado de la respuesta del servidor
          if (resultData?.success === 1) {
            console.log(1)
            // Caso exitoso: Datos actualizados satisfactoriamente
           // this.dialog.open(MensajeEmergenteComponent, {
             // data: resultData.Mensaje || `Datos actualizados satisfactoriamente`,
            //});

            // this.cerrarDialogo();
          

            const estado = resultData.data?.Estado;

            if (estado === 1) {

              this.spinner.hide();
              this.cerrarDialogo();
              this.dialog.open(MensajeEmergenteComponent, {
                data: `Datos actualizados satisfacoriamente`,
              })
              .afterClosed()
              .subscribe((cerrarDialogo: Boolean) => {
                if (cerrarDialogo) {
      
                } else {
          
                } 
              });



              console.log("Actualizacion con exito");
            } else {
              this.spinner.hide();
              this.dialog.open(MensajeEmergenteComponent, {
                data: `Clave existente o sin cambios`,
                })

              console.log("Clave existente o sin cambios");
            }
        
          } else {

            console.log('error')
            // Otro caso de error lógico
            //this.dialog.open(MensajeEmergenteComponent, {
              //data: resultData?.Mensaje || `Hubo un problema al actualizar los datos.`,
            //});
          }
        },
        error: (error) => {
          // Ocultar el spinner y manejar errores de conexión
          this.spinner.hide();
          console.error(error);
    
          // Mostrar mensaje de error genérico
         this.dialog.open(MensajeEmergenteComponent, {
           data: `Ocurrió un error al procesar la solicitud. Por favor, intenta nuevamente.`,
          });
        },
      });
    }
    

// no hace nada (borrar) (hacer)

  capturarHuella(): void {
    this.spinner.show();

    setTimeout(() => {
      this.spinner.hide();
    }, 550);
  }

  borrarSucursal(id: any) {
    console.log(id);
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
  


  isAdmin(): boolean {
    return this.auth.isAdmin();
  }
  
  isSupadmin(): boolean {
    return this.auth.isSupadmin();
  }

  isRecep(): boolean {
    return this.auth.isRecepcion();
  }
/*
  UserHIstorial(clave: string) {
    this.pagoService.obtenerActivos(this.auth.idGym.getValue()).subscribe(
      (respuesta: any) => {
    
          const datosFiltrados = respuesta.data.filter((item: any) => item.clave === clave);
          this.membresiaHisto = datosFiltrados;
          console.log("Datos filtrados:", this.membresiaHisto);
    
  
       
        this.dataSource = new MatTableDataSource(this.membresiaHisto);
        this.dataSource.paginator = this.paginator;
      },
      (error: any) => {
        console.error("Error al obtener activos:", error);
      }
    );
  }
  
  



/*
UserHIstorial(clave: string) {
  this.pagoService.obtenerActivos(this.auth.idGym.getValue()).subscribe(
    (respuesta: any) => {
      // Filtrar por la clave proporcionada
      const datosFiltrados = respuesta.filter((item: any) => item.clave === clave);

      // Guardar el resultado filtrado en la variable deseada
      this.membresiaHisto = datosFiltrados;


      

      // Si necesitas usar MatTableDataSource, puedes descomentar las líneas
      // this.dataSource = new MatTableDataSource(this.membresiaHisto);
      // this.dataSource.paginator = this.paginator;

      console.log("Datos filtrados:", this.membresiaHisto);
    },
    (error: any) => {
      console.error("Error al obtener activos:", error);
    }
  );
} */


  UserHIstorial(clave: string): void {
    this.pagoService.obtenerActivos(this.auth.idGym.getValue()).subscribe(
      (respuesta: any) => {
        // Filtramos los datos para obtener solo el usuario con la clave proporcionada
        const datosFiltrados = respuesta.data.filter((item: any) => item.clave === clave);

         // Filtramos solo los registros donde id_pedido esté presente (no sea null ni undefined)
         const registrosConPedido = datosFiltrados.filter((item: any) => item.id_pedido);
  
        // Agrupamos los registros por id_pedido directamente (sin aplicar el filtro de conteoPedidos y estatus)
        const agrupadosPorPedido = this.agruparPorPedido(registrosConPedido);

        
  
        // Asignamos los resultados a la variable de la tabla
        this.membresiaHisto = agrupadosPorPedido;
        console.log("membresiaHisto final (agrupados por pedido):", this.membresiaHisto);
  
        // Actualizamos el DataSource de la tabla
        this.dataSource = new MatTableDataSource(this.membresiaHisto);
        this.dataSource.paginator = this.paginator;
      },
      (error: any) => {
        console.error("Error al obtener activos:", error);
      }
    );
    console.log('executed');
  }
  
  // Función para agrupar por pedido
  private agruparPorPedido(clientes: any[]): any[] {
    const agrupadosPorPedido: { [key: string]: any } = {};
  
    clientes.forEach(cliente => {
      const idPedido = cliente.id_pedido;
  
      if (!agrupadosPorPedido[idPedido]) {
        agrupadosPorPedido[idPedido] = {
          clave: cliente.clave,
          estafeta: cliente.estafeta,
          telefono: cliente.telefono,
          fotoUrl: cliente.fotoUrl,
          Correo: cliente.Correo,
          nombreCompleto: cliente.nombreCompleto,
          fechaRegistro: cliente.fechaRegistro,
          huella: cliente.huella,
          precioPedido: cliente.precioPedido,
          total: cliente.total,
          membresia: cliente.nombrePromocion ?? `${cliente.marca} - ${cliente.nombreProducto}`,
          correoCliente: cliente.correoCliente,
          id_pedido: cliente.id_pedido,
          fecha_hora_pedido: cliente.fecha_hora_pedido,
          id_bodega: cliente.id_bodega,
          precioCompra: cliente.precioCompra,
          conteoPedidos: cliente.conteoPedidos,
          fecha_inicio: cliente.fecha_inicio,
          fecha_caducidad: cliente.fecha_caducidad,
          idPromocion: cliente.idPromocion,
          nombrePromocion: cliente.nombrePromocion,
          estatus: cliente.estatus,
          productos: [] // Inicializamos un array vacío para los productos
        };
      }
  
      // Agregamos la información del producto al array `productos` correspondiente
      agrupadosPorPedido[idPedido].productos.push({
        id_producto: cliente.id_producto,
        marca: cliente.marca,
        nombreProducto: cliente.nombreProducto,
        idProbob: cliente.idProbob
      });
    });
  
    // Convertimos el objeto agrupado en un array
    return Object.values(agrupadosPorPedido);
  }
  



  


  actualizarCliente2(): void {
   
    this.spinner.show();
  
    if (!this.form.valid) {
      console.log("Formulario no válido");
      this.toastr.error("El formulario contiene errores. Por favor, revísalo.");
      this.spinner.hide(); // Asegúrate de ocultar el spinner en este caso
      return;
    }
    this.generarContraseña(9);
    
    console.log(this.form.value);
  
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
        console.log(resultData);
  
        if (resultData?.Estado === 1) {
          console.log("Actualización exitosa");

          if (resultData.Mensaje === 'Actualización de datos exitosa\nContraseña actualizada correctamente.') {
            console.log("Enviando WhatsApp");
            this.enviarMensajeWhatsApp(this.form.value.telefono, this.form.value.correo, this.form.value.password);
          }
  
          this.spinner.hide();
          this.cerrarDialogo();
          this.dialog.open(MensajeEmergenteComponent, {
            data: resultData.Mensaje || 'Datos actualizados satisfactoriamente'
          }).afterClosed()
            .subscribe(() => {
              // Aquí puedes agregar lógica si es necesario
            });
  
        } else {
          this.spinner.hide();
          this.toastr.error(resultData.Mensaje || 'Hubo un error al actualizar los datos.');
          console.log("Error: " + resultData.Mensaje);
        }
      },
      error: (error) => {
        this.spinner.hide();
        console.error(error);
  
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
  }

