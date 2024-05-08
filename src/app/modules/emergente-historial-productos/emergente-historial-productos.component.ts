import { Component, OnInit, Inject, ViewChild} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { inventarioService } from '../../service/inventario.service';
import { MatPaginator } from '@angular/material/paginator'; //para paginacion en la tabla
import { MatTableDataSource } from '@angular/material/table'; //para controlar los datos del api y ponerlos en una tabla
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../service/auth.service';

export interface Historial {
  Sucursal: string;
  Usuario: number;
  Producto: number;
  Concepto: string;
  FechaMovimiento: string; 
  ActualStock: string; 
  MovimientoStock: string; 
  NuevoStock: string;
}
@Component({
  selector: 'app-emergente-historial-productos',
  templateUrl: './emergente-historial-productos.component.html',
  styleUrls: ['./emergente-historial-productos.component.css'],
  providers: [DatePipe],
})

export class EmergenteHistorialProductosComponent implements OnInit{
  dataHistorial: Historial[] = []; 
  dataSource: any; 
  displayedColumnsHistorial: string[] = [
    'Producto',
    'Concepto',
    'Fecha Movimiento',
    'Stock Movimiento',
  ];
  fechaInicio: Date = new Date(); 
  fechaFin: Date = new Date();  
  private fechaInicioAnterior: Date | null = null;
  private fechaFinAnterior: Date | null = null; 

  @ViewChild('paginatorHistorial', { static: true }) paginatorHistorial!: MatPaginator;

  constructor(
    public dialogo: MatDialogRef<EmergenteHistorialProductosComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string,
    private ServiceHistorInventario: inventarioService,
    private toastr: ToastrService,
    private auth: AuthService,
    private datePipe: DatePipe,) { }
  
  cerrarDialogo(): void {
    this.dialogo.close(true);
  }

  ngOnInit(): void {
    this.updateDateLogs(); 
  }

  ngDoCheck(): void {
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

  private updateDateLogs(): void {
    this.fechaInicioAnterior = this.fechaInicio;
    this.fechaFinAnterior = this.fechaFin;
    this.ServiceHistorInventario.HistorialInventario(
      this.formatDate(this.fechaInicio),
      this.formatDate(this.fechaFin),
      this.auth.idGym.getValue()
    ).subscribe(
      response => {
        if (response.msg == 'No hay resultados') {
          this.dataHistorial = [];
          this.dataSource = new MatTableDataSource(this.dataHistorial);
          this.dataSource.paginator = this.paginatorHistorial;
          this.toastr.info('No hay historico para mostrar en este rango de fechas.', 'Info!!!');

        } else if(response){
          this.dataHistorial = response;
          this.dataSource = new MatTableDataSource(this.dataHistorial);
          this.dataSource.paginator = this.paginatorHistorial;
          this.toastr.success('Datos encontrados.', 'Success!!!');
        }
      },
      error => {
        this.dataHistorial = [];
        this.dataSource = new MatTableDataSource(this.dataHistorial);
        this.dataSource.paginator = this.paginatorHistorial;
        this.toastr.error('Ocurrio un error.', 'Error!!!');
      },
      () => {
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  descargarExcel(): void {
    if (!this.dataSource || !this.dataSource.filteredData || this.dataSource.filteredData.length === 0) {
      this.toastr.error('No hay datos para exportar.', 'Error!!!');
      console.warn('No hay datos para exportar a Excel.');
      return;
    }

    const datos = [
      ['Sucursal', 'Usuario', 'Producto', 'Concepto', 'Fecha Movimiento', 'Stock Actual', 'Stock Movimiento', 'Stock Nuevo'],
      ...this.dataSource.filteredData.map((listaHist: Historial) => [
        listaHist.Sucursal,
        listaHist.Usuario,
        listaHist.Producto,
        listaHist.Concepto,
        listaHist.FechaMovimiento,
        listaHist.ActualStock,
        listaHist.MovimientoStock,
        listaHist.NuevoStock
      ])
    ];

    const workbook = XLSX.utils.book_new();
    const hojaDatos = XLSX.utils.aoa_to_sheet(datos);
    // Establecer propiedades de formato para las columnas
    hojaDatos['!cols'] = [
      // Se le asigna un ancho a cada columna comenzando con la A
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 25 },
      { wch: 21 },
      { wch: 10 },
      { wch: 15 },
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
    saveAs(newBlob, 'Historial Inventario.xlsx');
  }

  private formatDateV2(date: Date): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }

  descargarPDF(): void {
    // Verifica si hay datos para exportar
    if (!this.dataSource || !this.dataSource.filteredData || this.dataSource.filteredData.length === 0) {
      this.toastr.error('No hay datos para exportar.', 'Error!!!');
      console.warn('No hay datos para exportar a PDF.');
      return;
    }
    // Crear un objeto jsPDF
    const pdf = new (jsPDF as any)();  // Utilizar 'as any' para evitar problemas de tipo
    // Obtener las fechas seleccionadas
    const fechaInicio = this.formatDateV2(this.fechaInicio);
    const fechaFin = this.formatDateV2(this.fechaFin);
    // Encabezado del PDF con las fechas
    pdf.text(`Historial del inventario (${fechaInicio} - ${fechaFin})`, 10, 10);   
    // Contenido del PDF
    const datos = this.dataSource.filteredData.map((listaHist: Historial) => [
      listaHist.Sucursal,
      listaHist.Usuario,
      listaHist.Producto,
      listaHist.Concepto,
      listaHist.FechaMovimiento,
      listaHist.ActualStock,
      listaHist.MovimientoStock,
      listaHist.NuevoStock
    ]);
    // Añadir filas al PDF con encabezado naranja
    pdf.autoTable({
      head: [['Sucursal', 'Usuario', 'Producto', 'Concepto', 'Fecha Movimiento', 'Stock Actual', 'Stock Movimiento', 'Stock Nuevo']],
      body: datos,
      startY: 20,  // Ajusta la posición inicial del contenido
      headStyles: {
        fillColor: [249, 166, 64],  // Color naranja RGB
        textColor: [255, 255, 255]  // Color blanco para el texto
      }
    });
    // Descargar el archivo PDF
    pdf.save('Historial Inventario.pdf');
  }

}
