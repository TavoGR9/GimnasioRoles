import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { VentasComponent } from '../ventas/ventas.component';
import { MatDialog } from "@angular/material/dialog";
import { EntradasComponent } from '../entradas/entradas.component';
import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';
import { JoinDetalleVentaService } from "../../service/JoinDetalleVenta";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { format } from "date-fns";
import { ToastrService } from "ngx-toastr";
import { ChartOptions, ChartType, ChartDataset } from "chart.js";
import { AnalyticsService } from '../../service/analytics.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{


  public barChartDataArray: { data: number[]; label: string }[] = [];
  barChartLabels: string[] = [];
  public barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };
  public barChartType: ChartType = "bar";
  public barChartLegend = true;
  public barChartData: ChartDataset[] = [];
  public coloresPersonalizados: string[] = ['#FF5733', '#33FF57', '#5733FF'];
  datosGraficosPorGimnasio: { [key: string]: { chartLabels: string[], chartData: any[] } } = {};
  // Almacenar el usuario en sesion
  currentUser: string = '';
  detallesCaja: any[] = [];
  fechaFiltro: string = "";
  idGym: number = 0;
  fechaActual: Date = new Date();
  totalVentas: number = 0;
  totalProductosVendidos: number = 0;
  datosProductosVendidos: any;
  datosRecientesVentas: any;
  datosClientesActivos: any;
  clientesActivos: any;
  
  constructor(private analyticsService: AnalyticsService,private auth: AuthService, public dialog: MatDialog, private router: Router, private joinDetalleVentaService: JoinDetalleVentaService, ) {
  }

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }
    
    this.auth.idGym.subscribe((data) => {
      if(data) {
        this.idGym = data;
        this.listaTablas();
      }
    });
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

  listaTablas() {
  this.joinDetalleVentaService.consultarProductosVentas(this.idGym).subscribe(
    (data) => {
      this.detallesCaja = data;
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


  this.analyticsService.getAnalyticsData(this.idGym).subscribe((data) => {
    this.datosProductosVendidos = data;
  });


  this.analyticsService.getARecientesVentas(this.idGym).subscribe((data) => {
    this.datosRecientesVentas = data;
  });


  this.analyticsService.getClientesActivos(this.idGym).subscribe((data) => {
    this.datosClientesActivos = data;
    const cantidadClientesActivos = this.datosClientesActivos.length;
    this.clientesActivos = cantidadClientesActivos;  
  });
  

}


}
