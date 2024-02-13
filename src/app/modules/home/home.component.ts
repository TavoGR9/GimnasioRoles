import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { VentasComponent } from '../ventas/ventas.component';
import { MatDialog } from "@angular/material/dialog";
import { EntradasComponent } from '../entradas/entradas.component';
import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  // Almacenar el usuario en sesion
  currentUser: string = '';

  constructor(private auth: AuthService, public dialog: MatDialog, private router: Router) {}

  ngOnInit(): void {
    // Manejar ocultar ruta - eliminiar historial
    /*const stateObj = { id: 'home' };
    const title = 'Home';
    const url = '/home';

    window.history.pushState(stateObj, title, url);

    window.addEventListener('popstate', () => {
      window.history.pushState(stateObj, title, url);
    });*/

    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
      //console.log("Mira aqui perro: " + JSON.stringify(this.currentUser));
    }
    
    this.auth.idGym.subscribe((data) => {
      if(data) {
        console.log("ESTE ES EL ID:", data);
      }
    });
  }

  // Metodo traer datos desde la variable se sesion storage
  getSSdata(data: any){
    //console.log("Mira aqui perro: " + JSON.stringify(data));
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
          this.auth.role.next(resultData.rolUser);
          this.auth.userId.next(resultData.id);
          this.auth.idGym.next(resultData.idGym);
          this.auth.nombreGym.next(resultData.nombreGym);
          this.auth.email.next(resultData.email);
          this.auth.encryptedMail.next(resultData.encryptedMail);
          //console.log("exito... quiero llorar de la emocion");
      }, error: (error) => { console.log(error); }
    });
  }

  
  /* roles de usuario */
  isAdmin(): boolean {
    return this.auth.isAdmin();
  }
  
  isSupadmin(): boolean {
    return this.auth.isSupadmin();
  }

  isRecep(): boolean {
    return this.auth.isRecepcion();
  }

  ventas(): void {
    const dialogRef = this.dialog.open(VentasComponent, {
      width: '80%',
      height: '90%',
      
    });
  }

  entradas(): void {
    const dialogRef = this.dialog.open(EntradasComponent, {
      width: '75%',
      height: '90%',
      disableClose: true,
    });
  }

   
}
