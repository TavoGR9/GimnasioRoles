import { Component, OnInit } from '@angular/core';
import { GimnasioService } from '../../service/gimnasio.service';
import { HorarioService } from '../../service/horario.service';
import { AuthService } from '../../service/auth.service';
import { HorariosComponent } from '../horarios/horarios.component';
import { MatDialog } from '@angular/material/dialog';
import { gimnasio } from '../../models/gimnasio';
import { authGuard } from '../../guards/auth.guard';

@Component({
  selector: 'app-ver-configuracion',
  templateUrl: './ver-configuracion.component.html',
  styleUrls: ['./ver-configuracion.component.css']
})
export class VerConfiguracionComponent implements OnInit{
  id:any;
  item: any;
  gimnasio: any;
  idGimnasio: any;
  idUs: number = 0;
  idGym: number = 0;
  message: string = "";
  currentUser: string = '';
  datosHorario: any[] = [];

  constructor(
    private gimnasioService: GimnasioService,
    private HorarioService: HorarioService,
    private auth: AuthService,
    public dialog: MatDialog,
  ){}

  ngOnInit(): void {

    //this.gimnasioService.comprobar();
    // this.auth.comprobar();
    // this.HorarioService.comprobar();
      this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }



      this.auth.idGym.subscribe((data) => {
        this.idGym = data;
        //console.log("dato 1: ",this.idGym)
        //this.consultarHorario();
        this.consultarGym();
      });

      this.auth.idUser.subscribe((data) => {
        this.idUs = data;
        this.consultarGym();
      });

      this.consultarGym();



  }

  consultarGym(){

    const dato = {
      idG: this.idGym,
      id: this.idUs
    }

    console.log("Datos: ",dato)

    this.gimnasioService.consultarPlan(dato).subscribe(respuesta => {
      console.log("RESPUESTA DEL API: ",respuesta);
      this.gimnasio = respuesta;
    });
  }

  /*
  consultarHorario() {
    this.HorarioService.consultarHorario(this.idGym).subscribe(
      (data) => {

        this.datosHorario = data;
      },
      (error) => {
        this.message = "Horario no disponible";
      }
    );
  }
    */

  getSSdata(data: any){
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
          this.auth.role.next(resultData.rolUser);
          this.auth.idUser.next(resultData.id);
          this.auth.idGym.next(resultData.idGym);
          this.auth.nombreGym.next(resultData.direccion);
          this.auth.email.next(resultData.email);
          this.auth.encryptedMail.next(resultData.encryptedMail);
      }, error: (error) => { console.log(error); }
    });
  }

  /*
  agregarHorario(idGimnasio: number): void {
    const dialogRef = this.dialog.open(HorariosComponent, {
      width: '60%',
      height: '90%',
      data: { idGimnasio: idGimnasio },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.gimnasioService.consultarPlan(this.idGym).subscribe(respuesta => {

        this.gimnasio = respuesta;
      });
      this.HorarioService.consultarHorario(this.idGym).subscribe(
        (data) => {
          this.datosHorario = data;
        },
        (error) => {
          this.message = "Horario no disponible";
        }
      );
    });
  }
    */
}
