import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { DatePipe } from "@angular/common";
import { FormBuilder, FormGroup} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "../../service/auth.service";
import { PagoMembresiaEfectivoService } from "../../service/pago-membresia-efectivo.service";
import { MensajeEliminarComponent } from "../mensaje-eliminar/mensaje-eliminar.component";
import { FormPagoEmergenteComponent } from "../form-pago-emergente/form-pago-emergente.component";

import { EmergenteInfoClienteComponent } from "../emergente-info-cliente/emergente-info-cliente.component";

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
@Component({
  selector: "app-lista-membresias-pago-efec",
  templateUrl: "./lista-membresias-pago-efec.component.html",
  styleUrls: ["./lista-membresias-pago-efec.component.css"],
  providers: [DatePipe],
})
export class ListaMembresiasPagoEfecComponent implements OnInit {
  form: FormGroup;
  cliente: any;
  clienteActivo: ClientesActivos[] = [];
  dataSourceActivos: MatTableDataSource<any>;
  dataSourceReenovacion: any;
  fechaInicio: Date = new Date("0000-00-00");
  fechaFin: Date = new Date("0000-00-00");
  id: any;
  dineroRecibido: number = 0;
  moneyRecibido: number = 0;
  cash: number = 0;
  currentUser: string = "";
  idGym: number = 0;
  totalVentas: number = 0;
  private fechaInicioAnterior: Date | null = null;
  private fechaFinAnterior: Date | null = null;
  isLoading: boolean = true;
  habilitarBoton: boolean = false;
  todosClientes: any;
  sortField: string = "";
  sortDirection: string = "asc";
  @ViewChild("paginatorPagoOnline", { static: true }) paginator!: MatPaginator;
  @ViewChild("paginatorActivos") paginatorActivos!: MatPaginator;
  @ViewChild("paginatorReenovacionMem", { static: true })
  paginatorReenovacion!: MatPaginator;
  displayedColumnsActivos: string[] = [
    "Clave",
    "Nombre",
    "Membresia",
    "Precio",
    "Fecha Inicio",
    "Fecha Fin",
    "Fecha Registro",
    "Estatus",
    "Pago",
    "Info Cliente",
    "Huella",
    "Rol",
  ];

  constructor(
    private pagoService: PagoMembresiaEfectivoService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private auth: AuthService
  ) {

    this.dataSourceActivos = new MatTableDataSource(this.clienteActivo);

    this.form = this.fb.group({
      idUsuario: [""],
      action: ["add"],
    });
  }

  ngOnInit(): void {
    // this.pagoService.comprobar();
    // this.auth.comprobar();
    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
      this.listaClientesData();
    });

    this.auth.comprobar().subscribe((respuesta) => {
      this.habilitarBoton = respuesta.status;
    });

    this.currentUser = this.auth.getCurrentUser();
    if (this.currentUser) {
      this.getSSdata(JSON.stringify(this.currentUser));
    }
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
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  listaClientesData(): void {
    this.pagoService.obtenerActivos(this.auth.idGym.getValue()).subscribe(
      (response: any) => {
        this.clienteActivo = response.data;
        this.dataSourceActivos = new MatTableDataSource(this.clienteActivo);
        this.loadData();
      },
      (error: any) => {
        console.error("Error al obtener activos:", error);
      }
    );
  }

  loadData() {
    setTimeout(() => {
      this.isLoading = false;
      this.dataSourceActivos.paginator = this.paginatorActivos;
    }, 1000);
  }

  ngDoCheck(): void {
    if (
      this.fechaInicio !== this.fechaInicioAnterior ||
      this.fechaFin !== this.fechaFinAnterior
    ) {
      this.updateDateLogs();
    }
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, "yyyy-MM-dd") || "";
  }

  updateDateLogs(): void {
    this.fechaInicioAnterior = this.fechaInicio;
    this.fechaFinAnterior = this.fechaFin;
    this.pagoService
      .obtenerClientes(
        this.formatDate(this.fechaInicio),
        this.formatDate(this.fechaFin),
        this.auth.idGym.getValue()
      )
      .subscribe(
        (response) => {
          if (response.msg == "No hay resultados") {
            this.clienteActivo = [];
            this.dataSourceActivos = new MatTableDataSource(this.clienteActivo);
            this.dataSourceActivos.paginator = this.paginatorActivos;
          } else if (response.data) {
            this.clienteActivo = response.data;
            this.dataSourceActivos = new MatTableDataSource(this.clienteActivo);
            this.loadData();
          }
        },
        (error) => {
          console.error("Error en la solicitud:", error);
          this.clienteActivo = [];
          this.dataSourceActivos = new MatTableDataSource(this.clienteActivo);
          this.dataSourceActivos.paginator = this.paginatorActivos;
          this.toastr.error("Ocurrió un error.", "¡Error!");
        }
      );
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
        case "Clave":
          return this.compare(a.estafeta, b.estafeta, isAsc);
        case "Nombre":
          return this.compare(
            a.Nombre ? a.Nombre : a.nombre,
            b.Nombre ? b.Nombre : b.nombre,
            isAsc
          );
        case "Precio":
          return this.compare(a.Precio, b.Precio, isAsc);
        case "Membresia":
          return this.compare(a.Membresia, b.Membresia, isAsc);
        case "Fecha Inicio":
          return this.compare(
            new Date(a.Fecha_Inicio),
            new Date(b.Fecha_Inicio),
            isAsc
          );
        case "Fecha Fin":
          return this.compare(
            new Date(a.Fecha_Fin),
            new Date(b.Fecha_Fin),
            isAsc
          );
        case "Estatus":
          return this.compare(a.STATUS, b.STATUS, isAsc);
        default:
          return 0;
      }
    });
    this.dataSourceActivos.data = data;
  }

  compare(
    a: string | number | Date,
    b: string | number | Date,
    isAsc: boolean
  ): number {
    if (typeof a === "string" && typeof b === "string") {
      // Utiliza localeCompare para comparar cadenas de texto
      return (
        a.localeCompare(b, undefined, { sensitivity: "base" }) *
        (isAsc ? 1 : -1)
      );
    }
    // Para otros tipos, utiliza comparación estándar
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
          idCliente: `${prod.ID}`,
          nombre: `${prod.Nombre}`,
          telefono: `${prod.telefono}`,
          email: `${prod.email}`,
          peso: `${prod.peso}`,
          estatura: `${prod.estatura}`,
          estafeta: `${prod.estafeta}`,
          membresia: `${prod.Membresia}`,
          precio: `${prod.Precio}`,
          huella: `${prod.huella}`,
          duracion: `${prod.Duracion}`,
          idSucursal: `${prod.Gimnasio_idGimnasio}`,
          infoMembresia: `${prod.Info_Membresia}`,
          foto: `${prod.foto}`,
          action: `${prod.accion}`,
        },
        width: "70%",
        //height: "90%",
        disableClose: true,
      })
      .afterClosed()
      .subscribe((cerrarDialogo: Boolean) => {
        if (cerrarDialogo) {
          this.listaClientesData();
        } 
      });
  }

  abrirEmergente(prod: any) {
    const dialogRef = this.dialog.open(FormPagoEmergenteComponent, {
      data: {
        idCliente: `${prod.ID}`,
        nombre: `${prod.Nombre ?? prod.nombre}`,
        membresia: `${prod.Membresia}`,
        dateStart: `${prod.Fecha_Inicio}`,
        dateEnd: `${prod.Fecha_Fin}`,
        precio: `${prod.Precio}`,
        duracion: `${prod.Duracion}`,
        idSucursal: `${prod.Gimnasio_idGimnasio}`,
        idMem: `${prod.Membresia_idMem}`,
        detMemID: `${prod.idDetMem}`,
      },
      width: "70%",
      //height: "80%",
      disableClose: true,
    });
    dialogRef.componentInstance.actualizarTablas.subscribe(
      (actualizar: boolean) => {
        if (actualizar) {
          this.listaClientesData();
        }
      }
    );

    dialogRef.afterClosed().subscribe((cancelDialog: boolean) => {
      if (cancelDialog) {
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
  
  eliminarUs(prod: any) {
    const prueba = {
      idUsuario: prod.ID,
      correo: prod.email,
    };
    this.dialog
      .open(MensajeEliminarComponent, {
        data: `¿Desea eliminar a este usuario?`,
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.listaClientesData();
        } 
      });
  }

  eliminarCliente(prod: any) {
    const prueba = {
      idUsuario: prod.ID,
    };
    this.dialog
      .open(MensajeEliminarComponent, {
        data: `¿Desea eliminar a este usuario?`,
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.pagoService
            .deleteServiceUsuario(prueba)
            .subscribe((respuesta) => {
              this.listaClientesData();
            });
        } else {
        }
      });
  }
}
