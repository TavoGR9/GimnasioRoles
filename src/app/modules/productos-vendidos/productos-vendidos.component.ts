import { Component, OnInit, ViewChild, DoCheck} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator'; 
import { MatTableDataSource } from '@angular/material/table'; 
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { AuthService } from '../../service/auth.service';
import { ProductoService } from '../../service/producto.service';
interface Producto {
  Nombre: string;
  Sucursal: string;
  Producto: string;
  Cantidad: number;
  Precio_Unitario: number;
  Importe_x_Producto: number;
  Fecha_Venta: string;
  Total: number;
}
@Component({
  selector: 'app-productos-vendidos',
  templateUrl: './productos-vendidos.component.html',
  styleUrls: ['./productos-vendidos.component.css'],
  providers: [DatePipe],
})

export class ProductosVendidosComponent implements OnInit, DoCheck{
  fechaInicio: Date = new Date(); // Inicializa como una nueva fecha
  fechaFin: Date = new Date();    
  idGym: number = 0;
  currentUser: string = '';
  productosVendidos: Producto[] = [];
  dataSource: any; 
  private fechaInicioAnterior: Date | null = null;
  private fechaFinAnterior: Date | null = null;
  isLoading: boolean = true; 
  displayedColumns: string[] = [
    'Producto',
    'Cantidad',
    'Precio unitario',
    'Importe por producto',
    'Fecha venta',
    'Total'
  ];
  
  //paginator es una variable de la clase MatPaginator
  @ViewChild('paginatorProductos', { static: true }) paginator!: MatPaginator;
  constructor(private prodVendidosService: ProductoService, 
    private datePipe: DatePipe, 
    private toastr: ToastrService,
    private auth: AuthService,){}
  
    ngOnInit(): void{
    // this.prodVendidosService.comprobar();
    // this.auth.comprobar();

    
      this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }
      this.auth.idGym.subscribe((data) => {
        this.idGym = data;
        this.updateDateLogs(); 
      }); 
    
    this.loadData();
  }

  loadData() {
    setTimeout(() => {
      // Una vez que los datos se han cargado, establece isLoading en false
      this.isLoading = false;
    }, 1000); // Este valor representa el tiempo de carga simulado en milisegundos
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

  private formatDateV2(date: Date): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }

  private updateDateLogs(): void {
    this.fechaInicioAnterior = this.fechaInicio;
    this.fechaFinAnterior = this.fechaFin;
    this.prodVendidosService.obtenerListaProduct(
      this.formatDate(this.fechaInicio),
      this.formatDate(this.fechaFin),
      this.idGym
    ).subscribe(
      response => {
        if (response) {
          this.productosVendidos = response;
          this.dataSource = new MatTableDataSource(this.productosVendidos);
          this.dataSource.paginator = this.paginator;
        } else {
          this.productosVendidos = [];
          this.dataSource = new MatTableDataSource(this.productosVendidos);
          this.dataSource.paginator = this.paginator;
        }
      },
      error => {
        console.error('Error en la solicitud:', error);
        this.productosVendidos = [];
        this.dataSource = new MatTableDataSource(this.productosVendidos);
        this.dataSource.paginator = this.paginator;
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
    return;
  }

  const datos = [
    ['Nombre', 'Sucursal', 'Producto', 'Cantidad', 'Precio unitario', 'Importe por producto', 'Fecha venta', 'Total'],
    ...this.dataSource.filteredData.map((producto: Producto) => [
      producto.Nombre,
      producto.Sucursal,
      producto.Producto,
      producto.Cantidad,
      producto.Precio_Unitario,  // Asegúrate de que la propiedad tenga el nombre correcto
      producto.Importe_x_Producto,
      producto.Fecha_Venta,
      producto.Total
    ])
  ];
  
    // Crear un objeto de libro de Excel
    const workbook = XLSX.utils.book_new();
    const hojaDatos = XLSX.utils.aoa_to_sheet(datos);
  // Establecer propiedades de formato para las columnas
    hojaDatos['!cols'] = [
      // La primera columna (A) tiene un ancho de 20
      { wch: 25 },
      // Las siguientes columnas (B a H) tienen un ancho de 15
      { wch: 20 },
      { wch: 20 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 8 }
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
    saveAs(newBlob, 'Productos Vendidos.xlsx');
  }



  //Descarga el archivo en PDF
  descargarPDF(): void {
    // Verifica si hay datos para exportar
    if (!this.dataSource || !this.dataSource.filteredData || this.dataSource.filteredData.length === 0) {
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
    pdf.text(`Reporte de Productos Vendidos (${fechaInicio} - ${fechaFin})`, 10, 10);
    
    // Contenido del PDF
    const datos = this.dataSource.filteredData.map((producto: Producto) => [
      producto.Nombre,
      producto.Sucursal,
      producto.Producto,
      producto.Cantidad,
      producto.Precio_Unitario,
      producto.Importe_x_Producto,
      producto.Fecha_Venta,
      producto.Total
    ]);
  
    // Añadir filas al PDF con encabezado naranja
  pdf.autoTable({
    head: [['Nombre', 'Sucursal', 'Producto', 'Cantidad', 'Precio unitario', 'Importe por producto', 'Fecha venta', 'Total']],
    body: datos,
    startY: 20,  // Ajusta la posición inicial del contenido
    headStyles: {
      fillColor: [249, 166, 64],  // Color naranja RGB
      textColor: [255, 255, 255]  // Color blanco para el texto
    }
  });
  
    // Descargar el archivo PDF
    pdf.save('Productos Vendidos.pdf');
    //pdf.save(`Productos Vendidos (${fechaInicio} - ${fechaFin}).pdf`);
  }

}
