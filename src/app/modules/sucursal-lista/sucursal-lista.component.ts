import { Component, OnInit, ViewChild } from "@angular/core";
import { GimnasioService } from "./../../service/gimnasio.service";
import { MensajeDesactivarComponent } from "../mensaje-desactivar/mensaje-desactivar.component";
import { MatDialog } from "@angular/material/dialog";
import { HorariosComponent } from "../horarios/horarios.component";
import { HorariosVistaComponent } from "../horarios-vista/horarios-vista.component";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { AuthService } from "../../service/auth.service";
import { ArchivosComponent } from "../archivos/archivos.component";
import { ColaboradorService } from "../../service/colaborador.service";
import { PostalCodeService } from "./../../service/cp.service";
@Component({
  selector: "app-sucursal-lista",
  templateUrl: "./sucursal-lista.component.html",
  styleUrls: ["./sucursal-lista.component.css"],
})
export class SucursalListaComponent implements OnInit {
  gimnasio: any;
  message: string = "";
  idGimnasio: any;
  hayHorarios: boolean = false;
  public sucursales: any;
  public page: number = 0;
  public search: string = "";
  optionToShow: number = 0;
  currentUser: string = "";
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private gimnasioService: GimnasioService,
    public dialog: MatDialog,
    private auth: AuthService,
    private colaborador: ColaboradorService,
    private postalCodeService: PostalCodeService
  ) {}

  displayedColumns: string[] = [
    "nombre",
    "direccion",
    "telefono",
    "actions",
    "ubicacion",
    "activar",
    "documentacion",
  ];

  onToggle(event: Event, idGimnasio: any) {
    let gimnasio = this.gimnasio.find(
      (g: { id_bodega: any }) => g.id_bodega == idGimnasio
    );
    let mensaje =
      gimnasio.estatus == 1
        ? "¿Deseas desactivar esta sucursal?"
        : "¿Deseas activar esta sucursal?";
    const dialogRef = this.dialog.open(MensajeDesactivarComponent, {
      data: { mensaje: mensaje, idGimnasio: idGimnasio },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Invertir el valor del estatus
        const nuevoEstatus = gimnasio.estatus == 1 ? 0 : 1;
        // Actualizar la base de datos y refrescar los datos
        this.gimnasioService
          .actualizarEstatus(idGimnasio, nuevoEstatus)
          .subscribe(
            (response) => {
              if (response && response.success === 1) {
                gimnasio.estatus = nuevoEstatus;
              } else if (response) {
                console.error(
                  "Error al actualizar el estatus: ",
                  response.error
                );
              } else {
                console.error("Error: la respuesta es null");
              }
            },
            (error) => {
              console.error("Error en la petición: ", error);
            }
          );
      } else {
      }
    });
  }

  ngOnInit(): void {

    this.gimnasioService.comprobar();
    this.auth.comprobar();
    this.colaborador.comprobar();
    this.postalCodeService.comprobar();

    setTimeout(() => {
      this.currentUser = this.auth.getCurrentUser();
      if (this.currentUser) {
        this.getSSdata(JSON.stringify(this.currentUser));
      }
      this.gimnasioService.obternerPlan().subscribe((data) => {
        this.gimnasio = data;
        this.dataSource = new MatTableDataSource(this.gimnasio);
        this.dataSource.paginator = this.paginator;
      });
    }, 3000); 


    this.gimnasioService.botonEstado.subscribe((data) => {
      if (data.respuesta) {
        let gimnasio = this.gimnasio.find(
          (g: { idGimnasio: any }) => g.idGimnasio === data.idGimnasio
        );
        if (!gimnasio) {
          return;
        }
        let datosPlan = {
          estatus: gimnasio.estatus === 1 ? 0 : 1,
        };
        this.gimnasioService
          .actualizarEstatus(data.idGimnasio, datosPlan.estatus)
          .subscribe(
            (response) => {
              if (response && response.success === 1) {
                gimnasio.estatus = datosPlan.estatus;
                this.gimnasioService.obternerPlan().subscribe((data) => {
                  this.gimnasio = data;
                });
              } else if (response) {
                console.error(
                  "Error al actualizar el estatus: ",
                  response.error
                );
              } else {
                console.error("Error: la respuesta es null");
              }
            },
            (error) => {
              console.error("Error en la petición: ", error);
            }
          );
      } else if (!data.respuesta) {
      }
    });
  }

  getSSdata(data: any) {
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
        this.auth.role.next(resultData.rolUser);
        this.auth.userId.next(resultData.id);
        this.auth.idGym.next(resultData.idGym);
        this.auth.nombreGym.next(resultData.nombreGym);
        this.auth.email.next(resultData.email);
        this.auth.encryptedMail.next(resultData.encryptedMail);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  verHorario(idGimnasio: string): void {
    this.gimnasioService.optionSelected.next(1);
    this.gimnasioService.optionSelected.subscribe((data) => {
      if (data) {
        this.optionToShow = data;
        if (this.optionToShow === 1) {
        }
      }
    });
    const dialogRef = this.dialog.open(HorariosVistaComponent, {
      width: "70%",
      height: "90%",
      data: { idGimnasio: idGimnasio },
    });
  }

  agregarSucursal(): void {
    this.gimnasioService.optionSelected.next(2);
    this.gimnasioService.optionSelected.subscribe((data) => {
      if (data) {
        this.optionToShow = data;
        if (this.optionToShow === 2) {
        }
      }
    });

    const dialogRef = this.dialog.open(HorariosVistaComponent, {
      width: "70%",
      height: "90%",
      data: { idGimnasio: this.idGimnasio },
      disableClose: true, // Bloquea el cierre del diálogo haciendo clic fuera de él o presionando Escape
    });

    dialogRef.afterClosed().subscribe(() => {
      this.gimnasioService.obternerPlan().subscribe((data) => {
        this.gimnasio = data;
        this.dataSource = new MatTableDataSource(this.gimnasio);
        this.dataSource.paginator = this.paginator;
      });
    });
  }

  editarSucursal(idGimnasio: number) {
    this.gimnasioService.gimnasioSeleccionado.next(idGimnasio);
    this.gimnasioService.optionSelected.next(3);
    this.gimnasioService.optionSelected.subscribe((data) => {
      if (data) {
        this.optionToShow = data;
        if (this.optionToShow === 3) {
        }
      }
    });

    const dialogRef = this.dialog.open(HorariosVistaComponent, {
      width: "70%",
      height: "90%",
      data: { idGimnasio: this.idGimnasio },
      disableClose: true, // Bloquea el cierre del diálogo haciendo clic fuera de él
    });

    dialogRef.afterClosed().subscribe(() => {
      this.gimnasioService.obternerPlan().subscribe((data) => {
        this.gimnasio = data;
        this.dataSource = new MatTableDataSource(this.gimnasio);
        this.dataSource.paginator = this.paginator;
      });
    });
  }

  agregarHorario(idGimnasio: string): void {
    const dialogRef = this.dialog.open(HorariosComponent, {
      width: "60%",
      height: "90%",
      data: { idGimnasio: idGimnasio },
    });
  }

  agregarDocumentos(id_bodega: string, nombreBodega: string): void {
    const dialogRef = this.dialog.open(ArchivosComponent, {
      width: "60%",
      height: "60%",
      data: { id_bodega: id_bodega, nombreBodega: nombreBodega },
      disableClose: true,
    });
  }

  onSearchPokemon(search: Event) {
    const filterValue = (search.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  verUbicacion(item: any) {
    const direccion = `${item.direccion}`;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${direccion}`,
      "_blank"
    );
  }
}
