import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { membresia } from 'src/app/models/membresia';
import { MembresiaService } from 'src/app/service/membresia.service';
import { AuthService } from 'src/app/service/auth.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MembresiasAgregarComponent } from '../membresias-agregar/membresias-agregar.component';
@Component({
  selector: 'app-membresias',
  templateUrl: './membresias.component.html',
  styleUrls: ['./membresias.component.css'] 
})
export class MembresiasComponent implements OnInit {
  constructor(
    private membresiaService:MembresiaService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    public dialog: MatDialog
  ){}

  displayedColumns: string[] = ['title', 'details','price','duration', 'trainer','cancha','alberca','ofertas','gimnasio','status','actions'];

  public membresiaActiva: boolean = false; 
  membresias: membresia[] = [];
  plan: membresia[] = [];
  message: string = "";
  public sucursales: any;
  public page: number = 0;
  public search: string = '';
  dataSource: any; 
  public paginator!: MatPaginator;

  ngOnInit(): void {
    this.membresiaService.consultarPlanId(this.auth.idGym.getValue()).subscribe(respuesta => {
      console.log(respuesta);
      this.plan = respuesta;
      this.dataSource = new MatTableDataSource(this.plan);
      this.dataSource.paginator = this.paginator; // Asigna el paginador a tu dataSource
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  toggleCheckbox(idMem: number, status: number) {
    const estadoOriginal = status;
    console.log('Estatus actual:', estadoOriginal);
   /* const dialogRef = this.dialog.open(MensajeEliminarComponent, {
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
    });*/
  }

  actualizarEstatusMembresia(idMem: number, estado: { status: number }) {
    console.log(estado.status, "nuevo");
    this.membresiaService.updateMembresiaStatus(idMem, estado).subscribe(
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
  
  agregarMembresias(): void {
    const dialogRef = this.dialog.open(MembresiasAgregarComponent, {
      width: '70%',
      height: '90%',
    });
  }
}
