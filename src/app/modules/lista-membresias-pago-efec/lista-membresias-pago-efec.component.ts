import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { PagoMembresiaEfectivoService } from '../../service/pago-membresia-efectivo.service';
import { MatPaginator } from '@angular/material/paginator'; //para paginacion en la tabla
import { MatTableDataSource } from '@angular/material/table'; //para controlar los datos del api y ponerlos en una tabla
import { MensajeEmergenteComponent } from '../mensaje-emergente/mensaje-emergente.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormPagoEmergenteComponent } from '../form-pago-emergente/form-pago-emergente.component';
import { MensajeListaComponent } from '../ListaClientes/mensaje-cargando.component';
import { listarClientesService } from '../../service/listarClientes.service';
import { ClienteService } from '../../service/cliente.service';
import { HuellaService } from '../../service/huella.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { EmergenteInfoClienteComponent } from '../emergente-info-cliente/emergente-info-cliente.component';
import { AuthService } from '../../service/auth.service';

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
  //clienteActivo: any;
  clienteReenovacion: any;
  cliente: any;
  clienteActivo: ClientesActivos[] = [];   //clienteActivo debe tener el tipo adecuado (en este caso, un array de ClientesActivos)
  dataSource: any; // instancia para matTableDatasource
  dataSourceActivos: any;
  dataSourceReenovacion: any;
  fechaInicio: Date = new Date(); // Inicializa como una nueva fecha
  fechaFin: Date = new Date();    // Inicializa como una nueva fecha
  id: any;
  //titulos de columnas de la tabla clientes activos
  displayedColumnsActivos: string[] = [

    'Nombre',
  
    'Membresia',
    'Precio',
    'Fecha Inicio',
    'Fecha Fin',
    'Estatus',
    //'Dinero Recibido',
    //'Pagar',
    'Reenovación',
    'Info Cliente'
  ];
  dineroRecibido: number = 0; 
  moneyRecibido: number = 0; 
  cash: number = 0; 
  IDvalid: number = 0;
  currentUser: string = '';
  idGym: number = 0;
  private fechaInicioAnterior: Date | null = null;
  private fechaFinAnterior: Date | null = null;

  //paginator es una variable de la clase MatPaginator
  @ViewChild('paginatorPagoOnline', { static: true }) paginator!: MatPaginator;
  @ViewChild('paginatorActivos', { static: true }) paginatorActivos!: MatPaginator;
  @ViewChild('paginatorReenovacionMem', { static: true }) paginatorReenovacion!: MatPaginator;

  constructor(
    private pagoService: PagoMembresiaEfectivoService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private ListarClientesService: listarClientesService,
    private huellasService: HuellaService,
    private clienteService: ClienteService,
    private datePipe: DatePipe,
    private auth: AuthService,
  ) {
    this.form = this.fb.group({
      idUsuario: [''],
      action: ['add'],
      // id_module: ['', Validators.compose([Validators.required])],
    });

    //obtener id del cliente
    this.clienteService.data$.subscribe((data: any) => {
      if (data && data.idCliente) {
        this.obtenerCliente(data.idCliente); // Obtener cliente usando el ID recibido
        this.id = data.idCliente;
        // Actualizar el valor del control 'id' en el formulario
        this.form.get('idUsuario')?.setValue(this.id);
      }
    });
  }

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }
  
    
    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
      this.listaClientesData();  
      //this.updateDateLogs();  
    }); 

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
    // Verifica si las fechas han cambiado y actualiza los logs
    if (this.fechaInicio !== this.fechaInicioAnterior || this.fechaFin !== this.fechaFinAnterior) {
      this.updateDateLogs();
    }
  }

  onFechaInicioChange(event: any): void {
  }

  onFechaFinChange(event: any): void {
  }

  private formatDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  updateDateLogs(): void {
    this.fechaInicioAnterior = this.fechaInicio;
    this.fechaFinAnterior = this.fechaFin; 
    this.pagoService.obtenerClientes(this.formatDate(this.fechaInicio),
                                    this.formatDate(this.fechaFin),
                                    this.auth.idGym.getValue()).subscribe(
      response => {
        console.log(response);
          if (response.msg == 'No hay resultados') {
          this.clienteActivo = [];
          this.dataSourceActivos = new MatTableDataSource(this.clienteActivo);
          this.dataSourceActivos.paginator = this.paginatorActivos;
        } else if(response.data){
          // Si hay datos, actualiza la tabla
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
    this.pagoService.obtenerActivos(this.auth.idGym.getValue()).subscribe(
      (response: any) => {
        console.log('Respuesta del servicio:', response.data);
        this.clienteActivo = response.data;
        this.dataSourceActivos = new MatTableDataSource(this.clienteActivo);
        this.dataSourceActivos.paginator = this.paginatorActivos;
        // Aquí puedes realizar otras operaciones con la respuesta, si es necesario
      },
      (error: any) => {
        console.error('Error al obtener activos:', error);
        // Manejo de errores, si es necesario
      }
    );
  }

  applyFilterActivos(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceActivos.filter = filterValue.trim().toLowerCase();
  }

  abrirInfoCliente(prod: any): void{ 
    console.log(prod, "prod");
    this.dialog
            .open(EmergenteInfoClienteComponent, {
              data: {
                idCliente: `${prod.ID}`,
                nombre: `${prod.Nombre}`,

               // nombre_cl: `${prod.nombre_cliente}`,
                //paterno: `${prod.apPaterno}`,
                //materno: `${prod.apMaterno}`,
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
                foto: `${prod.fotoUrl}`,
                action:`${prod.accion}`
              },
              width: '80%',
              height: '90%',
              disableClose: true,
              //data: `Mi nombre es: ${prod.Nombre}`,
            })
            .afterClosed()
            .subscribe((cerrarDialogo: Boolean) => {
              if (cerrarDialogo) {
                // Recargar la página actual
                //location.reload();
                //this.router.navigateByUrl(`/index/`);
              } else {
              }
            });
  }

  abrirEmergente(prod: any) {
    console.log(prod, "prod");
    // Abre el diálogo y almacena la referencia
    const dialogRef = this.dialog.open(FormPagoEmergenteComponent, {
      data: {
        idCliente: `${prod.ID}`,
        nombre: `${prod.Nombre}`,
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
          console.log('datos en tabla: ',this.clienteActivo);
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

  /*********PARTE DEL DIALOGO *************/
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
    // Verifica si hay datos para exportar
    if (!this.dataSourceActivos || !this.dataSourceActivos.filteredData || this.dataSourceActivos.filteredData.length === 0) {
      this.toastr.error('No hay datos para exportar.', 'Error!!!');
      //console.warn('No hay datos para exportar a Excel.');
      return;
    }

    // Mapea la información de this.productosVendidos a un arreglo bidimensional
    const datos = [
      ['ID', 'Nombre', 'Sucursal', 'Membresia', 'Precio', 'Fecha Inicio', 'Fecha Fin', 'Status'],
      ...this.dataSourceActivos.filteredData.map((activos: ClientesActivos) => [
        activos.ID,
        activos.Nombre,
        activos.Sucursal,
        activos.Membresia,
        activos.Precio,
        activos.Fecha_Inicio,  // La propiedad debe tener el nombre correcto
        activos.Fecha_Fin,
        activos.Status
      ])
    ];

    // Crear un objeto de libro de Excel
    const workbook = XLSX.utils.book_new();
    const hojaDatos = XLSX.utils.aoa_to_sheet(datos);
    // Establecer propiedades de formato para las columnas
    hojaDatos['!cols'] = [
      // Se le asigna un ancho a cada columna comenzando con la A
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
    const blob = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

    // Convertir el Blob a un array de bytes
    const arrayBuffer = new ArrayBuffer(blob.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < blob.length; i++) {
      view[i] = blob.charCodeAt(i) & 0xFF;
    }

    // Crear un Blob con el array de bytes y guardarlo como archivo
    const newBlob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(newBlob, 'Clientes.xlsx');
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
}
