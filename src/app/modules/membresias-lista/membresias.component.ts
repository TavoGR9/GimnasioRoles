import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { ChangeDetectorRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { plan } from "src/app/models/plan";
import { PlanService } from "src/app/service/plan.service";
import { MensajeEliminarComponent } from "../mensaje-eliminar/mensaje-eliminar.component";
import { GimnasioService } from "src/app/service/gimnasio.service";
import { AuthService } from "src/app/service/auth.service";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { DialogSelectMembershipComponent } from "../dialog-select-membership/dialog-select-membership.component";

@Component({
  selector: "app-membresias",
  templateUrl: "./membresias.component.html",
  styleUrls: ["./membresias.component.css"],
})
export class MembresiasComponent implements OnInit {
  membresiaActiva: boolean = true; // Inicializa según el estado de la membresía
  membresias: plan[] = [];
  plan: plan[] = [];
  message: string = "";
  public sucursales: any;
  public page: number = 0;
  public search: string = "";
  dataSource: any;
  currentUser: string = "";
  services: any[] = [];
  idGym: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private planService: PlanService,
    private gimnasioService: GimnasioService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    public dialog: MatDialog
  ) {}

  displayedColumns: string[] = [
    "title",
    "details",
    "price",
    "duration",
    "servicios",
    "actions",
  ];

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    if (this.currentUser) {
      this.getSSdata(JSON.stringify(this.currentUser));
    }

    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
      this.listaTabla();
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
      },
    });
  }

  listaTabla() {
    this.planService.consultarPlanIdMem(this.idGym).subscribe((respuesta) => {
      this.plan = respuesta;
      this.dataSource = new MatTableDataSource(this.plan);
      this.dataSource.paginator = this.paginator; // Asigna el paginador a tu dataSource
    });
  }

  borrarPlan(idMem: any) {
    this.dialog
      .open(MensajeEliminarComponent, {
        data: `¿Desea eliminar esta membresía?`,
      })
      .afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.planService.borrarPlan(idMem).subscribe(
            (respuesta) => {
              this.ngOnInit();
            },
            (error) => {
              this.message =
                "¡Error al eliminar! Hay clientes inscritos en esta membresía";
              setTimeout(() => {
                this.message = ""; // Ocultar el mensaje de error después de 20 segundos
              }, 7000); // 20000 milisegundos = 20 segundos
            }
          );
        } else {
        }
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  toggleCheckbox(idMem: number, status: number) {
    // Guarda el estado actual en una variable temporal
    const estadoOriginal = status;
    const dialogRef = this.dialog.open(MensajeEliminarComponent, {
      data: `¿Desea cambiar el estatus de la categoría?`,
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        const nuevoEstado = status == 1 ? { status: 0 } : { status: 1 };
        this.actualizarEstatusMembresia(idMem, nuevoEstado);
      } else {
      }
    });
  }

  actualizarEstatusMembresia(idMem: number, estado: { status: number }) {
    this.planService.updateMembresiaStatus(idMem, estado).subscribe(
      (respuesta) => {
        this.membresiaActiva = estado.status == 1;
      },
      (error) => {
        console.error("Error al actualizar la membresía:", error);
      }
    );
  }

  openDialog(): void {
    this.planService.optionShow.next(1);
    this.planService.optionShow.subscribe((option) => {});
    const dialogRef = this.dialog.open(DialogSelectMembershipComponent, {
      width: "70%",
      height: "90%",
      disableClose: true,
      data: { name: "¿para quien es esta membresia?" },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.planService.consultarPlanIdMem(this.idGym).subscribe((respuesta) => {
        this.plan = respuesta;
        this.dataSource = new MatTableDataSource(this.plan);
        this.dataSource.paginator = this.paginator; // Asigna el paginador a tu dataSource
      });
    });
  }

  openDialogService(idMem: number, tipo_membresia: number) {
    this.planService.optionShow.next(2);
    this.planService.optionShow.subscribe((option) => {});
    this.planService.setDataToupdate(idMem, tipo_membresia);
    const dialogRef = this.dialog.open(DialogSelectMembershipComponent, {
      width: "50%",
      height: "50%",
      disableClose: true,
      data: { name: "Servicios de la membresia" },
    });
  }

  openDialogEdit(idMem: number, tipo_membresia: number) {
    this.planService.optionShow.next(3);
    this.planService.optionShow.subscribe((option) => {});
    this.planService.setDataToupdate(idMem, tipo_membresia);
    const dialogRef = this.dialog.open(DialogSelectMembershipComponent, {
      width: "70%",
      height: "90%",
      disableClose: true,
      data: { name: "Editar membresia", id: idMem },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.planService.consultarPlanIdMem(this.idGym).subscribe((respuesta) => {
        this.plan = respuesta;
        this.dataSource = new MatTableDataSource(this.plan);
        this.dataSource.paginator = this.paginator; // Asigna el paginador a tu dataSource
      });
    });
  }

  openDialogAddServices() {
    this.planService.optionShow.next(4);
    this.planService.optionShow.subscribe((option) => {
      if (option == 4) {
        const dialogRef = this.dialog.open(DialogSelectMembershipComponent, {
          width: "70%",
          height: "90%",
          data: { name: "Agregar servicios" },
        });
      }
    });
  }
}
