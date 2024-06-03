import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { plan } from '../../models/plan';
import { MensajeEliminarComponent } from '../mensaje-eliminar/mensaje-eliminar.component';
import { AuthService } from '../../service/auth.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DialogSelectMembershipComponent } from '../dialog-select-membership/dialog-select-membership.component';
import { planAgregarComponent } from '../plan-agregar/plan-agregar.component';
import { planEditarComponent } from '../plan-editar/plan-editar.component';
import { MembresiaService } from '../../service/membresia.service';

@Component({
  selector: 'app-membresias',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.css']
})
export class planComponent implements OnInit {

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
  section: number = 0;
  option: number = 0;
  currentUser: string = '';
  isLoading: boolean = true; 
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = ['title', 'details','price','actions'];
  habilitarBoton: boolean = false;

  constructor(
    private membresiaService: MembresiaService,
    private auth: AuthService,
    public dialog: MatDialog
  ){}

  ngOnInit(): void {
    // this.membresiaService.comprobar();
    this.auth.comprobar().subscribe((respuesta)=>{ 
      this.habilitarBoton = respuesta.status;
    });

    this.membresiaService.optionShow.next(4);
    this.membresiaService.optionShow.subscribe((option) => {
      if(option){
        if(option == 4){
          this.option = option;
        }
      }
    });
    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
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
  
  listaTabla() {
    this.membresiaService.consultarPlanIdPlan2(this.idGym).subscribe(respuesta => {
      if (respuesta && respuesta.success === 1) {
        if (respuesta.data && Array.isArray(respuesta.data)) {
          this.plan = respuesta.data; 
          this.dataSource = new MatTableDataSource(this.plan);
          this.loadData();
        } else {
          console.error('La propiedad "data" no es un array o no está presente en la respuesta del servicio.');
          setTimeout(() => {
            this.isLoading = false;
          }, 1000); 
        }
      }  else {
        setTimeout(() => {
          this.isLoading = false;
        }, 1000); 
      }
    });
  }
  
  getSSdata(data: any){
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
          this.auth.role.next(resultData.rolUser);
          this.auth.idUser.next(resultData.id);
          this.auth.idGym.next(resultData.idGym);
          this.auth.nombreGym.next(resultData.nombreGym);
          this.auth.email.next(resultData.email);
          this.auth.encryptedMail.next(resultData.encryptedMail);
      }, error: (error) => { console.log(error); }
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
        console.error('Error al actualizar la membresía:', error);
      }
    );
  }
  
  openDialog(): void {
    this.membresiaService.section.next(1);
    const dialogRef = this.dialog.open(planAgregarComponent, {
      width: '70%',
      height: '90%',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      this.membresiaService.consultarPlanIdPlan2(this.idGym).subscribe(respuesta => {
        if (respuesta.success === 1) {
          // Verificar si la propiedad 'data' está presente y es un array
          if (respuesta.data && Array.isArray(respuesta.data)) {
            this.plan = respuesta.data;  // Asignar el array 'data' a 'plan'
            this.dataSource = new MatTableDataSource(this.plan);
            this.dataSource.paginator = this.paginator; // Asigna el paginador a tu dataSource
          } else {
            console.error('La propiedad "data" no es un array o no está presente en la respuesta del servicio.');
          }
        } else if (respuesta.warning) {
     
        } else {
          console.error('Error en la respuesta del servicio:', respuesta.error);
        }
      });
    });
  }

  openDialogService(idMem: number, tipo_membresia: number){
    this.membresiaService.optionShow.next(5);
    const dialogRef = this.dialog.open(DialogSelectMembershipComponent, {
      width: '50%',
      height: '50%',
      disableClose: true,
      data: {name: 'Servicios de la membresia'}
    });
  }

  openDialogEdit(idMem: number, tipo_membresia: number){
    this.membresiaService.optionShow.subscribe((option) => {
    })

    this.membresiaService.setDataToupdate(idMem, tipo_membresia);
    const dialogRef = this.dialog.open(planEditarComponent, {
      width: '70%',
      height: '90%',
      disableClose: true,
      data: { idMem: idMem },
    })

    dialogRef.afterClosed().subscribe(result => {
      this.membresiaService.consultarPlanIdPlan2(this.idGym).subscribe(respuesta => {
        if (respuesta.success === 1) {
          // Verificar si la propiedad 'data' está presente y es un array
          if (respuesta.data && Array.isArray(respuesta.data)) {
            this.plan = respuesta.data;  // Asignar el array 'data' a 'plan'
            this.dataSource = new MatTableDataSource(this.plan);
            this.dataSource.paginator = this.paginator; // Asigna el paginador a tu dataSource
          } else {
            console.error('La propiedad "data" no es un array o no está presente en la respuesta del servicio.');
          }
        } else if (respuesta.warning) {
          
        } else {
          console.error('Error en la respuesta del servicio:', respuesta.error);
        }
      });
    });
  }

  openDialogAddServices(){
    this.membresiaService.optionShow.next(4);
    this.membresiaService.optionShow.subscribe((option) => {
      if(option == 4){
        const dialogRef = this.dialog.open(DialogSelectMembershipComponent, {
          width: '70%',
          height: '90%',
          disableClose: true,
          data: {name: 'Agregar servicios'}
        });
      }
    });
  }
}
