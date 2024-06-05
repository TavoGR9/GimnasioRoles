import { MatTableDataSource } from "@angular/material/table";
import { AuthService } from "../../service/auth.service";
import { JoinDetalleVentaService } from "../../service/JoinDetalleVenta";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder} from "@angular/forms";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { VentasComponent } from "../ventas/ventas.component";
import { DialogStateService } from "../../service/dialogState.service";
import { combineLatest } from 'rxjs';
@Component({
  selector: 'app-ver-corte',
  templateUrl: './ver-corte.component.html',
  styleUrls: ['./ver-corte.component.css']
})
export class VerCorteComponent implements OnInit  {

  constructor( 
    public dialog: MatDialog,
    private auth: AuthService,
    public formulario: FormBuilder,
    private joinDetalleVentaService: JoinDetalleVentaService,
    private dialogStateService: DialogStateService,
    private toastr: ToastrService,
  ) {}

  totalVentas: number = 0;
  idGym: number = 0;
  total = 0;
  fechaFin: Date = new Date();
  fechaInicio: Date = new Date();
  fechaFiltro: string = "";
  opcionSeleccionada: string = "diario";
  totalAPagarCorte: number = 0;
  botonProductos: boolean = false;
  mostrarInputFlag: boolean = false;
  currentUser: string = '';
  detallesCaja: any[] = [];
  detallesCajaaaa: any[] = [];
  columnas: string[] = [
    "nombreProducto",
    "cantidadElegida",
    "precioUnitario",
    "fechaVenta",
  ];
  dialogRef: any;
  isLoading: boolean = true; 
  habilitarBoton: boolean = false;
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  DetallesCaja: any;
  idUser: number = 0;

  ngOnInit(): void {
    // this.productoService.comprobar();
    // this.DetalleVenta.comprobar();
    // this.InventarioService.comprobar();
    // this.ventasService.comprobar();
    // this.joinDetalleVentaService.comprobar();
    this.auth.comprobar().subscribe((respuesta)=>{ 
      this.habilitarBoton = respuesta.status;
    });
    this.dialogStateService.currentMaximizeState.subscribe((isMaximized) => {
      if (this.dialogRef) {
        if (isMaximized) {
          this.dialogRef.updateSize('100vw', '100vh');
        } else {
          this.dialogRef.updateSize('auto', 'auto');
        }
      }
    });  
    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }


    combineLatest([this.auth.idGym, this.auth.idUser]).subscribe(([idGym, idUser]) => {
      if (idGym && idUser) {
        this.idGym = idGym;
        this.idUser = idUser;
        this.listaTablas();
      }
    });
  }  

  loadData() {
    setTimeout(() => {
      this.isLoading = false;
      this.dataSource.paginator = this.paginator;
    }, 1000);
  }

  getSSdata(data: any){
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
          this.auth.role.next(resultData.rolUser);
          this.auth.idUser.next(resultData.clave);
          this.auth.idGym.next(resultData.idGym);
          this.auth.nombreGym.next(resultData.nombreGym);
          this.auth.email.next(resultData.email);
          this.auth.encryptedMail.next(resultData.encryptedMail);
      }, error: (error) => { console.log(error); }
    });
  }

  listaTablas(){
    this.joinDetalleVentaService.consultarProductosVentas(this.idGym).subscribe(
      (data) => {
        this.detallesCaja = data;
        this.dataSource = new MatTableDataSource(this.detallesCaja);
        this.loadData(); 
        this.dataSource.data = this.detallesCaja;
        const fechaActual = this.obtenerFechaActual().toISOString().slice(0, 10);
        this.fechaFiltro = fechaActual;
        this.aplicarFiltro();
      },
      (error) => {
        console.error("Error al obtener detalles de la caja:", error);
      }
    );
  }

  private obtenerFechaActual(): Date {
    const fechaActual = new Date();
    fechaActual.setHours(fechaActual.getHours() - 6); // Agregar 6 horas
    return fechaActual;
  }
  
  aplicarFiltro() {
    this.dataSource.filter = this.fechaFiltro; // Aplica el filtro con la fecha actual
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return data.fechaVenta.includes(filter); // Compara la fecha con el filtro
    };
    this.actualizarTotalVentas();
  }

  aplicarFiltross() {
    const fechaInicioFiltrar = new Date(this.fechaInicio);
    const fechaFinFiltrar = new Date(this.fechaFin);
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const fechaItem = new Date(data.fechaVenta); // Ajusta 'fechaVenta' a tu propiedad de fecha
      return fechaItem >= fechaInicioFiltrar && fechaItem <= fechaFinFiltrar;
    };
    // Concatenar las fechas con un carácter que no se espera en las fechas
    const filtro = `${fechaInicioFiltrar.toISOString().slice(0, 10)}_${fechaFinFiltrar.toISOString().slice(0, 10)}`;
    this.dataSource.filter = filtro;
    this.actualizarTotalVentas();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  actualizarTotalVentas(): void {
    this.totalVentas = this.calcularTotalVentas();
  }
  
  calcularTotalVentas(): number {
    // Obtén los datos visibles después de aplicar filtros
    const datosVisibles = this.dataSource.filteredData || this.dataSource.data;
    // Realiza el cálculo del total
    return datosVisibles.reduce((total, detalle) => {
      const cantidad = parseFloat(detalle.cantidadElegida);
      const precioUnitario = parseFloat(detalle.precioUnitario);
      if (!isNaN(cantidad) && !isNaN(precioUnitario)) {
        return total + (cantidad * precioUnitario);
      } else {
        return total;
      }
    }, 0);
  }
  
  descargarPDF2(): void {
    // Verifica si hay datos para exportar
    if (!this.dataSource || !this.dataSource.filteredData || this.dataSource.filteredData.length === 0) {
      this.toastr.error('No hay información para exportar.', 'Error!!!');
      console.warn('No hay datos filtrados para exportar a PDF.');
      return;
    }
    // Crear un objeto jsPDF
    const pdf = new (jsPDF as any)();  // Utilizar 'as any' para evitar problemas de tipo
  
    // Encabezado del PDF
    pdf.setFontSize(20);
    pdf.text('Corte de Caja', 105, 15, null, null, 'center');
  
    // Obtener datos filtrados según el filtro actual de la tabla
    const datosFiltrados = this.dataSource.filteredData.map((detalle: any) => [
      detalle.nombreProducto,
      detalle.cantidadElegida,
      detalle.precioUnitario,
      detalle.fechaVenta
    ]);
  
    
    // Agregar estilos al PDF
    const styles = {
      theme: 'striped',
      headStyles: {
        fillColor: [249, 166, 64],
        textColor: [255, 255, 255]
      },
      bodyStyles: {
        textColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        2: { cellWidth: 'wrap' }
      },
      margin: { top: 30 }
    };
  
    // Añadir filas al PDF con autoTable
    pdf.autoTable({
      head: [['Nombre Producto', 'Cantidad', 'Precio Unitario', 'Fecha']],
      body: datosFiltrados,
      startY: 35,
      styles,
      headStyles: styles.headStyles,
      bodyStyles: styles.bodyStyles,
      alternateRowStyles: styles.alternateRowStyles,
      columnStyles: styles.columnStyles
    });
  
    // Descargar el archivo PDF
    pdf.save('CorteDeCaja.pdf');
  }
  
  descargarExcel2(): void {
    // Verificar si hay datos para exportar
    if (!this.dataSource || !this.dataSource.filteredData || this.dataSource.filteredData.length === 0) {
      this.toastr.error('No hay información para exportar.', 'Error!!!');
      console.warn('No hay datos filtrados para exportar a Excel.');
      return;
    }
  
    // Copiar los datos filtrados
    const datosFiltrados = [...this.dataSource.filteredData];
  
    // Agregar una fila al final con el total
    datosFiltrados.push({
      'Total Ventas': this.totalVentas  // Ajusta la clave según tu estructura de datos
    });

    const titulos = {
      nombreProducto: 'Nombre del producto',
      cantidadElegida: 'Cantidad',
      precioUnitario: 'Precio unitario',
      fechaVenta: 'Fecha de venta',
      VendidoPor: 'Vendido por',
      'Total Ventas': 'Total de ventas'
    };
  
    // Crear un nuevo array con los datos filtrados incluyendo los nuevos títulos
    const datosConTitulos = datosFiltrados.map(elemento => {
      return {
        'Nombre del producto': elemento.nombreProducto,
        'Cantidad': elemento.cantidadElegida,
        'Precio unitario': elemento.precioUnitario,
        'Fecha de venta': elemento.fechaVenta,
        'Vendido por': elemento.VendidoPor, // Asegúrate de que esto coincida con la estructura de tus datos
        'Total de ventas': elemento['Total Ventas']
      };
    });

  
    // Crear un objeto de trabajo de Excel
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosConTitulos);

    worksheet['!cols'] = [
      { wpx: 200 }, 
      { wpx: 100 }, 
      { wpx: 100 }, 
      { wpx: 100 }, 
      { wpx: 200 }, 
      { wpx: 100 }, 
    ];

    const workbook: XLSX.WorkBook = { Sheets: { 'Datos': worksheet }, SheetNames: ['Datos'] };
  
    // Convertir el libro de trabajo a un archivo de Excel binario
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
    // Crear un Blob y descargar el archivo Excel
    const fecha = new Date().toISOString().split('T')[0]; // Obtener la fecha actual para el nombre del archivo
    const nombreArchivo = `CorteDeCaja_${fecha}.xlsx`;
  
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, nombreArchivo); // Utiliza la función saveAs para descargar el archivo
  
    this.toastr.success('Archivo Excel generado correctamente.', '¡Éxito!');
  }

  cargarArchivo(event: any): void {
    const file = event.target.files[0];
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const data: ArrayBuffer = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(data, { type: 'array' });
      const sheetName: string = workbook.SheetNames[0];
      const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
      // 'excelData' ahora contiene los datos del archivo Excel
      // Asignar 'excelData' al origen de datos de tu tabla (this.dataSource)
      this.dataSource = new MatTableDataSource<any>(excelData);
    };
    reader.readAsArrayBuffer(file);
  }

  ventas(): void {
    this.dialogRef = this.dialog.open(VentasComponent, {
      width: '80%',
      height: '90%',
      disableClose: true
    });
    this.dialogRef.afterClosed().subscribe(() => {
      this.joinDetalleVentaService.consultarProductosVentas(this.idGym).subscribe(
        (data) => {
          this.detallesCaja = data;
          this.dataSource = new MatTableDataSource(this.detallesCaja);
          this.loadData(); 
          this.dataSource.data = this.detallesCaja;
          const fechaActual = this.obtenerFechaActual().toISOString().slice(0, 10);
          this.fechaFiltro = fechaActual;
          this.aplicarFiltro();
        },
        (error) => {
          console.error("Error al obtener detalles de la caja:", error);
        }
      );
    });
  }

}
