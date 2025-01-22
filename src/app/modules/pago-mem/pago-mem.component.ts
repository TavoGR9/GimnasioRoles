import { Component, OnInit, ViewChild} from '@angular/core';
import { PagoMembresiaEfectivoService } from '../../service/pago-membresia-efectivo.service';
import { DatePipe } from "@angular/common";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { ToastrService } from "ngx-toastr";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { AuthService } from '../../service/auth.service';
import { NetworkService } from '../../service/network.service';

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
  isOnline = true;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  clienteActivo: any;

  constructor(
    private pagoMem: PagoMembresiaEfectivoService,
    private datePipe: DatePipe,
    private toastr: ToastrService, 
    private auth:AuthService,
    private networkService: NetworkService){
      
      this.fechaInicio.setHours(0, 0, 0, 0);
     
  }

  ngOnInit(): void {  
    this.verTabla();
    console.log(this.fechaInicio,this.fechaFin);
    
      // Suscribirse al estado de conexión
      this.networkService.isOnline$.subscribe((status) => {
        this.isOnline = status;
      });

      console.log('Conexion',this.isOnline);

    
  }


/*
  ngDoCheck(): void {
    if (
      this.fechaInicio !== this.fechaInicioAnterior ||
      this.fechaFin !== this.fechaFinAnterior
    ) {
      this.verTabla();
    }
  }
    */

/*
  verTabla(): void{


    this.pagoMem.obtenerActivos(this.auth.idGym.getValue()).subscribe(
      (response: any) => {
        
        //this.clienteActivo = response.data;

       
        const Clientes=response.data ;
       
        const filtrados= Clientes.filter((item: any) => item.conteoPedidos ==="1"|| item.conteoPedidos === null);
        
        this.clienteActivo=filtrados;
        

       
        this.dataSource = new MatTableDataSource(this.clienteActivo);
     
        
      },
      (error: any) => {
        console.error("Error al obtener activos:", error);
      }
    );
  }
*/

  formatDate(date: Date): string {
    return this.datePipe.transform(date, "yyyy-MM-dd") || "";
  }

  total(): void{  //sin valor de retorno
     this.totalVentas = this.calcularVentas();
  }

  calcularVentas(): number {
    // Obtén los datos del dataSource
    const datos = this.dataSource?.filteredData || this.dataSource?.data || [];

    // Reduce los datos para sumar los valores válidos de 'total'
    return datos.reduce((total, dato) => {
        const precio = parseFloat(dato?.total ?? '0'); // Maneja casos donde dato.total es undefined
        if (!isNaN(precio)) {
            return total + precio; // Suma el precio si es un número válido
        }
        return total; // Ignora los valores no válidos
    }, 0);
}

/*
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

  */

  verTabla(): void {
    this.pagoMem.obtenerActivos(this.auth.idGym.getValue()).subscribe(
        (response: any) => {
            const Clientes = response.data;

            // Validamos si las fechas están definidas; si no, usamos valores predeterminados.
            const fechaInicio = this.fechaInicio
                ? new Date(this.fechaInicio)
                : new Date('2000-01-01'); // Fecha predeterminada 
            const fechaFin = this.fechaFin
                ? new Date(this.fechaFin)
                : new Date(); // Fecha predeterminada (hoy).
                fechaFin.setHours(23, 59, 0); 

            // Aseguramos que las fechas sean válidas antes de filtrar.
            const filtradosPorFecha = Clientes.filter((cliente: any) => {
                const fechaPedido = new Date(cliente.fecha_hora_pedido);
                return (
                    fechaPedido >= fechaInicio && 
                    fechaPedido <= fechaFin
                );
            });

            // Filtramos solo clientes con id_pedido.
            const conPedidos = filtradosPorFecha.filter((item: any) => item.id_pedido);

            // Agrupamos por pedido.
            const agrupadosConPedidos = this.agruparPorPedido(conPedidos);

            // Ordenamos por fecha_hora_pedido.
            agrupadosConPedidos.sort((a: any, b: any) => {
                const fechaA = new Date(a.fecha_hora_pedido);
                const fechaB = new Date(b.fecha_hora_pedido);
                return fechaA.getTime() - fechaB.getTime();
            });

            this.clienteActivo = agrupadosConPedidos;

            console.log("clienteActivo final (solo con pedidos agrupados):", this.clienteActivo);

            // Actualizamos el DataSource de la tabla.
            this.dataSource = new MatTableDataSource(this.clienteActivo);
            this.dataSource.paginator = this.paginator;
            this.total();
        },
        (error: any) => {
            console.error("Error al obtener activos:", error);
        }
    );
    console.log('executed');
}


// Nueva función: agruparPorPedido
private agruparPorPedido(clientes: any[]): any[] {
    // Creamos un objeto para almacenar los resultados agrupados por id_pedido.
    const agrupadosPorPedido: { [key: string]: any } = {};

    clientes.forEach(cliente => {
        const idPedido = cliente.id_pedido;

        // Ignoramos clientes que no tienen id_pedido.
        if (!idPedido) {
            return;
        }

        if (!agrupadosPorPedido[idPedido]) {
            // Si no existe este `id_pedido` en el objeto agrupador, lo inicializamos.
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
                productos: [] // Inicializamos un array vacío para los productos.
            };
        }

        // Agregamos la información del producto al array `productos` correspondiente.
        agrupadosPorPedido[idPedido].productos.push({
            id_producto: cliente.id_producto,
            marca: cliente.marca,
            nombreProducto: cliente.nombreProducto,
            idProbob: cliente.idProbob
        });
    });

    // Convertimos el objeto agrupado en un array.
    return Object.values(agrupadosPorPedido);
}

verificarCambios(): void {
  // Verificar que las fechas no sean nulas, indefinidas o inválidas
  if (
    this.fechaInicio != null && this.fechaFin != null &&
    this.fechaInicio !== undefined && this.fechaFin !== undefined &&
    !isNaN(new Date(this.fechaInicio).getTime()) && // Verificar que la fechaInicio sea válida
    !isNaN(new Date(this.fechaFin).getTime()) && // Verificar que la fechaFin sea válida
    (this.fechaInicio !== this.fechaInicioAnterior || this.fechaFin !== this.fechaFinAnterior)
  ) {
       console.log(this.fechaFin,this.fechaInicio);

    // Actualizar los valores anteriores
    this.fechaInicioAnterior = this.fechaInicio;
    this.fechaFinAnterior = this.fechaFin;

    this.verTabla()
    //this.updateDateLogs();
  }
}


descargarExcel(): void {
  console.log("Iniciando la exportación...");

  // Obtener los datos de la tabla
  const datosTabla = this.dataSource.filteredData || this.dataSource.data;
  console.log("Datos de la tabla obtenidos:", datosTabla);

  // Verificar si hay datos para exportar
  if (!datosTabla || datosTabla.length === 0) {
      console.error("No hay datos para exportar.");
      this.toastr.error("No hay datos para exportar.", "Error!!!");
      return;
  }

  // Formatear las fechas
  const fechaInicioFormateada = this.datePipe.transform(this.fechaInicio, "dd/MM/yyyy");
  const fechaFinFormateada = this.datePipe.transform(this.fechaFin, "dd/MM/yyyy");
  console.log("Fechas formateadas:", { fechaInicioFormateada, fechaFinFormateada });

  // Crear la estructura de datos para el archivo Excel
  const datos = [
      ["Reporte de socios"],
      [`Con fechas: ${fechaInicioFormateada} - ${fechaFinFormateada}`],
      [],
      [
          "ID",
          "Nombre completo",
          "Sucursal",
          "Membresía",
          "Precio",
          "Fecha de inicio",
          "Fecha fin",
          "Fecha de registro",
          "Estatus",
          "Creado por",
      ],
      ...datosTabla.map((cliente: any) => {
          console.log("Procesando cliente:", cliente);
          return [
              cliente.estafeta || "N/A",
              cliente.nombreCompleto || "N/A",
              cliente.id_bodega || "N/A",
              cliente.membresia || "N/A",
              cliente.total || 0,
              cliente.fecha_inicio ? this.datePipe.transform(cliente.fecha_inicio, "dd/MM/yyyy") : "Sin fecha",
              cliente.fecha_caducidad ? this.datePipe.transform(cliente.fecha_caducidad, "dd/MM/yyyy") : "Sin fecha",
              cliente.fecha_hora_pedido ? this.datePipe.transform(cliente.fecha_hora_pedido, "dd/MM/yyyy") : "Sin fecha",
              cliente.estatus == 1 ? "Activo" : "Inactivo",
              cliente.creadoPor || "Desconocido",
          ];
      }),
  ];

  console.log("Datos estructurados para el Excel:", datos);

  // Crear un objeto de libro de Excel
  const workbook = XLSX.utils.book_new();
  console.log("Libro de Excel creado.");

  // Crear la hoja con los datos
  const hojaDatos = XLSX.utils.aoa_to_sheet(datos);
  console.log("Hoja de datos creada:", hojaDatos);

  // Establecer propiedades de formato para las columnas (todas las columnas a 50)
  hojaDatos["!cols"] = [
      { wch: 11 },  // Clave
      { wch: 50 },  // Nombre completo
      { wch: 35 },  // Sucursal
      { wch: 50 },  // Membresía
      { wch: 20 },  // Precio
      { wch: 30 },  // Fecha de inicio
      { wch: 30 },  // Fecha fin
      { wch: 30 },  // Fecha de registro
      { wch: 15 },  // Estatus
      { wch: 50 },  // Creado por
  ];
  console.log("Anchos de columna establecidos:", hojaDatos["!cols"]);

  // Añadir la hoja de datos al libro
  XLSX.utils.book_append_sheet(workbook, hojaDatos, "Reporte");
  console.log("Hoja de datos añadida al libro.");

  // Escribir el libro en formato array
  const wbout = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array", // Cambiar a "array"
  });
  console.log("Libro de Excel escrito en formato array.");

  // Crear un Blob con el contenido del libro de Excel
  const newBlob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  console.log("Blob creado correctamente:", newBlob);

  // Guardar el archivo Excel con el nombre "Clientes.xlsx"
  saveAs(newBlob, "Clientes.xlsx");
  console.log("Archivo guardado como 'Clientes.xlsx'");
}

}
