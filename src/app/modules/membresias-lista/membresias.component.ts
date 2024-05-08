import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { plan } from "../../models/plan";
import { MensajeEliminarComponent } from "../mensaje-eliminar/mensaje-eliminar.component";
import { AuthService } from "../../service/auth.service";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { DialogSelectMembershipComponent } from "../dialog-select-membership/dialog-select-membership.component";
import { MembresiaService } from "../../service/membresia.service";
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
  isLoading: boolean = true; 
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private membresiaService: MembresiaService,
    private auth: AuthService,
    public dialog: MatDialog
  ) {}

  displayedColumns: string[] = [
    "title",
    "details",
    "price",
    "duration",
    "actions",
  ];
  habilitarBoton: boolean = false;

  ngOnInit(): void {
    // this.membresiaService.comprobar();
    // this.gimnasioService.comprobar();
    this.auth.comprobar().subscribe((respuesta)=>{ 
      this.habilitarBoton = respuesta.status;
    });
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

  loadData() {
    setTimeout(() => {
      this.isLoading = false;
      this.dataSource.paginator = this.paginator;
    }, 1000);
  }

  listaTabla() {
    this.membresiaService.consultarPlanIdMem(this.idGym).subscribe(
      (respuesta) => {
        if(respuesta[2].success == 2){
          const combinedArray = respuesta[0].concat(respuesta[1]);
          this.dataSource = new MatTableDataSource(combinedArray);
          this.loadData(); 
        } else {
          this.plan = respuesta;
          this.dataSource = new MatTableDataSource(this.plan);
          this.loadData(); 
         }
       /* if (respuesta) {
          this.plan = respuesta;
          this.dataSource = new MatTableDataSource(this.plan);
          this.loadData();
        } else {}*/
      },
      (error) => {
      }
    );
  }
  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  toggleCheckbox(idMem: number, status: number) {
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
    this.membresiaService.updateMembresiaStatus(idMem, estado).subscribe(
      (respuesta) => {
        this.membresiaActiva = estado.status == 1;
      },
      (error) => {
        console.error("Error al actualizar la membresía:", error);
      }
    );
  }

  openDialog(): void {
    this.membresiaService.optionShow.next(1);
    this.membresiaService.optionShow.subscribe((option) => {});
    const dialogRef = this.dialog.open(DialogSelectMembershipComponent, {
      width: "70%",
      height: "90%",
      disableClose: true,
      data: { name: "¿Para quién es esta membresía?" },
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      this.membresiaService.consultarPlanIdMem(this.idGym).subscribe(
        (respuesta) => {
          if (respuesta) {
            this.plan = respuesta;
            this.dataSource = new MatTableDataSource(this.plan);
            this.dataSource.paginator = this.paginator;
          } else {
          }
        },
        (error) => {
          console.error('Error al obtener los datos del servicio:', error);
        }
      );
    });
  }
  
  openDialogService(idMem: number, tipo_membresia: number) {
    this.membresiaService.optionShow.next(2);
    this.membresiaService.optionShow.subscribe((option) => {});
    this.membresiaService.setDataToupdate(idMem, tipo_membresia);
    const dialogRef = this.dialog.open(DialogSelectMembershipComponent, {
      width: "50%",
      height: "50%",
      disableClose: true,
      data: { name: "Servicios de la membresia" },
    });
  }

  openDialogEdit(idMem: number, tipo_membresia: number) {
    this.membresiaService.optionShow.next(3);
    this.membresiaService.optionShow.subscribe((option) => {});
    this.membresiaService.setDataToupdate(idMem, tipo_membresia);
    const dialogRef = this.dialog.open(DialogSelectMembershipComponent, {
      width: "70%",
      height: "90%",
      disableClose: true,
      data: { name: "Editar membresia", id: idMem },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.membresiaService.consultarPlanIdMem(this.idGym).subscribe((respuesta) => {
        this.plan = respuesta;
        this.dataSource = new MatTableDataSource(this.plan);
        this.dataSource.paginator = this.paginator; // Asigna el paginador a tu dataSource
      });
    });
  }

  openDialogAddServices() {
    this.membresiaService.optionShow.next(4);
    this.membresiaService.optionShow.subscribe((option) => {
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
