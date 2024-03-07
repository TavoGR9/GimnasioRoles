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
//import { DialogSelectMembershipComponent } from '../dialog-select-membership/dialog-select-membership.component';
import { ServiceDialogComponent } from "../service-dialog/service-dialog.component";
import { DialogStateService } from "../../service/dialogState.service";

@Component({
  selector: "app-servicios-lista",
  templateUrl: "./servicios-lista.component.html",
  styleUrls: ["./servicios-lista.component.css"],
})
export class ServiciosListaComponent {
  plan: plan[] = [];
  services: any[] = [];
  membresias: plan[] = [];
  sucursales: any;
  dataSource: any;
  page: number = 0;
  idGym: number = 0;
  seleccionado: number = 0;
  search: string = "";
  message: string = "";
  currentUser: string = "";
  confirmButton: boolean = false;
  membresiaActiva: boolean = true; 
  displayedColumns: string[] = ["title", "details", "price", "actions"];
  dialogRef: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public dialog: MatDialog,
    private auth: AuthService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private planService: PlanService,
    private gimnasioService: GimnasioService,
    private dialogStateService: DialogStateService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    if (this.currentUser) {
      this.getSSdata(JSON.stringify(this.currentUser));
    }

    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
      this.listaTabla();
    });

    this.dialogStateService.currentMaximizeState.subscribe((isMaximized) => {
      if (this.dialogRef) {
        if (isMaximized) {
          this.dialogRef.updateSize('100vw', '100vh');
        } else {
          this.dialogRef.updateSize('auto', 'auto');
        }
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

  listaTabla() {
    this.gimnasioService.getServicesForId(this.idGym).subscribe((res) => {
      this.services = res;
      this.dataSource = new MatTableDataSource(this.services);
      this.dataSource.paginator = this.paginator;
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
        // Invierte el estado actual de la categoría
        const nuevoEstado = status == 1 ? { status: 0 } : { status: 1 };

        // Actualiza el estado solo si el usuario confirma en el diálogo
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
      }
    );
  }

  openDialog(): void {
    this.seleccionado = 1;
    this.planService.seleccionado.next(this.seleccionado);
    this.dialogRef = this.dialog.open(ServiceDialogComponent, {
      width: "55%",
      height: "60%",
      data: { name: "¿para quien es esta membresia?" },
      disableClose: true,
    });
    
   this.dialogRef.afterClosed().subscribe((result: any) => {
      this.gimnasioService.getServicesForId(this.idGym).subscribe((res) => {
        this.services = res;
        this.dataSource = new MatTableDataSource(this.services);
        this.dataSource.paginator = this.paginator;
      });
      this.planService.confirmButton.next(false);
      this.planService.confirmButton.subscribe((res) => {
        if (!res) {
        }
      });
    });
  }

  editarServicio(idServicio: number) {
    this.seleccionado = 2;
    this.planService.idService.next(idServicio);
    this.planService.seleccionado.next(this.seleccionado);
    const dialogRef = this.dialog.open(ServiceDialogComponent, {
      width: "55%",
      height: "60%",
      disableClose: true,
    });

    this.planService.idService.next(idServicio);
    this.planService.getService(idServicio).subscribe((res) => {
      if (res) {
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.planService.confirmButton.subscribe((res) => {
        if (res) {
          this.gimnasioService.getServicesForId(this.idGym).subscribe((res) => {
            this.services = res;
            this.dataSource = new MatTableDataSource(this.services);
            this.dataSource.paginator = this.paginator;
          });
        }
      });
      this.planService.confirmButton.next(false);
      this.planService.confirmButton.subscribe((res) => {
        if (!res) {
      
        }
      });
    });
  }
}
