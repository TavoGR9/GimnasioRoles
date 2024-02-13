import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { plan } from 'src/app/models/plan';
import { PlanService } from 'src/app/service/plan.service';
import { MensajeEliminarComponent } from '../mensaje-eliminar/mensaje-eliminar.component';
import { GimnasioService } from 'src/app/service/gimnasio.service';
import { AuthService } from 'src/app/service/auth.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
//import { DialogSelectMembershipComponent } from '../dialog-select-membership/dialog-select-membership.component';
import { ServiceDialogComponent } from '../service-dialog/service-dialog.component';

@Component({
  selector: 'app-servicios-lista',
  templateUrl: './servicios-lista.component.html',
  styleUrls: ['./servicios-lista.component.css']
})
export class ServiciosListaComponent {
  membresiaActiva: boolean = true; // Inicializa según el estado de la membresía
  membresias: plan[] = [];
  plan: plan[] = [];
  message: string = "";
  public sucursales: any;
  public page: number = 0;
  public search: string = '';
  dataSource: any;
  services: any[] = [];
  idGym: number = 0;
  seleccionado: number = 0;
  confirmButton: boolean = false;
  currentUser: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private planService:PlanService,
    private gimnasioService:GimnasioService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    
    public dialog: MatDialog
  ){}

  displayedColumns: string[] = ['title', 'details','price','actions'];

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }

    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
      this.listaTabla();
    }); 
  }

  getSSdata(data: any){
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
          this.auth.role.next(resultData.rolUser);
          this.auth.userId.next(resultData.id);
          this.auth.idGym.next(resultData.idGym);
          this.auth.nombreGym.next(resultData.nombreGym);
          this.auth.email.next(resultData.email);
          this.auth.encryptedMail.next(resultData.encryptedMail);
      }, error: (error) => { console.log(error); }
    });
  }

  listaTabla(){
    this.gimnasioService.getServicesForId(this.idGym).subscribe((res) => {
      this.services = res;
      console.log("SERVICIOS", this.services);
      this.dataSource = new MatTableDataSource(this.services);
      this.dataSource.paginator = this.paginator;
    });

  }
  

  borrarPlan(idMem: any) {
    console.log(idMem);
    this.dialog.open(MensajeEliminarComponent, {
      data: `¿Desea eliminar esta membresía?`,
    })
    .afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.planService.borrarPlan(idMem).subscribe((respuesta) => {
            console.log("si entro") 
            //window.location.reload();    
            this.ngOnInit();
          },
          (error) => {
            console.log("Error al eliminar:", error);
            this.message = "¡Error al eliminar! Hay clientes inscritos en esta membresía";
            setTimeout(() => {
              this.message = ''; // Ocultar el mensaje de error después de 20 segundos
            }, 7000); // 20000 milisegundos = 20 segundos
          });
        } else {
          
        }
      });
   }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  /*toggleCheckbox(idMem: number, status: number) {
    const dialogRef = this.dialog.open(MensajeEliminarComponent, {
      data: `¿Desea cambiar el estatus de la membresía?`, 
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        console.log("membresiaActiva",status);
        // Invierte el estado actual de la membresía
        const nuevoEstado = status ? { status: 0 } : { status: 1 };
  
        this.actualizarEstatusMembresia(idMem, nuevoEstado);
      }
    });
  }*/

  toggleCheckbox(idMem: number, status: number) {
    // Guarda el estado actual en una variable temporal
    const estadoOriginal = status;
    console.log('Estatus actual:', estadoOriginal);
  
    const dialogRef = this.dialog.open(MensajeEliminarComponent, {
      data: `¿Desea cambiar el estatus de la categoría?`, 
    });
  
    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        // Invierte el estado actual de la categoría
        const nuevoEstado = status == 1 ? { status: 0 } : { status: 1 };
        console.log('Nuevo estado:', nuevoEstado);
  
        // Actualiza el estado solo si el usuario confirma en el diálogo
        this.actualizarEstatusMembresia(idMem, nuevoEstado);
        
      } else {
        // Si el usuario cancela, vuelve al estado original
        console.log('Acción cancelada, volviendo al estado original:', estadoOriginal);
        // Puedes decidir si deseas revertir visualmente la interfaz aquí
      }
    });
  }

  actualizarEstatusMembresia(idMem: number, estado: { status: number }) {
    console.log(estado.status, "nuevo");
    this.planService.updateMembresiaStatus(idMem, estado).subscribe(
      (respuesta) => {
        console.log('Membresía actualizada con éxito:', respuesta);
        this.membresiaActiva = estado.status == 1;
      },
      (error) => {
        console.error('Error al actualizar la membresía:', error);
        // Maneja el error de alguna manera si es necesario.
      }
    );
  }
  
  /*actualizarEstatusMembresia(idMem: number, estado: { status: number }) {
    console.log(estado.status, "nuevo");
    this.planService.updateMembresiaStatus(idMem, estado).subscribe(
      (respuesta) => {
        console.log('Membresía actualizada con éxito:', respuesta);
  
        // Invierte el estado en la interfaz después de una actualización exitosa
        this.membresiaActiva = estado.status === 1;
  
        // Realiza cualquier lógica adicional después de la actualización.
      },
      (error) => {
        console.error('Error al actualizar la membresía:', error);
        // Maneja el error de alguna manera si es necesario.
      }
    );
  }*/

  openDialog(): void {
    this.seleccionado = 1;
    this.planService.seleccionado.next(this.seleccionado);
    //this.planService.optionShow.next(1);
    /*this.planService.optionShow.subscribe((option) => {
      console.log("mostraremos:", option);
    });*/
    const dialogRef = this.dialog.open(ServiceDialogComponent, {
      width: '55%',
      height: '60%',
      data: {name: '¿para quien es esta membresia?'},
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.planService.confirmButton.subscribe((res) => {
        if(res){
          console.log("CONFIRM BUTTON", res);
          this.gimnasioService.getServicesForId(this.idGym).subscribe((res) => {
            this.services = res;
            this.dataSource = new MatTableDataSource(this.services);
            this.dataSource.paginator = this.paginator;
          });
        }
      });
      this.planService.confirmButton.next(false);
        this.planService.confirmButton.subscribe((res) => {
          if(!res){
            console.log("VUELVE A NORMAL",  res);
          }
        });
    });


  }

  /*openDialogService(idMem: number, tipo_membresia: number){
    this.planService.optionShow.next(2);
    this.planService.optionShow.subscribe((option) => {
      console.log("mostraremos:", option);
    });
    this.planService.setDataToupdate(idMem, tipo_membresia);
    const dialogRef = this.dialog.open(ServiceDialogComponent, {
      minWidth: '500px',
      minHeight: '400px',
      data: {name: 'Servicios de la membresia'}
    });
  }*/

  /*openDialogEdit(idMem: number, tipo_membresia: number){
    this.planService.optionShow.next(3);
    this.planService.optionShow.subscribe((option) => {
      console.log("mostraremos:", option);
    })

    //estos campos deben ser mostrados publicos
    console.log("el id es: ", idMem);
    console.log("el tipo es: ", tipo_membresia);
    this.planService.setDataToupdate(idMem, tipo_membresia);
    const dialogRef = this.dialog.open(ServiceDialogComponent, {
      minWidth: '500px',
      minHeight: '400px',
      data: {name: 'Editar membresia', id: idMem}
    })
  }*/

  /*openDialogAddServices(){
    this.planService.optionShow.next(4);
    this.planService.optionShow.subscribe((option) => {
      if(option == 4){
        const dialogRef = this.dialog.open(ServiceDialogComponent, {
          minWidth: '500px',
          minHeight: '400px',
          data: {name: 'Agregar servicios'}
        });
      }
    });
  }*/

  editarServicio(idServicio: number){
    this.seleccionado = 2;
    this.planService.idService.next(idServicio);
    this.planService.seleccionado.next(this.seleccionado);
    
    const dialogRef = this.dialog.open(ServiceDialogComponent, {
      width: '55%',
      height: '60%',
      disableClose: true,
    });

    this.planService.idService.next(idServicio);
    this.planService.getService(idServicio).subscribe((res) => {
      if(res){
        console.log("SERVICIO A EDITAR", res);
      }
  });

  dialogRef.afterClosed().subscribe((result) => {
    this.planService.confirmButton.subscribe((res) => {
      if(res){
        console.log("CONFIRM BUTTON", res);
        this.gimnasioService.getServicesForId(this.idGym).subscribe((res) => {
          this.services = res;
          this.dataSource = new MatTableDataSource(this.services);
          this.dataSource.paginator = this.paginator;
        });
      }
    });
    this.planService.confirmButton.next(false);
      this.planService.confirmButton.subscribe((res) => {
        if(!res){
          console.log("VUELVE A NORMAL",  res);
        }
      });
  });
}
}
