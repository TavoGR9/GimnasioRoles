import { Component, OnInit, ViewChild} from '@angular/core';
import { PagoMembresiaEfectivoService } from '../../service/pago-membresia-efectivo.service';
import { DatePipe } from "@angular/common";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { ToastrService } from "ngx-toastr";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-pago-mem',
  templateUrl: './pago-mem.component.html',
  styleUrls: ['./pago-mem.component.css'],
  providers: [DatePipe],
})
export class PagoMemComponent implements OnInit{

  fechaFin: Date = new Date();
  fechaInicio: Date = new Date();
  opcionSeleccionada: string = 'diario'
  dataSource!: MatTableDataSource<any>;
  private fechaInicioAnterior: Date | null = null;
  private fechaFinAnterior: Date | null = null;
  datos: any;
  todosClientes: any;
  totalVentas: number = 0;
  displayedColumns: string[] = [
    'clave','nombre'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private pagoMem: PagoMembresiaEfectivoService,private datePipe: DatePipe,private toastr: ToastrService, private auth:AuthService){
  }

  ngOnInit(): void {  
  }

  ngDoCheck(): void {
    if (
      this.fechaInicio !== this.fechaInicioAnterior ||
      this.fechaFin !== this.fechaFinAnterior
    ) {
      this.verTabla();
    }
  }

  verTabla(): void{
    this.fechaInicioAnterior = this.fechaInicio;
    this.fechaFinAnterior = this.fechaFin;
    this.pagoMem.obtenerTodosLosClientes(
      this.formatDate(this.fechaInicio),
      this.formatDate(this.fechaFin),
      this.auth.idGym.getValue()
    ).subscribe(
      respuesta => { 
        this.datos = Array.isArray(respuesta.data) ? respuesta.data : [];
        this.dataSource = new MatTableDataSource(this.datos);
        this.dataSource.paginator = this.paginator;
        this.total();
      },
      error => {
        console.error('Error al obtener los clientes:', error);
      }
    );
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, "yyyy-MM-dd") || "";
  }

  total(): void{  //sin valor de retorno
     this.totalVentas = this.calcularVentas();
  }

  calcularVentas(): number
  {
    const datos = this.dataSource.filteredData || this.dataSource.data
    return datos.reduce((total, dato)=> {
     const precio = parseFloat(dato.total);
     if(!isNaN(precio)){
      return total + precio;
     }else{
      return total;
     }
    },0)
  }

  descargarExcel(): void {
    if (
      !this.fechaInicio ||
      isNaN(this.fechaInicio.getTime()) ||
      !this.fechaFin ||
      isNaN(this.fechaFin.getTime())
    ) {
      this.toastr.error(
        "Debe seleccionar las fechas de su reporte",
        "Error!!!"
      );
      return;
    }

    this.fechaInicioAnterior = this.fechaInicio;
    this.fechaFinAnterior = this.fechaFin;

    this.pagoMem
      .obtenerTodosLosClientes(
        this.formatDate(this.fechaInicio),
        this.formatDate(this.fechaFin),
        this.auth.idGym.getValue()
      )
      .subscribe(
        (response) => {
          this.todosClientes = response.data;

          // Verificar si this.todosClientes es un array y tiene datos
          if (
            !Array.isArray(this.todosClientes) ||
            this.todosClientes.length === 0
          ) {
            this.toastr.error("No hay datos para exportar.", "Error!!!");
            return;
          }

          const fechaInicioFormateada = this.datePipe.transform(
            this.fechaInicio,
            "dd/MM/yyyy"
          );
          const fechaFinFormateada = this.datePipe.transform(
            this.fechaFin,
            "dd/MM/yyyy"
          );

          const datos = [
            ["Reporte de socios"],
            [`Con fechas: ${fechaInicioFormateada} - ${fechaFinFormateada}`], // Fechas
            [], // Fila vacía para separar
            [
              "Clave",
              "Nombre completo",
              "Sucursal",
              "Membresia",
              "Precio",
              "Fecha de inicio",
              "Fecha fin",
              "Fecha de registro",
              "Estatus",
              "Creado por",
            ],
            ...this.todosClientes.map((activos: any) => [
              activos.clave,
              activos.nombreCompleto,
              activos.nombreBodega,
              activos.titulo,
              activos.total,
              activos.fechaInicio,
              activos.fechaFin,
              activos.creation_date,
              activos.estatus == 1 ? "Activo" : "Inactivo",
              activos.creadoPor,
            ]),
          ];

          // Crear un objeto de libro de Excel
          const workbook = XLSX.utils.book_new();
          const hojaDatos = XLSX.utils.aoa_to_sheet(datos);

          // Establecer propiedades de formato para las columnas
          hojaDatos["!cols"] = [
            { wch: 5 },
            { wch: 25 },
            { wch: 20 },
            { wch: 20 },
            { wch: 10 },
            { wch: 15 },
            { wch: 15 },
            { wch: 20 },
            { wch: 10 },
            { wch: 25 },
          ];

          // Añadir la hoja de datos al libro de Excel
          XLSX.utils.book_append_sheet(workbook, hojaDatos, "Datos");

          // Crear un Blob con el contenido del libro de Excel
          const wbout = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
          });
          const newBlob = new Blob([wbout], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });

          // Guardar el archivo
          saveAs(newBlob, "Clientes.xlsx");
        },
        (error) => {
          this.toastr.error("Error al obtener los datos.", "Error!!!");
          console.error("Error al obtener los datos", error);
        }
      );
  }
}
