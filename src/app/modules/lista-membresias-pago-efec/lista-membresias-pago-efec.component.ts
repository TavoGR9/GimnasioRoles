import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { PagoMembresiaEfectivoService } from '../../service/pago-membresia-efectivo.service';
import { MatPaginator } from '@angular/material/paginator'; 
import { MatTableDataSource } from '@angular/material/table'; 
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormPagoEmergenteComponent } from '../form-pago-emergente/form-pago-emergente.component';
import { MensajeListaComponent } from '../ListaClientes/mensaje-cargando.component';
import { listarClientesService } from '../../service/listarClientes.service';
import { ClienteService } from '../../service/cliente.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { EmergenteInfoClienteComponent } from '../emergente-info-cliente/emergente-info-cliente.component';
import { AuthService } from '../../service/auth.service';
import { MensajeEliminarComponent } from "../mensaje-eliminar/mensaje-eliminar.component";

interface ClientesActivos {
  ID: number;
  Nombre: string;
  Sucursal: string;
  Membresia: string;
  Precio: string;
  Fecha_Inicio: string;
  Fecha_Fin: string;
  Status: string;
}
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    formulario: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = formulario && formulario.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}
@Component({
  selector: 'app-lista-membresias-pago-efec',
  templateUrl: './lista-membresias-pago-efec.component.html',
  styleUrls: ['./lista-membresias-pago-efec.component.css'],
  providers: [DatePipe],
})

export class ListaMembresiasPagoEfecComponent implements OnInit {
  form: FormGroup;
  matcher = new MyErrorStateMatcher();
  clientePago: any;
  clienteReenovacion: any;
  cliente: any;
  clienteActivo: ClientesActivos[] = [];  
  dataSource: any; 
  dataSourceActivos: any;
  dataSourceReenovacion: any;
  fechaInicio: Date = new Date('0000-00-00'); 
  fechaFin: Date = new Date('0000-00-00');    
  id: any;
  displayedColumnsActivos: string[] = [
    'Clave',
    'Nombre',
    'Membresia',
    'Precio',
    'Fecha Inicio',
    'Fecha Fin',
    'Estatus',
    //'Dinero Recibido',
    //'Pagar',
    'Pago',
    'Info Cliente',
    'Huella',
    'Rol'
  ];
  dineroRecibido: number = 0; 
  moneyRecibido: number = 0; 
  cash: number = 0; 
  IDvalid: number = 0;
  currentUser: string = '';
  idGym: number = 0;
  private fechaInicioAnterior: Date | null = null;
  private fechaFinAnterior: Date | null = null;
  isLoading: boolean = true; 
  habilitarBoton: boolean = false;
  todosClientes: any;

  //paginator es una variable de la clase MatPaginator
  @ViewChild('paginatorPagoOnline', { static: true }) paginator!: MatPaginator;
  @ViewChild('paginatorActivos') paginatorActivos!: MatPaginator;
  @ViewChild('paginatorReenovacionMem', { static: true }) paginatorReenovacion!: MatPaginator;

  constructor(
    private pagoService: PagoMembresiaEfectivoService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private ListarClientesService: listarClientesService,
    private clienteService: ClienteService,
    private datePipe: DatePipe,
    private auth: AuthService,
  ) {
    this.form = this.fb.group({
      idUsuario: [''],
      action: ['add'],
    });

    this.clienteService.data$.subscribe((data: any) => {
      if (data && data.idCliente) {
        this.obtenerCliente(data.idCliente);
        this.id = data.idCliente;
        this.form.get('idUsuario')?.setValue(this.id);
      }
    });
  }

  ngOnInit(): void {
    // this.pagoService.comprobar();
    // this.auth.comprobar();

    this.auth.comprobar().subscribe((respuesta)=>{ 
      this.habilitarBoton = respuesta.status;
    });

    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }
    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
      this.listaClientesData();   
    }); 
  }

  loadData() {
    setTimeout(() => {
      this.isLoading = false;
      this.dataSourceActivos.paginator = this.paginatorActivos;
    }, 1000); 
  }

  getSSdata(data: any){
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
          this.auth.role.next(resultData.rolUser);
          this.auth.userId.next(resultData.id);
          this.auth.idGym.next(resultData.idGym);
          this.auth.nombreGym.next(resultData.nombreGym);
          this.auth.email.next(resultData.email);
          this.auth.encryptedMail.next(resultData.encryptedMail);
      }, error: (error) => { console.log(error); }
    });
  }

  ngDoCheck(): void {
    if (this.fechaInicio !== this.fechaInicioAnterior || this.fechaFin !== this.fechaFinAnterior) {
      this.updateDateLogs();
      this.listaClientesData();
    }
  }

  onFechaInicioChange(event: any): void {
  }

  onFechaFinChange(event: any): void {
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  updateDateLogs(): void {
    this.fechaInicioAnterior = this.fechaInicio;
    this.fechaFinAnterior = this.fechaFin; 
    this.pagoService.obtenerClientes(this.formatDate(this.fechaInicio),
                                    this.formatDate(this.fechaFin),
                                    this.auth.idGym.getValue()).subscribe(
      response => {
          if (response.msg == 'No hay resultados') {
          this.clienteActivo = [];
          this.dataSourceActivos = new MatTableDataSource(this.clienteActivo);
          this.dataSourceActivos.paginator = this.paginatorActivos;
        } else if(response.data){
          this.clienteActivo = response.data;
          this.dataSourceActivos = new MatTableDataSource(this.clienteActivo);
          this.dataSourceActivos.paginator = this.paginatorActivos;
        }
      },
      error => {
        console.error('Error en la solicitud:', error);
        // Manejo de errores adicional si es necesario
        this.clienteActivo = [];
        this.dataSourceActivos = new MatTableDataSource(this.clienteActivo);
        this.dataSourceActivos.paginator = this.paginatorActivos;
        this.toastr.error('Ocurrió un error.', '¡Error!');
      }
    );
  }

  listaClientesData(): void {
    this.pagoService.obtenerActivos(this.auth.idGym.getValue()).subscribe((response: any) => {
      console.log(response, "response");
      /*if (response[2] && response[2].success === '2') {
        //const combinedArray = response[0].data.concat(response[1]);
        const combinedArray = response[0].data;
        this.dataSourceActivos = new MatTableDataSource(combinedArray);
        this.loadData(); 
      } else {*/
        this.clienteActivo = response.data;
        this.dataSourceActivos = new MatTableDataSource(this.clienteActivo);
        this.loadData();     
      },
      (error: any) => {
        console.error('Error al obtener activos:', error);
      }
    );
  }

  applyFilterActivos(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceActivos.filter = filterValue.trim().toLowerCase();
  }

  abrirInfoCliente(prod: any): void{ 
    this.dialog
            .open(EmergenteInfoClienteComponent, {
              data: {
                idCliente: `${prod.ID}`,
                nombre: `${prod.Nombre}`,
                telefono: `${prod.telefono}`,
                email: `${prod.email}`,
                peso: `${prod.peso}`,
                estatura: `${prod.estatura}`,
                //sucursal: `${prod.Sucursal}`,
                membresia: `${prod.Membresia}`,
                precio: `${prod.Precio}`,
                huella: `${prod.huella}`,
                duracion: `${prod.Duracion}`,
                idSucursal: `${prod.Gimnasio_idGimnasio}`,
                infoMembresia: `${prod.Info_Membresia}`,
                foto: `${prod.foto}`,
                action:`${prod.accion}`
              },
              width: '80%',
              height: '90%',
              disableClose: true,
            })
            .afterClosed()
            .subscribe((cerrarDialogo: Boolean) => {
              if (cerrarDialogo) {
                this.pagoService.obtenerActivos(this.auth.idGym.getValue()).subscribe((respuesta) => {
                  this.clienteActivo = respuesta.data;
                  // Actualizar la fuente de datos de la segunda tabla (dataSourceActivos)
                  this.dataSourceActivos.data = this.clienteActivo.slice();
                  // Notificar a la tabla sobre el cambio
                  this.dataSourceActivos.data.paginator = this.paginator; // Actualizar el paginador si es necesario
                  // Notificar a la tabla sobre el cambio
                  this.dataSourceActivos._updateChangeSubscription();
                });
              } else {
              }
            });
  }

  abrirEmergente(prod: any) {
    // Abre el diálogo y almacena la referencia
    const dialogRef = this.dialog.open(FormPagoEmergenteComponent, {
      data: {
        idCliente: `${prod.ID}`,
        nombre: `${prod.Nombre ?? prod.nombre}`,
        //sucursal: `${prod.Sucursal}`,
        membresia: `${prod.Membresia}`,
        dateStart: `${prod.Fecha_Inicio}`,
        dateEnd: `${prod.Fecha_Fin}`,
        precio: `${prod.Precio}`,
        duracion: `${prod.Duracion}`,
        idSucursal: `${prod.Gimnasio_idGimnasio}`,
        //action: `${prod.accion}`,
        idMem: `${prod.Membresia_idMem}`,
        detMemID: `${prod.idDetMem}`
      },
      width: '50%',
      height: '80%',
      disableClose: true,
    });

  // Suscríbete al evento actualizarTablas del diálogo
  dialogRef.componentInstance.actualizarTablas.subscribe(
    (actualizar: boolean) => {
      if (actualizar) {
        // Agregar y Actualizar la fila a la tabla dos (dataSourceActivos)
        this.pagoService.obtenerActivos(this.auth.idGym.getValue()).subscribe((respuesta) => {
          this.clienteActivo = respuesta.data;
          // Actualizar la fuente de datos de la segunda tabla (dataSourceActivos)
          this.dataSourceActivos.data = this.clienteActivo.slice();
          // Notificar a la tabla sobre el cambio
          this.dataSourceActivos.data.paginator = this.paginator; // Actualizar el paginador si es necesario
          // Notificar a la tabla sobre el cambio
          this.dataSourceActivos._updateChangeSubscription();
        });
      }
    }
  );

  // Suscríbete al evento afterClosed() para manejar el caso en que se cierra el diálogo
  dialogRef.afterClosed().subscribe((cancelDialog: boolean) => {
    if (cancelDialog) {
      // Manejar el caso en que se cancela el diálogo
    } else {
      // Manejar el caso en que se cierra el diálogo sin cancelar
    }
  });
  }

  abrirDialogo() {
    this.dialog
      .open(MensajeListaComponent, {
        //data: `Membresía agregada exitosamente`,
        width: '500px',
        height: '500px',
      })
      .afterClosed()
      .subscribe((cerrarDialogo: Boolean) => {
        if (cerrarDialogo) {
          this.router.navigateByUrl('/admin/listaMembresias');
        } else {
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

  obtenerCliente(idCliente: number) {
    this.ListarClientesService.consultarCliente(idCliente).subscribe(
      (data: any[]) => {
        if (data && data.length > 0) {
          this.cliente = data[0]; 
        }
      }
    );
  }

  //Descarga el archivo en excel
  descargarExcel(): void {

    if (!this.fechaInicio || isNaN(this.fechaInicio.getTime()) || !this.fechaFin || isNaN(this.fechaFin.getTime())) {
      this.toastr.error('Debe seleccionar las fechas de su reporte', 'Error!!!');
      return;
    }

    this.fechaInicioAnterior = this.fechaInicio;
    this.fechaFinAnterior = this.fechaFin; 

    this.pagoService.obtenerTodosLosClientes(
      this.formatDate(this.fechaInicio),
      this.formatDate(this.fechaFin),
      this.auth.idGym.getValue()
    ).subscribe(
      response => {
        this.todosClientes = response.data;
  
        // Verificar si this.todosClientes es un array y tiene datos
        if (!Array.isArray(this.todosClientes) || this.todosClientes.length === 0) {
          this.toastr.error('No hay datos para exportar.', 'Error!!!');
          return;
        }
  
        // Mapea la información de this.todosClientes a un arreglo bidimensional

        const fechaInicioFormateada = this.datePipe.transform(this.fechaInicio, 'dd/MM/yyyy');
        const fechaFinFormateada = this.datePipe.transform(this.fechaFin, 'dd/MM/yyyy');
      
        const datos = [
          ['Reporte de socios'], 
          [`Con fechas: ${fechaInicioFormateada} - ${fechaFinFormateada}`], // Fechas
          [], // Fila vacía para separar
          ['Clave', 'Nombre completo', 'Sucursal', 'Membresia', 'Precio', 'Fecha de inicio', 'Fecha fin', 'Estatus'],
          ...this.todosClientes.map((activos: any) => [
            activos.clave,
            activos.nombreCompleto,
            activos.nombreBodega,
            activos.titulo,
            activos.total,
            activos.fechaInicio,
            activos.fechaFin,
            activos.estatus == 1 ? 'Activo' : 'Inactivo'
          ])
        ];
  
        // Crear un objeto de libro de Excel
        const workbook = XLSX.utils.book_new();
        const hojaDatos = XLSX.utils.aoa_to_sheet(datos);
  
        // Establecer propiedades de formato para las columnas
        hojaDatos['!cols'] = [
          { wch: 5 },
          { wch: 25 },
          { wch: 20 },
          { wch: 20 },
          { wch: 10 },
          { wch: 10 },
          { wch: 10 },
          { wch: 10 }
        ];
  
        // Añadir la hoja de datos al libro de Excel
        XLSX.utils.book_append_sheet(workbook, hojaDatos, 'Datos');
  
        // Crear un Blob con el contenido del libro de Excel
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const newBlob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
        // Guardar el archivo
        saveAs(newBlob, 'Clientes.xlsx');
      },
      error => {
        this.toastr.error('Error al obtener los datos.', 'Error!!!');
        console.error('Error al obtener los datos', error);
      }
    );
  }

  private formatDateV2(date: Date): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }
  
  //Descarga el archivo en PDF
  descargarPDF(): void {
    // Verifica si hay datos para exportar
    if (!this.dataSourceActivos || !this.dataSourceActivos.filteredData || this.dataSourceActivos.filteredData.length === 0) {
      this.toastr.error('No hay datos para exportar.', 'Error!!!');
      console.warn('No hay datos filtrados para exportar a PDF.');
      return;
    }
  
    // Crear un objeto jsPDF
    const pdf = new (jsPDF as any)();  // Utilizar 'as any' para evitar problemas de tipo

    // Obtener las fechas seleccionadas
    const fechaInicio = this.formatDateV2(this.fechaInicio);
    const fechaFin = this.formatDateV2(this.fechaFin);

    // Encabezado del PDF con las fechas
    pdf.text(`Reporte de clientes (${fechaInicio} - ${fechaFin})`, 10, 10);
    
    // Contenido del PDF
    const datos = this.dataSourceActivos.filteredData.map((activos: ClientesActivos) => [
      activos.ID,
      activos.Nombre,
      activos.Sucursal,
      activos.Membresia,
      activos.Precio,
      activos.Fecha_Inicio,
      activos.Fecha_Fin,
      activos.Status
    ]);
  
    // Añadir filas al PDF con encabezado naranja
    pdf.autoTable({
      head: [['ID', 'Nombre', 'Sucursal', 'Membresia', 'Precio', 'Fecha Inicio', 'Fecha Fin', 'Status']],
      body: datos,
      startY: 20,  // Ajusta la posición inicial del contenido
      headStyles: {
        fillColor: [249, 166, 64],  // Color naranja RGB
        textColor: [255, 255, 255]  // Color blanco para el texto
      }
    });
  
    // Descargar el archivo PDF
    pdf.save('Clientes.pdf');
  }


  eliminarUs(prod: any){
    const prueba = {
      idUsuario: prod.ID,
      correo: prod.email
    }
    this.dialog.open(MensajeEliminarComponent,{
      data: `¿Desea eliminar a este usuario?`,
    })
    .afterClosed()
    .subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.pagoService.deleteService(prueba).subscribe(
          (respuesta) => { 
            this.pagoService.obtenerActivos(this.auth.idGym.getValue()).subscribe((response: any) => {
              /*if (response[2] && response[2].success === '2') {
                //const combinedArray = response[0].data.concat(response[1]);
                const combinedArray = response[0].data;
                this.dataSourceActivos = new MatTableDataSource(combinedArray);
                this.loadData(); 
              } else {*/
                this.clienteActivo = response.data;
                this.dataSourceActivos = new MatTableDataSource(this.clienteActivo);
                this.loadData();     
              },
              (error: any) => {
                console.error('Error al obtener activos:', error);
              }
            );    
          }
        );
      } else {
      }
    });

  }
}
