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
  total:string;
  productos: Producto[];
}

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  currentUser: string = "";
  currentDate: string = ''; 
  timer: any; 
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
  yAxisLabel2sd = "Quincena";
  yAxisLabel3 = "Visita";
  timeline: boolean = false;



  //define la apariencia visual del gráfico en términos de colores.
  colorScheme: Color = {
    domain: ["#FF8C00", "#000000"], //Un arreglo de colores
    name: "cool", //El nombre de la paleta de colores
    selectable: true, // indica si los colores son seleccionables.
    group: ScaleType.Ordinal, // representación visual que es especialmente útil cuando tus datos son categóricos o discretos y deseas proporcionar una representación clara y distintiva para cada categoría en tu gráfico.
  };


  grafico1:any=[];

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
  salesData: any;
  //visitsData_ any;

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
    this.consultarMembresia();
    this.updateDate(); 
    this.startDateUpdater();
    //this.processSalesData();
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
this.pagoService.getPedidosMembresias(this.auth.idGym.getValue()).subscribe(
  (response) => {
    console.log(this.auth.idGym.getValue(),'id')
    if (response.success === 1) {
      const pedidos = response.data; // Almacenamos los datos de la respuesta
      console.log('API',response.data)

      
      const pedidosAgrupados = this.agruparPorPedido(pedidos);
      console.log('Agrupados Por pedido',pedidosAgrupados);
      const ventasDiaGym =this.obtenerVentasDelDia(pedidosAgrupados);
      console.log('ventas del dia',ventasDiaGym)
      
      const pedidosConteoDia= this.contarPorDia(pedidosAgrupados);
      console.log('Conteo por dias',pedidosConteoDia);
      


      this.salesData= pedidosConteoDia
      this.processSalesData();
      //this.processVisitsData();
      this.processSalesDataVisita();
      this.processSalesDataQuincenal();
  
      //this.salesChartData4 = this.procesarVentas(pedidos,'Mensualidad');
      
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
        total:cliente.total,
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
    const fecha = new Date(cliente.fecha_hora_pedido).toISOString().split('T')[0]; // Extraemos solo la fecha (YYYY-MM-DD)

    console.log(`Procesando cliente con fecha: ${fecha}`, cliente);

    if (!conteos[fecha]) {
      conteos[fecha] = {
        conteoProductos: {},
        conteoBodegas: {},
        conteoPromociones: {}
      };
    }

    // **Conteo de productos**
    cliente.productos.forEach((producto, index) => {
      const idProducto = producto.id_producto || `temp_${index}`; // ID temporal si falta
      const nombreProducto = producto.nombreProducto || 'Producto desconocido';

      console.log(`Procesando producto:`, { idProducto, nombreProducto, fecha });

      if (!conteos[fecha].conteoProductos[idProducto]) {
        console.log(`Producto nuevo encontrado, inicializando conteo:`, { idProducto, nombreProducto });
        conteos[fecha].conteoProductos[idProducto] = {
          nombreProducto: nombreProducto,
          cantidad: 0
        };
      }

      conteos[fecha].conteoProductos[idProducto].cantidad += 1;
      console.log(`Producto actualizado:`, conteos[fecha].conteoProductos[idProducto]);
    });

    // **Conteo de bodegas**
    cliente.productos.forEach((producto, index) => {
      const idBodPro = producto.idBodPro || `temp_bodega_${index}`;
      const marcaYProducto = `${producto.marca} - ${producto.nombreProducto}`;

      console.log(`Procesando bodega:`, { idBodPro, marcaYProducto, fecha });

      if (!conteos[fecha].conteoBodegas[idBodPro]) {
        console.log(`Bodega nueva encontrada, inicializando conteo:`, { idBodPro, marcaYProducto });
        conteos[fecha].conteoBodegas[idBodPro] = {
          marcaYProducto: marcaYProducto,
          cantidad: 0
        };
      }

      conteos[fecha].conteoBodegas[idBodPro].cantidad += 1;
      console.log(`Bodega actualizada:`, conteos[fecha].conteoBodegas[idBodPro]);
    });

    // **Conteo de promociones**
    if (cliente.id_promocion && cliente.nombrePromocion) {
      console.log(`Procesando promoción:`, { id_promocion: cliente.id_promocion, nombrePromocion: cliente.nombrePromocion, fecha });

      if (!conteos[fecha].conteoPromociones[cliente.id_promocion]) {
        console.log(`Promoción nueva encontrada, inicializando conteo:`, { id_promocion: cliente.id_promocion, nombrePromocion: cliente.nombrePromocion });
        conteos[fecha].conteoPromociones[cliente.id_promocion] = {
          nombrePromocion: cliente.nombrePromocion,
          cantidad: 0
        };
      }

      conteos[fecha].conteoPromociones[cliente.id_promocion].cantidad += 1;
      console.log(`Promoción actualizada:`, conteos[fecha].conteoPromociones[cliente.id_promocion]);
    }
  });

  console.log('Conteos finales:', conteos);
  return conteos;
}



///////////MENSUALIDAD/////////////
// Configuración de ngx-charts
view2: [number, number] = [900, 900]; // Tamaño del gráfico
colorScheme2: Color = {
  domain: ["#FF8C00", "#000000"], // Colores
  name: "cool",
  selectable: true,
  group: ScaleType.Ordinal,
};
gradient2: boolean = false;
showXAxis2: boolean = true;
showYAxis2: boolean = true;
showXAxisLabel2: boolean = true;
xAxisLabel2: string = '';
showYAxisLabel2: boolean = true;
yAxisLabel2: string = '';
timeline2: boolean = true;
yScaleMax2: number | undefined = undefined; // Escala Y dinámica

// Datos del gráfico
salesChartData: any[] = []; // Aquí guardaremos los resultados procesados

// Producto seleccionado dinámicamente
selectedProduct2: string = 'Mensualidad'; // Valor inicial
currentMonthStr: string='';



// Procesar los datos
processSalesData() {
  // Obtener el mes y el año actual dinámicamente
  console.log('hola');
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0'); // Formato 'MM'
  const currentMonthStr = `${currentYear}-${currentMonth}`; // Mes actual en formato 'YYYY-MM'

  // El mes anterior
  const previousMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1); // Restamos 1 mes
  const previousYear = previousMonthDate.getFullYear();
  const previousMonth = (previousMonthDate.getMonth() + 1).toString().padStart(2, '0'); // Formato 'MM'
  const previousMonthStr = `${previousYear}-${previousMonth}`; // Mes pasado en formato 'YYYY-MM'

  // Obtener días totales del mes actual y mes anterior
  const daysInCurrentMonth = today.getDate(); // Solo hasta el día actual del mes actual
  const daysInPreviousMonth = new Date(previousYear, parseInt(previousMonth), 0).getDate(); // Último día del mes anterior

  // Inicializar series con días y valores en 0
  const currentMonthSales: { name: string; value: number }[] = Array.from(
    { length: daysInCurrentMonth },
    (_, i) => ({ name: `${i + 1}`, value: 0 })
  );
  const previousMonthSales: { name: string; value: number }[] = Array.from(
    { length: daysInPreviousMonth },
    (_, i) => ({ name: `${i + 1}`, value: 0 })
  );

  // Rellenar datos reales en las series
  Object.keys(this.salesData).forEach((date) => {
    const record = this.salesData[date];
    if (record.conteoProductos) {
      Object.values(record.conteoProductos).forEach((product: any) => {
        if (product.nombreProducto === this.selectedProduct2) {
          const day = parseInt(date.split('-')[2]); // Extraer día (DD)
          if (date.startsWith(currentMonthStr) && day <= daysInCurrentMonth) {
            currentMonthSales[day - 1].value = product.cantidad;
          } else if (date.startsWith(previousMonthStr)) {
            previousMonthSales[day - 1].value = product.cantidad;
          }
        }
      });
    }
  });

  // Calcular el máximo para el eje Y
  const allValues = [
    ...currentMonthSales.map((d) => d.value),
    ...previousMonthSales.map((d) => d.value),
  ];
  this.yScaleMax2 = allValues.length > 0 ? Math.max(...allValues) : 0; // Máximo o 0 si no hay valores

  // Estructurar datos para ngx-charts
  this.salesChartData = [
    {
      name: `${currentMonthStr} (${this.selectedProduct2})`,
      series: currentMonthSales,
    },
    {
      name: `${previousMonthStr} (${this.selectedProduct2})`,
      series: previousMonthSales,
    },
  ];
}
///////////FIN MENSUALIDAD/////////////////

//////////VISITA//////////////////////////

// Configuración de ngx-charts para "Visita"
viewVisita: [number, number] = [900, 900]; // Tamaño del gráfico
colorSchemeVisita: Color = {
  domain: ["#4CAF50", "#FF5722"], // Colores específicos para "Visita"
  name: "visita",
  selectable: true,
  group: ScaleType.Ordinal,
};
gradientVisita: boolean = false;
showXAxisVisita: boolean = true;
showYAxisVisita: boolean = true;
showXAxisLabelVisita: boolean = true;
xAxisLabelVisita: string = '';
showYAxisLabelVisita: boolean = true;
yAxisLabelVisita: string = '';
timelineVisita: boolean = true;
yScaleMaxVisita: number | undefined = undefined; // Escala Y dinámica
currentMonthStrVisita: string = ''; // Mes actual en formato 'YYYY-MM'

// Datos del gráfico
salesChartDataVisita: any[] = []; // Aquí guardaremos los resultados procesados

// Producto seleccionado dinámicamente
selectedProductVisita: string = 'Visita'; // Valor inicial

// Procesar los datos
processSalesDataVisita() {
  // Obtener el mes y el año actual dinámicamente
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0'); // Formato 'MM'
  const currentMonthStrVisita = `${currentYear}-${currentMonth}`; // Mes actual en formato 'YYYY-MM'

  // El mes anterior
  const previousMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1); // Restamos 1 mes
  const previousYear = previousMonthDate.getFullYear();
  const previousMonth = (previousMonthDate.getMonth() + 1).toString().padStart(2, '0'); // Formato 'MM'
  const previousMonthStrVisita = `${previousYear}-${previousMonth}`; // Mes pasado en formato 'YYYY-MM'

  // Obtener días totales del mes actual y mes anterior
  const daysInCurrentMonth = today.getDate(); // Solo hasta el día actual del mes actual
  const daysInPreviousMonth = new Date(previousYear, parseInt(previousMonth), 0).getDate(); // Último día del mes anterior

  // Inicializar series con días y valores en 0
  const currentMonthSalesVisita: { name: string; value: number }[] = Array.from(
    { length: daysInCurrentMonth },
    (_, i) => ({ name: `${i + 1}`, value: 0 })
  );
  const previousMonthSalesVisita: { name: string; value: number }[] = Array.from(
    { length: daysInPreviousMonth },
    (_, i) => ({ name: `${i + 1}`, value: 0 })
  );

  // Rellenar datos reales en las series
  Object.keys(this.salesData).forEach((date) => {
    const record = this.salesData[date];
    if (record.conteoProductos) {
      Object.values(record.conteoProductos).forEach((product: any) => {
        if (product.nombreProducto === this.selectedProductVisita) {
          const day = parseInt(date.split('-')[2]); // Extraer día (DD)
          if (date.startsWith(currentMonthStrVisita) && day <= daysInCurrentMonth) {
            currentMonthSalesVisita[day - 1].value = product.cantidad;
          } else if (date.startsWith(previousMonthStrVisita)) {
            previousMonthSalesVisita[day - 1].value = product.cantidad;
          }
        }
      });
    }
  });

  // Calcular el máximo para el eje Y
  const allValuesVisita = [
    ...currentMonthSalesVisita.map((d) => d.value),
    ...previousMonthSalesVisita.map((d) => d.value),
  ];
  this.yScaleMaxVisita = allValuesVisita.length > 0 ? Math.max(...allValuesVisita) : 0; // Máximo o 0 si no hay valores

  // Estructurar datos para ngx-charts
  this.salesChartDataVisita = [
    {
      name: `${currentMonthStrVisita} (${this.selectedProductVisita})`,
      series: currentMonthSalesVisita,
    },
    {
      name: `${previousMonthStrVisita} (${this.selectedProductVisita})`,
      series: previousMonthSalesVisita,
    },
  ];
}

/////////FIN VISITA///////////////////

updateDate(): void {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0'); 
  const day = today.getDate().toString().padStart(2, '0');

  this.currentDate = `${year}-${month}-${day}`;
  console.log('Fecha actualizada:', this.currentDate);
}

startDateUpdater(): void {
  this.timer = setInterval(() => {
    this.updateDate();
  }, 24 * 60 * 60 * 1000); 
}


// Actualizar producto seleccionado
updateSelectedProduct2(productName: string) {
  this.selectedProduct2 = productName;
  this.processSalesData(); // Actualizar los datos del gráfico
  this.processSalesDataVisita();

}



////////QUINCENA/////////////////////
viewQuincenal: [number, number] = [900, 900]; // Tamaño del gráfico
colorSchemeQuincenal: Color = {
  domain: ["#4CAF50", "#FF5722"], // Colores específicos para "Visita"
  name: "Quincenal",
  selectable: true,
  group: ScaleType.Ordinal,
};
gradientQuincenal: boolean = false;
showXAxisQuincenal: boolean = true;
showYAxisQuincenal: boolean = true;
showXAxisLabelQuincenal: boolean = true;
xAxisLabelQuincenal: string = '';
showYAxisLabelQuincenal: boolean = true;
yAxisLabelQuincenal: string = '';
timelineQuincenal: boolean = true;
yScaleMaxQuincenal: number | undefined = undefined; // Escala Y dinámica
currentMonthStrQuincenal: string = ''; // Mes actual en formato 'YYYY-MM'

// Datos del gráfico
salesChartDataQuincenal: any[] = []; // Aquí guardaremos los resultados procesados

// Producto seleccionado dinámicamente
selectedProductQuincenal: string = 'Quincenal'; // Valor inicial

// Procesar los datos
processSalesDataQuincenal() {
  // Obtener el mes y el año actual dinámicamente
  console.log('hola');
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0'); // Formato 'MM'
  this.currentMonthStrQuincenal = `${currentYear}-${currentMonth}`; // Mes actual en formato 'YYYY-MM'

  // El mes anterior
  const previousMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1); // Restamos 1 mes
  const previousYear = previousMonthDate.getFullYear();
  const previousMonth = (previousMonthDate.getMonth() + 1).toString().padStart(2, '0'); // Formato 'MM'
  const previousMonthStr = `${previousYear}-${previousMonth}`; // Mes pasado en formato 'YYYY-MM'

  // Obtener días totales del mes actual y mes anterior
  const daysInCurrentMonth = today.getDate(); // Solo hasta el día actual del mes actual
  const daysInPreviousMonth = new Date(previousYear, parseInt(previousMonth), 0).getDate(); // Último día del mes anterior

  // Inicializar series con días y valores en 0
  const currentMonthSales: { name: string; value: number }[] = Array.from(
    { length: daysInCurrentMonth },
    (_, i) => ({ name: `${i + 1}`, value: 0 })
  );
  const previousMonthSales: { name: string; value: number }[] = Array.from(
    { length: daysInPreviousMonth },
    (_, i) => ({ name: `${i + 1}`, value: 0 })
  );

  // Rellenar datos reales en las series
  Object.keys(this.salesData).forEach((date) => {
    const record = this.salesData[date];
    if (record.conteoProductos) {
      Object.values(record.conteoProductos).forEach((product: any) => {
        if (product.nombreProducto === this.selectedProductQuincenal) {
          const day = parseInt(date.split('-')[2]); // Extraer día (DD)
          if (date.startsWith(this.currentMonthStrQuincenal) && day <= daysInCurrentMonth) {
            currentMonthSales[day - 1].value = product.cantidad;
          } else if (date.startsWith(previousMonthStr)) {
            previousMonthSales[day - 1].value = product.cantidad;
          }
        }
      });
    }
  });

  // Calcular el máximo para el eje Y
  const allValues = [
    ...currentMonthSales.map((d) => d.value),
    ...previousMonthSales.map((d) => d.value),
  ];
  this.yScaleMaxQuincenal = allValues.length > 0 ? Math.max(...allValues) : 0; // Máximo o 0 si no hay valores

  // Estructurar datos para ngx-charts
  this.salesChartDataQuincenal = [
    {
      name: `${this.currentMonthStrQuincenal} (${this.selectedProductQuincenal})`,
      series: currentMonthSales,
    },
    {
      name: `${previousMonthStr} (${this.selectedProductQuincenal})`,
      series: previousMonthSales,
    },
  ];
}


///////FIN QUINCENA/////////////////



obtenerVentasDelDia(pedidos: any[]): any[] {
  const hoy = new Date();
  // Ajustamos la fecha para las horas 00:00:00
  const inicioDia = new Date(hoy.setHours(0, 0, 0, 0));
  // Ajustamos la fecha para las horas 23:59:59
  const finDia = new Date(hoy.setHours(23, 59, 59, 999));

  return pedidos.filter(pedido => {
    const fechaPedido = new Date(pedido.fecha_hora_pedido);
    // Compara si la fecha del pedido está dentro del rango del día actual
    return fechaPedido >= inicioDia && fechaPedido <= finDia;
  });
}

}













