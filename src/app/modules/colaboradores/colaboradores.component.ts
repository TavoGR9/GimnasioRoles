import { Component, ViewChild } from '@angular/core';
import { ColaboradorService } from 'src/app/service/colaborador.service';
import { ListarEmpleadosPipe } from 'src/app/pipes/listar-empleados.pipe';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
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
    this.dialog.open(AltaColaboradoresComponent,{
      width: '70%',
      height: '90%',
      disableClose: true,  
    })
      .afterClosed()
      .subscribe((cerrarDialogo:Boolean) => {
        if(cerrarDialogo){
          
        } else {

        }
      });
  }

  OpenEditar(empleado: any) {
    this.dialog.open(EditarColaboradorComponent,{
      data: {
        empleadoID: `${empleado.idEmpleado}`
      },
      width: '70%',
      height: '90%',
      disableClose: true,  
    })
      .afterClosed()
      .subscribe((cerrarDialogo:Boolean) => {
        if(cerrarDialogo){
          
        } else {

        }
      });
  }

}
