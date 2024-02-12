import { Component } from '@angular/core';
import { ColaboradorService } from 'src/app/service/colaborador.service';
import { ListarEmpleadosPipe } from 'src/app/pipes/listar-empleados.pipe';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AltaColaboradoresComponent } from '../alta-colaboradores/alta-colaboradores.component';
import { EditarColaboradorComponent } from '../editar-colaborador/editar-colaborador.component';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-colaboradores',
  templateUrl: './colaboradores.component.html',
  styleUrls: ['./colaboradores.component.css']
})
export class ColaboradoresComponent {
  public empleados: any;
  public page: number = 0;
  public search: string = '';
  
  constructor(private http: ColaboradorService, public dialog: MatDialog, private auth: AuthService,){}

  ngOnInit():void{
    console.log("El ID del gimnasio es:", this.auth.idGym.getValue());
    if (this.isSupadmin()){
      this.http.listaColaboradores().subscribe({
        next: (resultData) => {
          console.log(resultData);
          this.empleados = resultData;
        }
      });
    } 
    if (this.isAdmin()){
      this.http.listaRecepcionistas(this.auth.idGym.getValue()).subscribe({
        next: (dataResponse) => {
          console.log(dataResponse);
          this.empleados = dataResponse;
        }
      })
    }
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
    })
      .afterClosed()
      .subscribe((cerrarDialogo:Boolean) => {
        if(cerrarDialogo){
          
        } else {

        }
      });
  }

}
