import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { plan } from "../../models/plan";
import { serviciosService } from "../../service/servicios.service";
import { MensajeEliminarComponent } from "../mensaje-eliminar/mensaje-eliminar.component";
import { GimnasioService } from "../../service/gimnasio.service";
import { AuthService } from "../../service/auth.service";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { ServiceDialogComponent } from "../service-dialog/service-dialog.component";
import { MembresiaService } from "../../service/membresia.service";
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: "app-servicios-lista",
  templateUrl: "./servicios-lista.component.html",
  styleUrls: ["./servicios-lista.component.css"],
})
export class ServiciosListaComponent implements OnInit{
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
  displayedColumns: string[] = ["title", "details", "price", "actions", "eliminar"];
  dialogRef: any;
  isLoading: boolean = true; 
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  habilitarBoton: boolean = false;

  constructor(
    public dialog: MatDialog,
    private auth: AuthService,
    private ServiciosService: serviciosService,
    private gimnasioService: GimnasioService,
    private membresiaService: MembresiaService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
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
  
  loadData() {
    setTimeout(() => {
      this.isLoading = false; 
      this.dataSource.paginator = this.paginator; 
    }, 1000); 
  }
  
  getSSdata(data: any) {
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
        this.auth.role.next(resultData.rolUser);
        this.auth.idUser.next(resultData.id);
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
        
      /*if (res[2] && res[2].success === 2) { 
        const combinedArray = res[0].concat(res[1]);
        if (Array.isArray(combinedArray)) { // Verificar si combinedArray es un array
          this.dataSource = new MatTableDataSource(combinedArray);
          this.loadData(); 
        } else {
          setTimeout(() => {
            this.isLoading = false;
          }, 1000); 
        }
      } else {*/
        this.services = res;
        if (Array.isArray(this.services)) { // Verificar si this.services es un array
          this.dataSource = new MatTableDataSource(this.services);
          this.loadData(); 
        } else {
          setTimeout(() => {
            this.isLoading = false;
          }, 1000); 
        }
      
    });
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
        // Invierte el estado actual de la categoría
        const nuevoEstado = status == 1 ? { status: 0 } : { status: 1 };
        // Actualiza el estado solo si el usuario confirma en el diálogo
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
      }
    );
  }

  openDialog(): void {
    this.seleccionado = 1;
    this.ServiciosService.seleccionado.next(this.seleccionado);
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
      this.ServiciosService.confirmButton.next(false);
      this.ServiciosService.confirmButton.subscribe((res) => {
        if (!res) {
        }
      });
    });
  }

  editarServicio(idServicio: number) {
    this.seleccionado = 2;
    this.ServiciosService.idService.next(idServicio);
    this.ServiciosService.seleccionado.next(this.seleccionado);
    const dialogRef = this.dialog.open(ServiceDialogComponent, {
      width: "55%",
      height: "60%",
      disableClose: true,
    });

    this.ServiciosService.idService.next(idServicio);
    this.ServiciosService.getService(idServicio).subscribe((res) => {
      if (res) {
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.ServiciosService.confirmButton.subscribe((res) => {
        if (res) {
          this.gimnasioService.getServicesForId(this.idGym).subscribe((res) => {
            this.services = res;
            this.dataSource = new MatTableDataSource(this.services);
            this.dataSource.paginator = this.paginator;
          });
        }
      });
      this.ServiciosService.confirmButton.next(false);
      this.ServiciosService.confirmButton.subscribe((res) => {
        if (!res) {
      
        }
      });
    });
  }



  borrarSucursal(idGimnasio: any) {
    this.dialog.open(MensajeEliminarComponent,{
      data: `¿Desea eliminar este servicio?`,
    })
    .afterClosed()
    .subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.ServiciosService.deleteService(idGimnasio).subscribe(
          (respuesta) => {
                this.gimnasioService.getServicesForId(this.idGym).subscribe((res) => {
                  this.services = res;
                  this.dataSource = new MatTableDataSource(this.services);
                  this.dataSource.paginator = this.paginator;
                });
                this.toastr.success('Registro eliminado exitosamente', 'Exitó', {
                  positionClass: 'toast-bottom-left',
                });
          },
          (error) => {
          }
        );
      } else {
      }
    });
  }
}
