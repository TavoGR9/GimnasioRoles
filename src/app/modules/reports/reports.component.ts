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


@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit{

  //graficas
  form: FormGroup;
  opcionSeleccionada: string = "0";
  sucursales: DatosGrafico[] = [];
  sucursaless: Graficoss[] = [];
  sucursalesP: DatosGraficoss[] = [];
  public barChartDataArray: { data: number[]; label: string }[] = [];
  barChartLabels: string[] = [];
  public barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };
  public barChartType: ChartType = "bar";
  public barChartLegend = true;
  public barChartData: ChartDataset[] = [];
  public coloresPersonalizados: string[] = ['#fd9727'];
  datosGraficosPorGimnasio: { [key: string]: { chartLabels: string[], chartData: any[] } } = {};



  // Agrega estas propiedades al componente
doughnutChartOptions: ChartOptions = {
  // Configuración del gráfico de dona
};

doughnutChartLegend = true; // o false según tus necesidades
doughnutChartType: ChartType = 'doughnut';

constructor(private fb: FormBuilder,private toastr: ToastrService,private auth: AuthService, public dialog: MatDialog, private router: Router, private joinDetalleVentaService: JoinDetalleVentaService, ) {
  this.form = this.fb.group({
    p_inicial: ["", Validators.required],
    p_final: ["", Validators.required],
    tipo: ["", Validators.required],
  });
}

  ngOnInit(): void {
    this.obtenerDatosParaGrafico1();
    this.obtenerDatosParaGrafico2();
  }
 
////////////////////////////////////////////GRAFICAS/////////////////////////7777777
formatearFecha(fechaOriginal: string): string {
  const fechaObj = new Date(fechaOriginal);
  // Formatear la fecha en el formato YYYY/MM/DD
  const fechaFormateada = format(fechaObj, "yyyy-MM-dd");
  return fechaFormateada;
}

obtenerDatosParaGrafico1() {
  let inicial = this.formatearFecha(this.form.value.p_inicial);
  let final = this.formatearFecha(this.form.value.p_final);

  // Asignar la respuesta a las propiedades de rango de fecha
  this.form.value.p_inicial = inicial;
  this.form.value.p_final = final;

  this.auth.chart_sucursales(this.form.value).subscribe({
    next: (resultData: DatosGrafico[]) => {
      if (resultData.length === 0 || resultData[0].nombre === "No_result") {
        this.toastr.error(
          "No hay resultados disponibles...",
          "No hay resultados",
          {
            positionClass: "toast-bottom-left",
          }
        );
        return;
      }

      this.sucursales = resultData;

      this.barChartDataArray = [];
      for (const sucursal of resultData) {
        const chartData = {
          data: [sucursal.ventas],
          label: sucursal.nombre,
          backgroundColor: this.coloresPersonalizados[0], // Accede al miembro de la clase
          borderColor: this.coloresPersonalizados[0],
        };
        this.barChartDataArray.push(chartData);
      }
    },
    error: (error) => {
    },
  });
}

obtenerDatosParaGrafico2() {
  let inicial = this.formatearFecha(this.form.value.p_inicial);
  let final = this.formatearFecha(this.form.value.p_final);

  // Asignar la respuesta a las propiedades de rango de fecha
  this.form.value.p_inicial = inicial;
  this.form.value.p_final = final;
  // Simulando datos, puedes reemplazar esto con tu lógica de obtención de datos
  this.auth.chart_sucursales(this.form.value).subscribe({
    next: (resultData: DatosGraficoss[]) => {
      if (resultData.length === 0 || resultData[0].nombre === "No_result") {
        this.toastr.error(
          "No hay resultados disponibles...",
          "No hay resultados",
          {
            positionClass: "toast-bottom-left",
          }
        );
        return;
      }

      this.sucursalesP = resultData;

      // Limpiar datos anteriores
      this.barChartDataArray = [];

      // Procesar los datos para cada sucursal
      resultData.forEach((sucursal, i) => {
        const chartData = {
          data: [
            sucursal.visita,
            sucursal.quincena,
            sucursal.mensualidad,
            sucursal.anualidad,
          ],
          label: sucursal.nombre,
          backgroundColor: this.coloresPersonalizados[0], // Accede al miembro de la clase
          borderColor: this.coloresPersonalizados[0],
        };
        this.barChartDataArray.push(chartData);
      });
    },
    error: (error) => {
      console.log(error);
    },
  });
}

obtenerDatosParaGrafico5() {
  // Obtener fechas formateadas
  const inicial = this.formatearFecha(this.form.value.p_inicial);
  const final = this.formatearFecha(this.form.value.p_final);

  // Asignar fechas formateadas al formulario
  this.form.patchValue({ p_inicial: inicial, p_final: final });


  // Obtener datos del servicio
  this.auth.chart_sucursales(this.form.value).subscribe({
    next: (resultData: Graficoss[]) => {
      // Manejar caso sin resultados
      if (resultData.length === 0 || resultData[0].nombreGimnasio === "No_result") {
        this.toastr.error("No hay resultados disponibles...", "No hay resultados", {
          positionClass: "toast-bottom-left",
        });
        return;
      }

      // Inicializar la estructura de datos para almacenar la información del gráfico
      const datosGraficosPorGimnasio: DatosGraficosPorGimnasio = {};

      // Procesar datos
      resultData.forEach((dato) => {
        if (!datosGraficosPorGimnasio[dato.nombreGimnasio]) {
          datosGraficosPorGimnasio[dato.nombreGimnasio] = {
            chartLabels: [],
            chartData: [{ data: [], label: 'Ventas' }],
            
          };
          
          
        }
        

        datosGraficosPorGimnasio[dato.nombreGimnasio].chartLabels.push(String(dato.nombreProducto));
        datosGraficosPorGimnasio[dato.nombreGimnasio].chartData[0].data.push(dato.totalVentas);
        
      });

      // Asignar la estructura de datos a una propiedad del componente
      this.datosGraficosPorGimnasio = datosGraficosPorGimnasio;
    },
    error: (error) => {
      this.toastr.error("Error al obtener datos.", "Error", {
        positionClass: "toast-bottom-left",
      });
    },
  });
}

}
  

interface DatosGrafico {
  nombre: string;
  ventas: number;
}

interface DatosGraficoss {
  nombre: string;
  visita: number;
  quincena: number;
  mensualidad: number;
  anualidad: number;
}

interface Graficoss{
  nombreGimnasio: string;
  nombreProducto: number;
  totalVentas: number;
  
}

interface DatosGraficosPorGimnasio {
  [nombreGimnasio: string]: {
    chartLabels: string[];
    chartData: { data: number[]; label: string }[];
  };
}