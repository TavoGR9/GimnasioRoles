import { Component, ViewChild } from '@angular/core';
import { ColaboradorService } from './../../service/colaborador.service';
import { ListarEmpleadosPipe } from 'src/app/pipes/listar-empleados.pipe';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { AltaColaboradoresComponent } from '../alta-colaboradores/alta-colaboradores.component';
import { EditarColaboradorComponent } from '../editar-colaborador/editar-colaborador.component';
import { AuthService } from 'src/app/service/auth.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-colaboradores',
  templateUrl: './colaboradores.component.html',
  styleUrls: ['./colaboradores.component.css']
})
export class ColaboradoresComponent {
  public empleados: any;
  public page: number = 0;
  public search: string = '';
  currentUser: string = '';
  idGym: number = 0;
  dataSource: any;
  colaboradores: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  constructor(private http: ColaboradorService, public dialog: MatDialog, private auth: AuthService,){}

  ngOnInit():void{
    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }
  
    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
      this.listaTabla();
      this.cargarCategorias();
      this.actualizarTabla();
    }); 
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
      this.http.listaRecepcionistas(this.idGym).subscribe({
        next: (dataResponse) => {
          this.empleados = dataResponse;
          this.dataSource = new MatTableDataSource(this.empleados);
        this.dataSource.paginator = this.paginator; // Asigna el paginador a tu dataSource
        }
      })
    }
  }
  
  cargarCategorias() {
    this.http.listaRecepcionistas(this.idGym).subscribe({
      next: (resultData) => {
        this.empleados = resultData;
        this.dataSource = new MatTableDataSource(this.empleados);
        this.dataSource.paginator = this.paginator;
      }
    });
  }
  
  actualizarTabla() {
    if (!this.dataSource) {
      // Asegúrate de que this.dataSource esté definido antes de actualizar
      this.cargarCategorias();
    } else {
      this.http.listaRecepcionistas(this.idGym).subscribe({
        next: (resultData) => {
          this.empleados = resultData;
          this.dataSource.data = this.empleados;
        }
      });
    }
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

  onSearchPokemon( search: string ) {
    this.page = 0;
    this.search = search;
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
          this.actualizarTabla();
        } else {
          // Hacer algo cuando se cancela el diálogo
        }
      });
  }
  

  OpenEditar(empleado: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '70%';
    dialogConfig.height = '90%';
    dialogConfig.disableClose = true; // Evita que el diálogo se cierre haciendo clic fuera de él
    
    dialogConfig.data = {
      empleadoID: `${empleado.idEmpleado}`
    };
  
    this.dialog.open(EditarColaboradorComponent, dialogConfig)
      .afterClosed()
      .subscribe((cerrarDialogo: Boolean) => {
        if (cerrarDialogo) {
          this.actualizarTabla();
        } else {
          // Hacer algo cuando se cancela el diálogo
        }
      });
  }

}
