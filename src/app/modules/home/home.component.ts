import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { VentasComponent } from '../ventas/ventas.component';
import { MatDialog } from "@angular/material/dialog";
import { EntradasComponent } from '../entradas/entradas.component';
import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';
import { JoinDetalleVentaService } from "../../service/JoinDetalleVenta";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  // Almacenar el usuario en sesion
  currentUser: string = '';
  detallesCaja: any[] = [];
  fechaFiltro: string = "";
  idGym: number = 0;
  fechaActual: Date = new Date();
  
  constructor(private auth: AuthService, public dialog: MatDialog, private router: Router, private joinDetalleVentaService: JoinDetalleVentaService, ) {

   
  }

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
        this.idGym = data;
        this.listaTablas();
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

  private obtenerFechaActual(): Date {
    return new Date();
  }
  

  totalVentas: number = 0;
totalProductosVendidos: number = 0;

listaTablas() {
  this.joinDetalleVentaService.consultarProductosVentas(this.idGym).subscribe(
    (data) => {
      this.detallesCaja = data;
      console.log(this.detallesCaja, "this.detallesCaja");
      const fechaActual = this.obtenerFechaActual().toISOString().slice(0, 10);
      this.fechaFiltro = fechaActual;

      // Calcular el total de ventas y productos vendidos para la fecha actual
      const { totalVentas, totalProductosVendidos } = this.detallesCaja.reduce((acumulador, detalle) => {
        const cantidadElegida = parseFloat(detalle.cantidadElegida);
        const precioUnitario = parseFloat(detalle.precioUnitario);
        const totalVentaPorProducto = cantidadElegida * precioUnitario;

        // Verificar si la fecha de venta coincide con la fecha actual
        if (detalle.fechaVenta === fechaActual) {
          acumulador.totalVentas += totalVentaPorProducto;
          acumulador.totalProductosVendidos += cantidadElegida;
        }

        return acumulador;
      }, { totalVentas: 0, totalProductosVendidos: 0 });

      this.totalVentas = totalVentas;
      this.totalProductosVendidos = totalProductosVendidos;
    },
    (error) => {
      console.error("Error al obtener detalles de la caja:", error);
    }
  );
}
  
}

