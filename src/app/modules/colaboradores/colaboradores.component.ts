import { Component, ViewChild } from '@angular/core';
import { ColaboradorService } from './../../service/colaborador.service';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { AltaColaboradoresComponent } from '../alta-colaboradores/alta-colaboradores.component';
import { EditarColaboradorComponent } from '../editar-colaborador/editar-colaborador.component';
import { AuthService } from '../../service/auth.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { MensajeDesactivarComponent } from "../mensaje-desactivar/mensaje-desactivar.component";
@Component({
  selector: 'app-colaboradores',
  templateUrl: './colaboradores.component.html',
  styleUrls: ['./colaboradores.component.css']
})
export class ColaboradoresComponent {
  public empleados: any;
  public page: number = 0;
  public search: string = '';
  colaborador: any;
  currentUser: string = '';
  idGym: number = 0;
  dataSource: any;
  colaboradores: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  isLoading: boolean = true; 
  
  constructor(private http: ColaboradorService, public dialog: MatDialog, private auth: AuthService, private router:Router){}

  ngOnInit():void{
    this.http.comprobar();
    this.auth.comprobar();

    setTimeout(() => {
      this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }
      this.auth.idGym.subscribe((data) => {
        this.idGym = data;
        this.listaTabla();
        //this.cargarCategorias();
        //this.actualizarTabla();
      }); 
    }, 3000); 
    this.loadData();
  }

  loadData() {
    setTimeout(() => {
      // Una vez que los datos se han cargado, establece isLoading en false
      this.isLoading = false;
    }, 3000); // Este valor representa el tiempo de carga simulado en milisegundos
  }

  listaTabla(){
    if (this.isSupadmin()){
      this.http.listaColaboradores().subscribe({
        next: (resultData) => {
          this.empleados = resultData;
        }
      });
    } 
    if (this.isAdmin()){
      this.http.MostrarRecepcionistas(this.idGym).subscribe({
        next: (dataResponse) => {
          this.empleados = dataResponse;
          //console.log(this.empleados);
          this.dataSource = new MatTableDataSource(this.empleados);
        this.dataSource.paginator = this.paginator; // Asigna el paginador a tu dataSource
        }
      })
    }
  }
  
  // cargarCategorias() {
  //   this.http.listaRecepcionistas(this.idGym).subscribe({
  //     next: (resultData) => {
  //       this.empleados = resultData;
  //       //this.dataSource = new MatTableDataSource(this.empleados);
  //       //this.dataSource.paginator = this.paginator;
  //     }
  //   });
  // }
  
  // actualizarTabla() {
  //   if (!this.dataSource) {
  //     // Asegúrate de que this.dataSource esté definido antes de actualizar
  //     this.cargarCategorias();
  //   } else {
  //     this.http.listaRecepcionistas(this.idGym).subscribe({
  //       next: (resultData) => {
  //         this.empleados = resultData;
  //      //   this.dataSource.data = this.empleados;
  //       }
  //     });
  //   }
  // }

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

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }
  
  isSupadmin(): boolean {
    return this.auth.isSupadmin();
  }

  nextPage() {
    this.page += 5;
  }

  prevPage() {
    if ( this.page > 0 )
      this.page -= 5;
  }

  onSearchPokemon( search: Event ) {
    const filterValue = (search.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  OpenAgregar() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '70%';
    dialogConfig.height = '90%';
    dialogConfig.disableClose = true;
    this.dialog.open(AltaColaboradoresComponent, dialogConfig)
      .afterClosed()
      .subscribe((cerrarDialogo: Boolean) => {
        if (cerrarDialogo) {
          // Hacer algo cuando se cierra el diálogo
          //this.actualizarTabla();
          this.listaTabla();
        } else {
          // Hacer algo cuando se cancela el diálogo
        }
      });
  }
  

  OpenEditar(empleados: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '70%';
    dialogConfig.height = '90%';
    dialogConfig.disableClose = true; // Evita que el diálogo se cierre haciendo clic fuera de él
    
    dialogConfig.data = {
      empleadoID: `${empleados.id_empleado}`
    };

    //console.log(empleados.id_empleado);
  
    this.dialog.open(EditarColaboradorComponent, dialogConfig)
      .afterClosed()
      .subscribe((cerrarDialogo: Boolean) => {
        if (cerrarDialogo) {
          this.listaTabla();
        } else {
          // Hacer algo cuando se cancela el diálogo
        }
      });
  }


  onToggle(event: Event, idEmpleado: any, correo:any) {
  console.log(idEmpleado, "idGimnasio");
    let colab = this.empleados.find(
      (e: { id_empleado: any }) => e.id_empleado == idEmpleado
    );
    let mensaje =
    colab.estatus == 1
        ? "¿Deseas desactivar esta sucursal?"
        : "¿Deseas activar esta sucursal?";
    const dialogRef = this.dialog.open(MensajeDesactivarComponent, {
      data: { mensaje: mensaje, idEmpleado: colab },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Invertir el valor del estatus
        const nuevoEstatus = colab.estatus == 1 ? 0 : 1;
        // Actualizar la base de datos y refrescar los datos
        this.http
          .actualizarEstatus(idEmpleado, nuevoEstatus, correo)
          .subscribe(
            (response) => {
              if (response && response.success === 1) {
                colab.estatus = nuevoEstatus;
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

}
