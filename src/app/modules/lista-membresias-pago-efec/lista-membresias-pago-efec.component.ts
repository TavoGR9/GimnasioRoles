import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { MatDialog,MatDialogConfig } from "@angular/material/dialog";
import { DatePipe } from "@angular/common";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "../../service/auth.service";
import { PagoMembresiaEfectivoService } from "../../service/pago-membresia-efectivo.service";
import { MensajeEliminarComponent } from "../mensaje-eliminar/mensaje-eliminar.component";
import { FormPagoEmergenteComponent } from "../form-pago-emergente/form-pago-emergente.component";
import { RegistroComponent } from "../registro/registro.component";
import { EmergenteAperturaPuertoSerialComponent } from "../emergente-apertura-puerto-serial/emergente-apertura-puerto-serial.component";
import { EmergenteInfoClienteComponent } from "../emergente-info-cliente/emergente-info-cliente.component";
import { NetworkService } from "../../service/network.service";
import { EventCommunicationServiceService } from "../../service/event-communication-service.service";

/*
interface Producto {
  id_producto: string;
  marca: string;
  nombreProducto: string;
  idProbob: string;
  estatus: string;
  fecha_inicio: string;
  fecha_caducidad: string;
  conteoPedidos: number;
}

interface Cliente {
  clave: string;
  estafeta: string;
  telefono: string;
  fotoUrl: string;
  Correo: string;
  nombreCompleto: string;
  fechaRegistro: string;
  huella: string;
  precioPedido: number;
  total: number;
  membresia: string; // Definido para concatenar marca y nombreProducto
  correoCliente: string;
  id_pedido: string;
  fecha_hora_pedido: string;
  id_bodega: string;
  precioCompra: number;
  conteoPedidos: number;
  fecha_inicio: string;
  fecha_caducidad: string;
  idPromocion: string;
  nombrePromocion: string;
  estatus: string;
  productos: Producto[]; // Asegúrate de que productos tenga el tipo Producto
}
*/


interface ClientesActivos {
  Clave: number;
  nombreCompleto: string;
  id_bodega: string;
  Membresia: string;
  nombreProducto: string;
  fechaInicio: string;
  fechaFin: string;
  estatus: string;
}



@Component({
  selector: "app-lista-membresias-pago-efec",
  templateUrl: "./lista-membresias-pago-efec.component.html",
  styleUrls: ["./lista-membresias-pago-efec.component.css"],
  providers: [DatePipe],
})
export class ListaMembresiasPagoEfecComponent implements OnInit {

  cliente: any;
  clienteActivo: ClientesActivos[] = [];
  dataSourceActivos: MatTableDataSource<any>;


  id: any;



  currentUser: string = "";
  idGym: number = 0;

  private fechaInicioAnterior: Date | null = null;
  private fechaFinAnterior: Date | null = null;
  isLoading: boolean = true;
  habilitarBoton: boolean = false;

  sortField: string = "";
  sortDirection: string = "asc";
  // @ViewChild("paginatorPagoOnline", { static: true }) paginator!: MatPaginator;
  @ViewChild("paginatorActivos") paginatorActivos!: MatPaginator;
  @ViewChild('paginatorActivos', { static: true }) paginator!: MatPaginator;


  displayedColumnsActivos: string[] = [
    "ID",
    "Nombre",
    "Membresia",
    "Precio",
    "Fecha Inicio",
    "Fecha Fin",
    "Fecha Registro",
    "Rol",
    "Estatus",
    "Pago",
    "Info Cliente",
    "Huella",
    "Usuario",

  ];
  dataUser: any;

  //fechaInicio: Date = new Date();
  //fechaFin: Date = new Date();
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  Clientes: any;
  isOnline = true;



  constructor(
    private pagoService: PagoMembresiaEfectivoService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private auth: AuthService,
    private networkService: NetworkService,
    private eventCommunicationService: EventCommunicationServiceService
  ) {

    this.dataSourceActivos = new MatTableDataSource(this.clienteActivo);


  }

  ngOnInit(): void {

// Suscribirse para ver si el modal de carga de fotos se ha cerrado

    this.eventCommunicationService.eventTriggered$.subscribe(event => {
     
      this.actualizarDatos();
    });

    this.loadData()
    this.auth.idGym.subscribe((data) => {
      this.idGym = data;




    });

    this.auth.comprobar().subscribe((respuesta) => {
      this.habilitarBoton = respuesta.status;
    });



    this.currentUser = this.auth.getCurrentUser();
    if (this.currentUser) {
      this.getSSdata(JSON.stringify(this.currentUser));
    };

  // Suscribirse al estado de conexión
 this.networkService.isOnline$.subscribe((status) => {this.isOnline = status;
   });
  




  }

  getSSdata(data: any) {
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
        this.auth.role.next(resultData.rolUser);
        this.auth.idUser.next(resultData.clave);
        this.auth.idGym.next(resultData.idGym);
        this.auth.nombreGym.next(resultData.direccion);
        this.auth.email.next(resultData.email);
        this.auth.encryptedMail.next(resultData.encryptedMail);
       // console.log('ResultData',resultData)
        this.dataUser= resultData;
        //console.log(' this.dataUser=', this.dataUser)
      },
      error: (error) => {
       this.toastr.error('Ocurrió un error al obtener los datos del usuario', 'Error');
      },
    });
  }


  loadData() {

    setTimeout(() => {

      this.isLoading = false;
      this.listaClientesData3();


    }, 1000);

    this.dataSourceActivos = new MatTableDataSource(this.clienteActivo);
    this.dataSourceActivos.paginator = this.paginatorActivos;
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


    // Actualizar los valores anteriores
    this.fechaInicioAnterior = this.fechaInicio;
    this.fechaFinAnterior = this.fechaFin;

    this.listaClientesData3()
    //this.updateDateLogs();
  }
}


  sortData(column: string): void {
    const data = this.dataSourceActivos.data;

    if (this.sortField === column) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortField = column;
      this.sortDirection = "asc";
    }

    data.sort((a, b) => {
      const isAsc = this.sortDirection === "asc";
      switch (column) {
        case "ID":
          return this.compare(Number(a.estafeta || 0), Number(b.estafeta || 0), isAsc);
          case "Nombre":
            return this.compare(
              (a.nombreCompleto || "").trim(),
              (b.nombreCompleto || "").trim(),
              isAsc
            );

        case "Precio":
          return this.compare(Number(a.precioPedido || 0), Number(b.precioPedido || 0), isAsc);
          case "Membresia":
            return this.compare(
              `${a.membresia || ""}`,
              `${b.membresia || ""}`,
              isAsc
            );
        case "Fecha Inicio":
          return this.compare(
            new Date(a.fecha_inicio || "1900-01-01"),
            new Date(b.fecha_inicio || "1900-01-01"),
            isAsc
          );
        case "Fecha Fin":
          return this.compare(
            new Date(a.fecha_caducidad || "1900-01-01"),
            new Date(b.fecha_caducidad || "1900-01-01"),
            isAsc
          );
        case "Fecha Registro":
          return this.compare(
            new Date(a.fechaRegistro || "1900-01-01"),
            new Date(b.fechaRegistro || "1900-01-01"),
            isAsc
          );
        case "Estatus":
          return this.compare(Number(a.STATUS || 0), Number(b.STATUS || 0), isAsc);
        default:
          return 0;
      }
    });

    this.dataSourceActivos.data = [...data];
  }


  compare(
    a: string | number | Date | null | undefined,
    b: string | number | Date | null | undefined,
    isAsc: boolean
  ): number {
    if (a == null) return isAsc ? -1 : 1; // Los valores nulos se colocan al final
    if (b == null) return isAsc ? 1 : -1;

    if (typeof a === "string" && typeof b === "string") {
      return a.localeCompare(b, undefined, { sensitivity: "base" }) * (isAsc ? 1 : -1);
    }

    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  applyFilterActivos(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceActivos.filter = filterValue.trim().toLowerCase();
  }

  abrirInfoCliente(prod: any): void {
    this.dialog
      .open(EmergenteInfoClienteComponent, {
        data: {
          idCliente: `${prod.clave}`,
          nombre: `${prod.nombreCompleto}`,
          telefono: `${prod.telefono}`,
          email: `${prod.Correo}`,
          peso: `${prod.peso}`,
          estatura: `${prod.estatura}`,
          estafeta: `${prod.estafeta}`,
          membresia: `${prod.membresia}`,
          precio: `${prod.precio}`,
          huella: `${prod.huella}`,
          duracion: `${prod.diasSuscripcion}`,
          idSucursal: `${this.dataUser.idGym}`,
          infoMembresia: `${prod.Info_Membresia}`,
          foto: `${prod.fotoUrl}`,
          action: `${prod.accion}`,
          fecha_caducidad: `${prod.fecha_caducidad}`,
          productos:  JSON.stringify(prod.productos),
        },
        width: "70%",
        //height: "90%",
        disableClose: true,
      })
      .afterClosed()
      .subscribe((cerrarDialogo: Boolean) => {
        if (cerrarDialogo) {
          this.listaClientesData3();
        }
      });

  }

  abrirEmergente(prod: any) {
    const dialogRef = this.dialog.open(FormPagoEmergenteComponent, {
      data: {
        idCliente: `${prod.clave}`,
        nombre: `${prod.nombreCompleto}`,
        membresia: `${prod.Membresia}`,
        productos: `${prod.productos}`,
        dateStart: `${prod.fechaInicio}`,
        dateEnd: `${prod.fechaFin}`,
        precio: `${prod.precio}`,
        duracion: `${prod.diasSuscripcion}`,
        idSucursal: `${this.dataUser.idGym}`,
        idMem: `${prod.Membresia_idMem}`,
        detMemID: `${prod.idDetMem}`,
        correo: `${prod.Correo}`,
      },
      width: "70%",
      //height: "80%",
      disableClose: true,
    });
    dialogRef.componentInstance.actualizarTablas.subscribe(
      (actualizar: boolean) => {
        if (actualizar) {
          this.listaClientesData3();
        }
      }
    );

    dialogRef.afterClosed().subscribe((cancelDialog: boolean) => {
      if (cancelDialog) {
        this.listaClientesData3();
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


  eliminarCliente(prod: any) {
    const clave = prod.clave; // Usar 'clave' como identificador del cliente

    this.dialog
      .open(MensajeEliminarComponent, {
        data: `¿Desea eliminar a este usuario?`,
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.pagoService.deleteServiceUsuario(clave).subscribe({
            next: (respuesta) => {
              if (respuesta.success === 1) {
            
                this.toastr.success('Registro eliminado exitosamente', 'Éxito', {
                  positionClass: 'toast-bottom-left',
                });
                this.listaClientesData3(); // Actualizar lista de clientes
              } else {
                // Mostrar un Toast de error si la respuesta no es exitosa
                this.toastr.error(
                  'Ocurrió un error al eliminar el registro',
                  'Error',
                  { positionClass: 'toast-bottom-left' }
                );
              }
            },
            error: (error) => {
              // Mostrar un Toast en caso de error al comunicarse con el servicio
              this.toastr.error(
                'No se pudo procesar la solicitud. Intente de nuevo más tarde.',
                'Error',
                { positionClass: 'toast-bottom-left' }
              );
            },
          });
        }
      });
  }








  AbrirRegistro() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = `Empleado agregado correctamente.`;
    dialogConfig.disableClose = true; // Bloquea el cierre del diálogo haciendo clic fuera de él
    dialogConfig.width = '75%';
    dialogConfig.height = '95%';
    this.dialog.open(RegistroComponent, dialogConfig)
    .afterClosed()
    .subscribe((cerrarDialogo: boolean) => {
      if (cerrarDialogo) {
        this.listaClientesData3();  // Actualizar la lista o realizar alguna acción
      }
      // Puedes agregar más acciones aquí si es necesario cuando cerrarDialogo sea false
    });


  }


    listaClientesData3(): void {
   
      this.pagoService.obtenerActivos(this.auth.idGym.getValue()).subscribe(
        (response: any) => {

          if (!response) {
            // Muestra el mensaje de error
            return; // Salir del método
          }

          const respuestaApi = response.data;

          this.Clientes=respuestaApi


          // Obtenemos la lista completa de clientes desde la respuesta.
          const Clientes =this.Clientes;


       

          // Validamos si las fechas están definidas; si no, usamos valores predeterminados.
          const fechaInicio = this.fechaInicio ? new Date(this.fechaInicio) : new Date('2000-01-01');
          const fechaFin = this.fechaFin ? new Date(this.fechaFin) : new Date();
          fechaFin.setHours(23, 59, 0); // Ajustamos hora fin del día.

          // Filtramos los clientes dentro del rango de fechas.
          const filtradosPorFecha = Clientes.filter((cliente: any) => {
            const fechaRegistro = new Date(cliente.fechaRegistro);
            return fechaRegistro >= fechaInicio && fechaRegistro <= fechaFin;
          });

        

          // Separar los clientes en dos grupos: con pedidos (id_pedido != null) y sin pedidos (id_pedido == null)
          const clientesConPedidos = filtradosPorFecha.filter((cliente: any) => cliente.id_pedido != null);
          const clientesSinPedidos = filtradosPorFecha.filter((cliente: any) => cliente.id_pedido == null);

     

          // Agrupar los clientes con pedidos
          const pedidosAgrupados = this.pagoService.agruparPorPedido(clientesConPedidos);




          // Agrupar pedidos únicos por usuario y evitar duplicados por id_pedido
          const pedidosPorUsuario: Record<string, any[]> = pedidosAgrupados.reduce((acc: Record<string, any[]>, item: any) => {
            const identificador = item.clave; // Usamos "clave" para identificar al usuario.
            const idPedido = item.id_pedido;

            // Si no existe un grupo para este usuario, lo creamos.
            if (!acc[identificador]) acc[identificador] = [];

            // Verificamos si ya se agregó este pedido (por id_pedido) al grupo del usuario.
            const existePedido = acc[identificador].some((pedido) => pedido.id_pedido === idPedido);
            if (!existePedido) {
              acc[identificador].push(item); // Agregamos el pedido si no se ha agregado previamente.
            }

            return acc; // Retornamos el objeto acumulador.
          }, {});

      

     ///////////////////// HASTA AQUI VA BIEN////////////////////////


     const clavesConPedido = new Set(
      Object.values(pedidosPorUsuario).flat().map(pedido => pedido.clave)
    );


  ///¿Como quitar del arreglo clientesSinPedidos aquellos registros donde coincidan clavesConPedido con el campo clave

  const clientesSinPedidosFiltrados = clientesSinPedidos
  .filter((cliente: any) => {
    // Verificamos si la clave del cliente está en el conjunto de claves con pedido
    return !clavesConPedido.has(cliente.clave);
  })
  .map((cliente: any) => {
    // Agregamos el campo 'productos' como un arreglo vacío
    return {
      ...cliente,
      productos: []  // Campo 'productos' vacío
    };
  });

  









          const pedidosCaducados = Object.values(pedidosPorUsuario)
          .filter((pedidos: any[]) =>
            pedidos.every(pedido => pedido.estatus === "0") // Verifica que todos los pedidos estén caducos
          )
          .map((pedidos: any[]) =>
            pedidos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0] // Ordena por fecha descendente y toma el último
          );


///Implementarse aqui///



  const filteredData = Object.values(pedidosPorUsuario) // Convertir el objeto en un arreglo de valores
  .flat() // Aplanar para obtener un solo nivel de objetos
  .filter((item: any) =>
    Array.isArray(item.productos) && // Verificar que item.productos es un array
    item.productos.some((producto: any) => // Declarar explícitamente el tipo de 'producto'
      producto.conteoPedidos === "1" && producto.estatus === "1"
    )
  );






          // Combinamos ambos resultados (con pedidos y sin pedidos), además de los pedidos caducados
          const clientesFinales = [...clientesSinPedidosFiltrados,...filteredData,...pedidosCaducados];











          ////////////SOLO FILTRO y ODERNAR POR FEHCA_REGISTRO///////////////////

          // Ahora ordenamos el arreglo final por `fechaRegistro` antes de asignarlo a `clienteActivo`.
          this.clienteActivo = clientesFinales.sort((a: any, b: any) => {
            const fechaA = new Date(a.fechaRegistro).getTime();
            const fechaB = new Date(b.fechaRegistro).getTime();
            return fechaB - fechaA; // Ascendente (de más antiguo a más reciente)
          });

          // console.log("clienteActivo final (agrupados y sin pedidos):", this.clienteActivo);

          // Actualizamos el DataSource de la tabla
          this.dataSourceActivos = new MatTableDataSource(this.clienteActivo);
          this.dataSourceActivos.paginator = this.paginatorActivos;

        },
        (error: any) => {
         this.toastr.error('Ocurrió un error al obtener los datos de los clientes', 'Error');
        }
      );
   
  }







    abrirPuertoSerial(data: any): void {

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


    actualizarDatos() {

  this.loadData();
    }

}
