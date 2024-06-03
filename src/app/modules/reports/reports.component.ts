import { Component } from "@angular/core";
import { OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from "../../service/auth.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { format } from "date-fns";
import { ToastrService } from "ngx-toastr";
import { ChartOptions, ChartType, ChartDataset } from "chart.js";

@Component({
  selector: "app-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.css"],
})
export class ReportsComponent implements OnInit {
  form: FormGroup;
  currentUser: string = "";
  opcionSeleccionada: string = "0";
  sucursales: DatosGrafico[] = [];
  sucursaless: Graficoss[] = [];
  sucursalesP: DatosGraficoss[] = [];

  public barChartDataArray: { data: number[]; label: string }[] = [];
  barChartLabels: string[] = []; // array que contiene las etiquetas que se mostrarán en el eje X del.
  public barChartOptions: ChartOptions = {
    responsive: true, //resposivo
    maintainAspectRatio: false, //tamaño fijo
  }; // opciones de configuración, como si debe ser responsivo (responsive).
  public barChartType: ChartType = "bar"; //tipo de grafico
  public barChartLegend = true;
  public barChartData: ChartDataset[] = []; //array de objetos que contiene los datos, necesario 
  public coloresPersonalizados: string[] = ["#fd9727"]; //color
  datosGraficosPorGimnasio: {
    [key: string]: { chartLabels: string[]; chartData: any[] };
  } = {}; //almacena datos para gráficos específicos de cada gimnasio
  doughnutChartLegend = true; 
  doughnutChartType: ChartType = "doughnut";
  isLoading: boolean = true;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private auth: AuthService,
    public dialog: MatDialog,
  ) {
    this.form = this.fb.group({
      p_inicial: ["", Validators.required],
      p_final: ["", Validators.required],
      tipo: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    // this.auth.comprobar();
    
      this.currentUser = this.auth.getCurrentUser();
      if (this.currentUser) {
        this.getSSdata(JSON.stringify(this.currentUser));
      }
    
   
    this.loadData();
  }

  loadData() {
    setTimeout(() => {
      // Una vez que los datos se han cargado, establece isLoading en false
      this.isLoading = false;
    }, 1000); // Este valor representa el tiempo de carga simulado en milisegundos
  }

  getSSdata(data: any) {
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
        this.auth.role.next(resultData.rolUser);
        this.auth.idUser.next(resultData.id);
        this.auth.idGym.next(resultData.idGym);
        this.auth.nombreGym.next(resultData.nombreGym);
        this.auth.email.next(resultData.email);
        this.auth.encryptedMail.next(resultData.encryptedMail);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  ////////////////////////////////////////////GRAFICAS/////////////////////////7777777
  formatearFecha(fechaOriginal: string): string {
    const fechaObj = new Date(fechaOriginal);
    const fechaFormateada = format(fechaObj, "yyyy-MM-dd");
    return fechaFormateada;
  }

  obtenerDatosParaGrafico1() {
    if (this.form.value.p_inicial && this.form.value.p_final) {
      let inicial = this.formatearFecha(this.form.value.p_inicial);
      let final = this.formatearFecha(this.form.value.p_final);
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
        error: (error) => {},
      });
    }
  }

  obtenerDatosParaGrafico2() {
    if (this.form.value.p_inicial && this.form.value.p_final) {
      let inicial = this.formatearFecha(this.form.value.p_inicial);
      let final = this.formatearFecha(this.form.value.p_final);
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
  }

  obtenerDatosParaGrafico5() {
    const inicial = this.formatearFecha(this.form.value.p_inicial);
    const final = this.formatearFecha(this.form.value.p_final);
    this.form.patchValue({ p_inicial: inicial, p_final: final });
    // Obtener datos del servicio
    this.auth.chart_sucursales(this.form.value).subscribe({
      next: (resultData: Graficoss[]) => {
        // Manejar caso sin resultados
        if (
          resultData.length === 0 ||
          resultData[0].nombreGimnasio === "No_result"
        ) {
          this.toastr.error(
            "No hay resultados disponibles...",
            "No hay resultados",
            {
              positionClass: "toast-bottom-left",
            }
          );
          return;
        }
        // Inicializar la estructura de datos para almacenar la información del gráfico
        const datosGraficosPorGimnasio: DatosGraficosPorGimnasio = {};
        
        // Procesar datos
        resultData.forEach((dato) => {
          if (!datosGraficosPorGimnasio[dato.nombreGimnasio]) {
            datosGraficosPorGimnasio[dato.nombreGimnasio] = {
              chartLabels: [],
              chartData: [{ data: [], label: "Ventas" }],
            };
          }
          datosGraficosPorGimnasio[dato.nombreGimnasio].chartLabels.push(
            String(dato.nombreProducto)
          );
          datosGraficosPorGimnasio[dato.nombreGimnasio].chartData[0].data.push(
            dato.totalVentas
          );
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

interface Graficoss {
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
