import { Component, ViewChild } from "@angular/core";
import { OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from "../../service/auth.service";
import { HomeService } from "../../service/home.service";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { SyncService } from "../../service/sync.service";
import { IndexedDBService } from "./../../service/indexed-db.service";
import { serviciosService } from "../../service/servicios.service";
import { ColaboradorService } from "./../../service/colaborador.service";
import { MembresiaService } from "../../service/membresia.service";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { combineLatest } from "rxjs";
import { Color, ScaleType } from "@swimlane/ngx-charts";
import { PagoMembresiaEfectivoService } from "../../service/pago-membresia-efectivo.service";

interface Producto {
  id_producto: string;
  marca: string;
  nombreProducto: string;
  idBodPro: string;
  nombreCategoria: string;
}

interface Cliente {
  id_pedido: string;
  fecha_hora_pedido: string;
  id_bodega: string;
  id_promocion: string | null;
  nombrePromocion: string;
  membresia: string;
  productos: Producto[];
}

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  currentUser: string = "";
  detallesCaja: any[] = [];
  fechaFiltro: string = "";
  idGym: number = 0;
  idUser: number = 0;
  fechaActual: Date = new Date();
  totalVentas: number = 0;
  mesActual: string = "";
  mesAnterior: string = "";
  totalProductosVendidos: number = 0;
  datosProductosVendidos: any;
  datosRecientesVentas: any;
  datosClientesActivos: any;
  clientesActivos: any;

  homeCard: any;
  homeCard2: any;
  homeCard21: any[] = [];
  homeCardVisita: any[] = [];
  homeCardQuincena: any[] = [];


  tablaHTML: SafeHtml | null = null;
  tablaHTMLVentas: SafeHtml | null = null;
  isLoading: boolean = true;
  asistencia: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource: any;
  displayedColumns: string[] = ["title", "details", "price", "rol"];


  /**graficas**/
  mensualidades: any[] = [];
  mes1Mensualidad: any[] = [];
  mes2Mensualidad: any[] = [];
  visitas: any[] = [];
  mes1visitas: any[] = [];
  mes2visitas: any[] = [];
  quincenas: any[] = [];
  mes1quincenas: any[] = [];
  mes2quincenas: any[] = [];
  view: [number, number] = [250, 230]; // define las dimensiones del gráfico en píxeles
  // controlan si se debe mostrar el eje X  y el eje Y  en el gráfico.
  showXAxis = true;
  showYAxis = true;
  // indica si el gráfico debe tener un degradado o no
  gradient = false;
  legendTitle = "dias";
  //determina si se debe mostrar la etiqueta del eje X
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = "";
  //determina si se debe mostrar la etiqueta del eje y
  showYAxisLabel = true;
  yAxisLabel = "Membresia";
  yAxisLabel2 = "Quincena";
  yAxisLabel3 = "Visita";
  timeline: boolean = false;


  //define la apariencia visual del gráfico en términos de colores.
  colorScheme: Color = {
    domain: ["#FF8C00", "#000000"], //Un arreglo de colores
    name: "cool", //El nombre de la paleta de colores
    selectable: true, // indica si los colores son seleccionables.
    group: ScaleType.Ordinal, // representación visual que es especialmente útil cuando tus datos son categóricos o discretos y deseas proporcionar una representación clara y distintiva para cada categoría en tu gráfico.
  };




  meses = {
    Enero: "01",
    Febrero: "02",
    Marzo: "03",
    Abril: "04",
    Mayo: "05",
    Junio: "06",
    Julio: "07",
    Agosto: "08",
    Septiembre: "09",
    Octubre: "10",
    Noviembre: "11",
    Diciembre: "12",
  };

  fechaMensualidad: string = "";
  fechaVisita: string = "";
  fechaQuincena: string = "";
  año: number = 0;

  constructor(
    private homeService: HomeService,
    private sanitizer: DomSanitizer,
    private auth: AuthService,
    public dialog: MatDialog,
    private syncService: SyncService,
    private indexedDBService: IndexedDBService,
    private http: ColaboradorService,
    public membresiaService: MembresiaService,
    private servicio: serviciosService,
    private pagoService: PagoMembresiaEfectivoService
  ) {}

  fechaFormateada: string = "";
  ngOnInit(): void {
    this.consultarMembresia()

    console.log(this.isLoading)
    // this.auth.comprobar();
    // this.homeService.comprobar();
/*
    const today = new Date();
    const year = today.getFullYear();
    let month = '' + (today.getMonth() + 1);
    let day = '' + today.getDate();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    this.fechaFormateada = [year, month, day].join('-');
    this.año = year;


    this.obtenerMesActual();
    this.obtenerMesAnterior();

    this.currentUser = this.auth.getCurrentUser();
    if (this.currentUser) {
      this.getSSdata(JSON.stringify(this.currentUser));
      
    }

    combineLatest([this.auth.idGym, this.auth.idUser]).subscribe(
      ([idGym, idUser]) => {
        if (idGym && idUser) {
          this.idGym = idGym;
          this.idUser = idUser;
          this.listaTablas();
          this.consultarAsistencia();
          this.grafica1Visitas();
          this.grafica2Visitas();
          this.grafica1Quincena();
          this.grafica2Quincena();
          this.grafica1Mensualidad();
          this.grafica2Mensualidad();
          this.onSelect();
          this.onSelectQuincena();
          this.onSelectVisita();
        }
      }
    );
    */
  }

  /**LOCAL */
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
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  /**SPINNER */
  loadData() {
    setTimeout(() => {
      this.isLoading = false;
      this.dataSource.paginator = this.paginator;
    }, 1000);
  }

  /**graficaaaaaaaaaaaaaaaaaaaaaaaas */

  obtenerMesActual(): void {
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    const fechaActual = new Date();
    const mesIndex = fechaActual.getMonth(); // getMonth() devuelve el índice del mes (0-11)
    this.mesActual = meses[mesIndex];
  }

  obtenerMesAnterior(): void {
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    const fechaActual = new Date();
    let mesIndex = fechaActual.getMonth(); // getMonth() devuelve el índice del mes (0-11)
    mesIndex = mesIndex === 0 ? 11 : mesIndex - 1; // Si es enero (0), debe cambiar a diciembre (11), si no, se resta uno.
    this.mesAnterior = meses[mesIndex];
  }

  grafica1Visitas(): void {
    this.homeService.graficas1Visita(this.idGym).subscribe((respuesta) => {
      this.mes1visitas = respuesta as any[];
      this.updateChart();
    });
  }

  grafica2Visitas(): void {
    this.homeService.graficas2Visita(this.idGym).subscribe((respuesta) => {
      this.mes2visitas = respuesta as any[];
      this.updateChart();
    });
  }

  grafica1Quincena(): void {
    this.homeService.graficas1Quincena(this.idGym).subscribe((respuesta) => {
      this.mes1quincenas = respuesta as any[];
      this.updateChart();
    });
  }

  grafica2Quincena(): void {
    this.homeService.graficas2Quincena(this.idGym).subscribe((respuesta) => {
      this.mes2quincenas = respuesta as any[];
      this.updateChart();
    });
  }

  grafica1Mensualidad(): void {
    this.homeService.graficas(this.idGym).subscribe((respuesta) => {
      this.mes1Mensualidad = respuesta as any[];
      this.updateChart();
    });
  }

  grafica2Mensualidad(): void {
    this.homeService.graficas2(this.idGym).subscribe((respuesta) => {
      this.mes2Mensualidad = respuesta as any[];
      this.updateChart();
    });
  }

  updateChart(): void {
    if (
      this.mes1Mensualidad.length > 0 &&
      this.mes2Mensualidad.length > 0 &&
      this.mes1visitas.length > 0 &&
      this.mes2visitas.length > 0 &&
      this.mes1quincenas.length > 0 &&
      this.mes2quincenas.length > 0
    ) {
      this.mensualidades = [
        {
          name: this.mesActual,
          series: this.mes1Mensualidad,
        },
        {
          name: this.mesAnterior,
          series: this.mes2Mensualidad,
        },
      ];
      this.quincenas = [
        {
          name: this.mesActual,
          series: this.mes1quincenas,
        },
        {
          name: this.mesAnterior,
          series: this.mes2quincenas,
        },
      ];
      this.visitas = [
        {
          name: this.mesActual,
          series: this.mes1visitas,
        },
        {
          name: this.mesAnterior,
          series: this.mes2visitas,
        },
      ];
    }
  }

  graficasFecha(fecha: any): void {
    this.homeService.consultasFechaMensualidad(this.idGym, fecha).subscribe(
      (respuesta: any) => {
        if (typeof respuesta === "object" && respuesta !== null) {
          this.homeCard21 = [respuesta];
        } else {
          console.error("La respuesta no es un objeto válido:", respuesta);
        }
      },
      (error) => {
        console.error("Error al obtener datos:", error);
      }
    );
  }

  graficasFechaVisita(fecha: any): void {
    this.homeService.consultasFechaVisita(this.idGym, fecha).subscribe(
      (respuesta: any) => {
        if (typeof respuesta === "object" && respuesta !== null) {
          this.homeCardVisita = [respuesta]; // Convierte el objeto respuesta en un array con un solo elemento
        } else {
          console.error("La respuesta no es un objeto válido:", respuesta);
        }
      },
      (error) => {
        console.error("Error al obtener datos:", error);
      }
    );
  }

  graficasFechaQuincena(fecha: any): void {
    this.homeService.consultasFechaQuincena(this.idGym, fecha).subscribe(
      (respuesta: any) => {
        if (typeof respuesta === "object" && respuesta !== null) {
          this.homeCardQuincena = [respuesta]; // Convierte el objeto respuesta en un array con un solo elemento
        } else {
          console.error("La respuesta no es un objeto válido:", respuesta);
        }
      },
      (error) => {
        console.error("Error al obtener datos:", error);
      }
    );
  }

  onSelect(event?: any): void {
    if (event == undefined) {
      this.fechaMensualidad = this.fechaFormateada;
      this.graficasFecha(this.fechaFormateada);
    }
    else if (typeof event.series === "string") {
      // Accede a this.meses utilizando una aserción de tipo o verificación de existencia
      const numeroMes = this.meses[event.series as keyof typeof this.meses];
      //this.fechaMensualidad = this.año + "-" + numeroMes + "-" + event.name;
      this.fechaMensualidad = `${this.año}-${numeroMes}-${event.name < 10 ? '0' + event.name : event.name}`;
      this.graficasFecha(this.fechaMensualidad);
    } else {
      console.warn("Nombre de mes no es una cadena válida:", event.series);
    }
  }


  onSelectQuincena(event?: any): void {
    if (event == undefined) {
      this.fechaQuincena = this.fechaFormateada;
      this.graficasFechaQuincena(this.fechaFormateada);
    }
    else if (typeof event.series === "string") {
      // Accede a this.meses utilizando una aserción de tipo o verificación de existencia
      const numeroMes = this.meses[event.series as keyof typeof this.meses];
     // this.fechaQuincena = this.año + "-" + numeroMes + "-" + event.name;
     // Dentro de tu componente
      this.fechaQuincena = `${this.año}-${numeroMes}-${event.name < 10 ? '0' + event.name : event.name}`;
      this.graficasFechaQuincena(this.fechaQuincena);
    } else {
      console.warn("Nombre de mes no es una cadena válida:", event.series);
    }
  }

  onSelectVisita(event?: any): void {
    if (event == undefined) {
      this.fechaVisita = this.fechaFormateada;
      this.graficasFechaVisita(this.fechaFormateada);
    }
    else if (typeof event.series === "string") {
      // Accede a this.meses utilizando una aserción de tipo o verificación de existencia
      const numeroMes = this.meses[event.series as keyof typeof this.meses];
      //this.fechaVisita = this.año + "-" + numeroMes + "-" + event.name;
      this.fechaVisita = `${this.año}-${numeroMes}-${event.name < 10 ? '0' + event.name : event.name}`;
      this.graficasFechaVisita(this.fechaVisita);
    } else {
      console.warn("Nombre de mes no es una cadena válida:", event.series);
    }
  }

  /**LISTA PRODUCTOS */
  listaTablas() {
    this.homeService.consultarHome(this.idGym).subscribe((respuesta) => {
      this.homeCard = respuesta;
    });

    this.homeService.consultarHome2(this.idGym).subscribe((respuesta) => {
      this.homeCard2 = respuesta;
    });

    this.homeService.getAnalyticsData(this.idGym).subscribe((data) => {
      this.tablaHTML = this.sanitizer.bypassSecurityTrustHtml(
        `<table class="mi-tabla">${data.tablaHTML}</table>`
      );
    });
    this.homeService.getARecientesVentas(this.idGym).subscribe((data) => {
      this.tablaHTMLVentas = this.sanitizer.bypassSecurityTrustHtml(
        `<table class="mi-tabla">${data.tablaHTMLVentas}</table>`
      );
    });
  }

  /**ASISTENCIA */

  consultarAsistencia() {
    this.homeService.consultarAsistencias(this.idGym).subscribe((respuesta) => {
      this.asistencia = respuesta;
      this.dataSource = new MatTableDataSource(this.asistencia);
      this.loadData();
    });
  }

  /**Roles**/
  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  isSupadmin(): boolean {
    return this.auth.isSupadmin();
  }

  isRecep(): boolean {
    return this.auth.isRecepcion();
  }

  /**OFLINE */

  Sincronizar() {
    this.indexedDBService
      .getAgregarEmpleadoData("AgregarEmpleado")
      .then((data) => {
        if (data && data.length > 0) {
          let maxId = -1;
          let lastData: any;
          data.forEach((record: any) => {
            this.http.agregarEmpleado(record.data).subscribe({});
          });
          this.indexedDBService.VaciarAgregarEmpleadoData();
        } else {
        }
      });

    this.indexedDBService
      .getAgregarServicioData("AgregarServicio")
      .then((data) => {
        if (data && data.length > 0) {
          let maxId = -1;
          let lastData: any;
          data.forEach((record: any) => {
            this.servicio.newService(record.data).subscribe({});
          });
          this.indexedDBService.VaciarAgregarServicioData();
        } else {
        }
      });

    this.indexedDBService
      .getAgregarMembresiaData("AgregarMembresia")
      .then((data) => {
        if (data && data.length > 0) {
          let maxId = -1;
          let lastData: any;
          data.forEach((record: any) => {
            this.membresiaService.agregarMem(record.data).subscribe({});
          });
          this.indexedDBService.VaciarAgregarMembresiaData();
        } else {
        }
      });

    this.indexedDBService.getAgregarPlanData("AgregarPlan").then((data) => {
      if (data && data.length > 0) {
        let maxId = -1;
        let lastData: any;
        data.forEach((record: any) => {
          this.membresiaService.agregarPlan(record.data).subscribe({});
        });
        this.indexedDBService.VaciarAgregarPlanData();
      } else {
      }
    });

    this.indexedDBService
      .getAgregarRegistroData("AgregarRegistro")
      .then((data) => {
        if (data && data.length > 0) {
          let maxId = -1;
          let lastData: any;
          data.forEach((record: any) => {
            this.http.agregarUsuario(record.data).subscribe({});
          });
          this.indexedDBService.VaciarAgregarRegistroData();
        } else {
        }
      });
  }

  sync() {
    this.syncService.getLocalUsers().subscribe((localData) => {
      this.syncService.getRemoteUsers().subscribe((remoteData) => {
        this.compareAndUpdate(localData.usuarios, remoteData.usuarios);
      });
    });
  }

  compareAndUpdate(localUsers: any[], remoteUsers: any[]) {
    localUsers.forEach((localUser) => {
      const remoteUser = remoteUsers.find(
        (user) => user.email === localUser.email
      );
      if (remoteUser) {
        if (
          new Date(localUser.fecha_registro) >
          new Date(remoteUser.fecha_registro)
        ) {
          this.syncService.updateRemoteUser(localUser).subscribe({
            error: (error) =>
              console.error(
                `Error updating remote user ${localUser.email}`,
                error
              ),
          });
        }
      } else {
        this.syncService.updateRemoteUser(localUser).subscribe({
          error: (error) =>
            console.error(
              `Error adding new remote user ${localUser.email}`,
              error
            ),
        });
      }
    });
    remoteUsers.forEach((remoteUser) => {
      const localUser = localUsers.find(
        (user) => user.email === remoteUser.email
      );
      if (localUser) {
        if (
          new Date(remoteUser.fecha_registro) >
          new Date(localUser.fecha_registro)
        ) {
          this.syncService.updateLocalUser(remoteUser).subscribe({
            error: (error) =>
              console.error(
                `Error updating local user ${remoteUser.email}`,
                error
              ),
          });
        }
      } else {
        this.syncService.updateLocalUser(remoteUser).subscribe({
          error: (error) =>
            console.error(
              `Error adding new local user ${remoteUser.email}`,
              error
            ),
        });
      }
    });
  }


consultarMembresia(){ 
//this.homeService.ConsultarPedidosMembresias(this)
this.pagoService.getPedidosMembresias(4).subscribe(
  (response) => {
    if (response.success === 1) {
      const pedidos = response.data; // Almacenamos los datos de la respuesta
      const pedidosAgrupados = this.agruparPorPedido(pedidos);
      const pedidosConteoDia= this.contarPorDia(pedidosAgrupados);
      console.log(pedidos)
      console.log(pedidosAgrupados)
      console.log(pedidosConteoDia)
    } else {
      const errorMessage = response.message; // Si hay un error, mostramos el mensaje
      console.log(errorMessage)
    }
   
  },
  (error) => {
    
    let errorMessage = 'Hubo un error al obtener los pedidos de membresía.'; // Mensaje de error
    console.error(error); // También lo mostramos en la consola
  }
);
}


 agruparPorPedido(clientes: any[]): any[] {
  // Creamos un objeto para almacenar los resultados agrupados por id_pedido.
  const agrupadosPorPedido: { [key: string]: any } = {};

  clientes.forEach(cliente => {
    const idPedido = cliente.id_pedido;

    if (!agrupadosPorPedido[idPedido]) {
      // Si no existe este `id_pedido` en el objeto agrupador, lo inicializamos.
      agrupadosPorPedido[idPedido] = {
        id_pedido: cliente.id_pedido,
        fecha_hora_pedido: cliente.fecha_hora_pedido,
        id_bodega: cliente.id_bodega,
        id_promocion: cliente.id_promocion,
        nombrePromocion: cliente.nombrePromocion,
        membresia: cliente.nombrePromocion ?? `${cliente.marca} - ${cliente.nombreProducto}`,
        productos: [] // Inicializamos un array vacío para los productos.
      };
    }

    // Agregamos la información del producto al array `productos` correspondiente.
    agrupadosPorPedido[idPedido].productos.push({
      id_producto: cliente.id_producto,
      marca: cliente.marca,
      nombreProducto: cliente.nombreProducto,
      idBodPro: cliente.idBodPro, // Ajustamos el campo a `idBodPro`.
      nombreCategoria: cliente.nombreCategoria // Agregamos el campo `nombreCategoria`.
    });
  });

  // Convertimos el objeto agrupado en un array.
  return Object.values(agrupadosPorPedido);
}


contarPorDia(clientes: Cliente[]): { [fecha: string]: { conteoProductos: any, conteoBodegas: any, conteoPromociones: any } } {
  const conteos: { [fecha: string]: { conteoProductos: any, conteoBodegas: any, conteoPromociones: any } } = {};

  clientes.forEach(cliente => {
    const fecha = new Date(cliente.fecha_hora_pedido).toISOString().split('T')[0]; 

    if (!conteos[fecha]) {
      conteos[fecha] = {
        conteoProductos: {},
        conteoBodegas: {},
        conteoPromociones: {}
      };
    }

    // Conteo de productos (ahora incluye nombreProducto)
    cliente.productos.forEach((producto) => {
      if (producto.id_producto) {
        const idProducto = producto.id_producto;
        const nombreProducto = producto.nombreProducto;

        // Verificamos si el producto ya ha sido contado
        if (!conteos[fecha].conteoProductos[idProducto]) {
          conteos[fecha].conteoProductos[idProducto] = {
            nombreProducto: nombreProducto,
            cantidad: 0
          };
        }

        // Incrementamos la cantidad del producto
        conteos[fecha].conteoProductos[idProducto].cantidad += 1;
      }
    });

    // Conteo de bodegas (agregamos la cadena de marca y nombreProducto)
    cliente.productos.forEach((producto) => {
      if (producto.idBodPro) {
        const idBodPro = producto.idBodPro;
        const marcaYProducto = `${producto.marca} - ${producto.nombreProducto}`;

        // Verificamos si la bodega ya ha sido contada
        if (!conteos[fecha].conteoBodegas[idBodPro]) {
          conteos[fecha].conteoBodegas[idBodPro] = {
            marcaYProducto: marcaYProducto,
            cantidad: 0
          };
        }

        // Incrementamos la cantidad de esa bodega
        conteos[fecha].conteoBodegas[idBodPro].cantidad += 1;
      }
    });

    // Conteo de promociones (ahora incluye nombrePromocion)
    if (cliente.id_promocion && cliente.nombrePromocion) {
      if (!conteos[fecha].conteoPromociones[cliente.id_promocion]) {
        conteos[fecha].conteoPromociones[cliente.id_promocion] = {
          nombrePromocion: cliente.nombrePromocion,
          cantidad: 0
        };
      }

      // Incrementamos el contador de esa promoción
      conteos[fecha].conteoPromociones[cliente.id_promocion].cantidad += 1;
    }
  });

  return conteos;
}

getDatosGraficaPorProducto(data: any, idProducto: string): any[] {
  // Resultado final: [{ name: '2024-12-04', value: 4 }, ...]
  const resultado: any[] = [];

  // Recorrer cada fecha en el objeto original
  Object.keys(data).forEach((fecha) => {
    // Obtener los productos de esa fecha
    const productos = data[fecha]?.conteoProductos || {};

    // Verificar si el producto con el ID dado existe en esa fecha
    if (productos[idProducto]) {
      // Agregar al resultado el nombre de la fecha y el conteo
      resultado.push({
        name: fecha, // La fecha como categoría
        value: productos[idProducto].cantidad, // Cantidad del producto
      });
    }
  });

  return resultado; // Arreglo listo para la gráfica
}

}



