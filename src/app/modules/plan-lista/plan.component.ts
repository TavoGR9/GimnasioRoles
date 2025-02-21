import { Component, OnInit, ViewChild, AfterViewInit  } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { plan } from '../../models/plan';
import { MensajeEliminarComponent } from '../mensaje-eliminar/mensaje-eliminar.component';
import { AuthService } from '../../service/auth.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { planAgregarComponent } from '../plan-agregar/plan-agregar.component';
import { planEditarComponent } from '../plan-editar/plan-editar.component';
import { PromocionService } from '../../service/promocion.service';
import { distinctUntilChanged } from 'rxjs/operators';//Cuando el id del gym cambia
import { filter, switchMap, tap, catchError, finalize  } from 'rxjs/operators'; //permite transformar el flujo de datos
import { of } from 'rxjs';//crea un observable
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-membresias',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.css']
})
export class planComponent implements OnInit, AfterViewInit  {

  membresiaActiva: boolean = true; // Inicializa según el estado de la membresía
  plan: plan[] = [];
  message: string = "";
  dataSource: any;
  idGym: number = 0;
  currentUser: string = '';
  isLoading: boolean = true;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = ['title', 'details','price','actions'];
  habilitarBoton: boolean = false;

  constructor(
    private promocionService: PromocionService,
    private auth: AuthService,
    public dialog: MatDialog,
    private toastr: ToastrService
  ){}

  ngOnInit(): void {

    //this.listaTabla();,

    this.auth.comprobar().subscribe((respuesta)=>{
      this.habilitarBoton = respuesta.status;
    });

    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }

    //Cuando el id del Gym cambia tambien la tabla
    this.auth.idGym.pipe(
      distinctUntilChanged()  // Esto evitará la llamada si el valor no ha cambiado
    ).subscribe((data) => {
      this.idGym = data;
      // console.log("ID PROMOCION: ",this.idGym);
      this.listaTabla(); // Llama a la tabla solo cuando idGym cambia
    });

  }
//LLAMAR LOS DATOS PARA QUE SE MUESTREN CUANDO SE CARGA EL COMPONENTE
  ngAfterViewInit(): void {
    this.listaTabla();
  }

  //RECARGAR LA TABLA
  loadData() {
    setTimeout(() => {
      this.isLoading = false;
      this.dataSource.paginator = this.paginator;
    }, 1000);
  }


  ///FILTRO PARA LOS PLANES PARA QUE NO SE MUESTREN DOBLES POR LAS MEMBRESIAS
  private filtrarDatosUnicos(data: { nombrePromocion: string; [key: string]: any }[]): any[] {
    const nombresUnicos = new Set();
    const datosUnicos: { nombrePromocion: string; [key: string]: any }[] = []; // Declaramos el tipo de datosUnicos

    data.forEach(item => {
      if (!nombresUnicos.has(item.nombrePromocion)) {
        nombresUnicos.add(item.nombrePromocion); // Agregamos el nombre al Set para evitar duplicados
        datosUnicos.push(item); // Solo agregamos el primer registro encontrado
      }
    });

    return datosUnicos;
  }




  //METODO PARA LOS PLANES Y EL AGREGAR PLANES
  private actualizaLista(respuesta: any, usePaginator: boolean = false): void {
    if (respuesta.success === 1) {
      if (respuesta.data && Array.isArray(respuesta.data)) {
        //console.log("DATOS ANTES DE DEL FILTRO: ",respuesta.data);
        const datosUnicos = this.filtrarDatosUnicos(respuesta.data);
        this.plan = datosUnicos;

        this.dataSource = new MatTableDataSource(this.plan);
        if (usePaginator) {
          this.dataSource.paginator = this.paginator; // Asigna el paginador solo si es necesario
        }
        this.loadData();

      } else {
        //console.error('La propiedad "data" no es un array o no está presente en la respuesta del servicio.');
      }
    } else {
      console.error('Error en respuesta success:', respuesta.success);
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    }
  }

  //optiene la lista
  listaTabla() {
    this.promocionService.listaPlanes(this.idGym).pipe(
      tap(respuesta => this.actualizaLista(respuesta, false)),


      catchError(error => {
        //console.error('Error en la llamada HTTP:', error);
        return of(null);//evita que el observable falle
      })
    ).subscribe();
}

//DATOS
  getSSdata(data: any){
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
          this.auth.role.next(resultData.rolUser);
          this.auth.idUser.next(resultData.clave);
          this.auth.idGym.next(resultData.idGym);
          //console.log("ES EL ID EN LISTA: " +this.idGym);
          this.auth.nombreGym.next(resultData.direccion);
          this.auth.email.next(resultData.email);
          this.auth.encryptedMail.next(resultData.encryptedMail);
      }, error: (error) => { console.log(error); }
    });
  }

  //FILTRO DE LOS PRODUCTOS
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }



  // ACTUALIZACIÓN DE ESTATUS
  toggleCheckbox(idPro: any, status: any) {
    const nuevoEstado = { status: Number(status) === 1 ? 0 : 1 }; // Forzar a número

    const dialogRef = this.dialog.open(MensajeEliminarComponent, {
      data: `¿Desea cambiar el estatus de la categoría?`,
    });

    dialogRef.afterClosed()
      .pipe(
        switchMap((confirmado: boolean) => {
          if (confirmado) {
            console.log("id: ", idPro, "estatus: ", nuevoEstado);
            return this.promocionService.updateStatus(idPro, nuevoEstado);
          } else {
            return of(null); // No hacer nada si no se confirma
          }
        })
      )
      .subscribe({
        next: (respuesta) => {
          if (respuesta) {
            this.membresiaActiva = nuevoEstado.status === 1; // Actualiza la variable local
            //Actializa la tabla para reflejar cambios
            this.promocionService.listaPlanes(this.idGym).subscribe(respuesta => {
              this.actualizaLista(respuesta, true);
            });
            console.log('Estatus actualizado exitosamente');

          }
        },
        error: (error) => {
          console.error('Error al actualizar la membresía:', error);
        },
      });
  }

  //AGREGAR PLANES
  openDialog(): void {
    this.promocionService.section.next(1);
    const dialogRef = this.dialog.open(planAgregarComponent, {
      width: '70%',
      disableClose: true,
    });

    dialogRef.afterClosed().pipe(
    filter(result => result === true),

    switchMap(() => this.promocionService.listaPlanes(this.idGym)), // Llamar a la API
    tap(respuesta => this.actualizaLista(respuesta, true)), // Manejar la respuesta
    catchError(error => {
      console.error("Error al cargar la lista de planes:", error);
      this.toastr.error("Ocurrió un error al agregar los planes.", "Error");
      return of(null); // Devuelve un observable vacío para continuar
    }),
    finalize(() => console.log("Se agrego el plan correctamente."))
  ).subscribe();
  }

  //EDICION DE LOS PLANES
  openDialogEdit(id_promocion: number){
    this.promocionService.setDataToupdate(id_promocion);
    const dialogRef = this.dialog.open(planEditarComponent, {
      width: '70%',
      //height: '90%',
      disableClose: true,
      data: { id_promocion: id_promocion },
    })

    dialogRef.afterClosed().pipe(
      filter(result => result === true),

      switchMap(() => this.promocionService.listaPlanes(this.idGym)), //Llamamos a la API
      tap(respuesta => this.actualizaLista(respuesta, true)), //Manejamos la respuesta y llamamos a el porcedimiento de cargar la lista

      catchError(error => {
        //console.error("Error al cargar la lista de planes:", error);
        this.toastr.error("Ocurrió un error al actualizar los planes.", "Error");
        return of(null); // Devuelve un observable vacío para continuar
      }),
      //finalize(() => console.log("Se actualizo el plan correctamente"))

    ).subscribe();

  }


  //ELIMINACION DE PLANES
  borrarPlan(id: number){
    this.dialog.open(MensajeEliminarComponent,{
      data: `¿Desea eliminar este plan?`,
    }).afterClosed().pipe(
      filter((confirmado: boolean) => confirmado === true),
      switchMap(() => this.promocionService.deletePlan(id)), //lalamos a la API para eliminacion
      switchMap(() => this.promocionService.listaPlanes(this.idGym)),//Recargar la pagina

      tap((respuesta) => {
        if (respuesta.success === 1) {
          this.actualizaLista(respuesta, true);
          this.toastr.success("El plan se a eliminado corretamente.", "Éxito");
        } else {
          this.actualizaLista(respuesta, false);
          this.toastr.warning("No se encontraron planes para actualizar.", "Advertencia");
        }
      }),
      catchError((error) => {
        //console.error("Error al eliminar el plan: ", error);
        this.toastr.error("Ocurrió un error al eliminar el plan.", "Error");
        return of(null);//Evita que el observable falle
      }),
     // finalize(() => console.log("Proceso de eliminación finalizado."))
    ).subscribe();

  }
}
