import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Chart from 'chart.js/auto';
import { format } from 'date-fns';
import { AuthService } from 'src/app/service/auth.service';
import { SerialService } from 'src/app/service/serial.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit, AfterViewInit{
  form: FormGroup;
  listaSucursales: any;
  existe_grtafica!: Chart;
  esSupAdmin: boolean = false;
  contenedorChart: boolean = false;


  ngAfterViewInit(): void {
      
  }
  /*ngAfterViewInit(): void {
    this.service.chart_sucursales(this.form.value).subscribe({
      next: (resultData) => {
        console.log(resultData);
        //Validar que se obtenga algun resultado valido de la BD
        if(resultData.nombre == 'No_result'){
          this.toastr.error('No hay resultados disponibles...', 'No hay resultados', {
            positionClass: 'toast-bottom-left',
          });
          return;
        }
        // Extraer los nombres de gimnasios y las ventas
        const sucursalesResult = resultData.map((item: any) => item.nombre);
        const ventasResult = resultData.map((item: any) => item.ventas);
  
        this.showChart(sucursalesResult, ventasResult);
      }, error: (error) => { console.log(error); }
    });
  }*/

  constructor(private fb: FormBuilder, private service: AuthService, 
    private serialService: SerialService, private toastr: ToastrService) {
    this.form = this.fb.group({
      sucursal: [""],
      p_inicial: ["", Validators.required],
      p_final: ["", Validators.required],
      tipo: ["", Validators.required]
    });

  }

  ngOnInit(): void {
    if ("serial" in navigator) {
      // The Web Serial API is supported.
      console.log("Es compatible...")
    }

    //Traer lista de sucursales 
    this.service.list_sucursales().subscribe({
      next: (resultData) => {
        this.listaSucursales = resultData;
      }, error: (error) => { console.log(error); }
    });

    // Validar el tipo de rol p/ mostrar contenido
    this.esSupAdmin = this.service.isSupadmin();

  }

  //Dar formato a fecha
  formatearFecha(fechaOriginal: string): string {
    // Convertir la fecha a un objeto Date
    const fechaObj = new Date(fechaOriginal);

    // Formatear la fecha en el formato YYYY/MM/DD
    const fechaFormateada = format(fechaObj, 'yyyy-MM-dd');
    return fechaFormateada;
  }

  //Consultar reporte
  consult(): void {
    // Llamar funcion para dar formato a fecha
    let inicial = this.formatearFecha(this.form.value.p_inicial);
    let final = this.formatearFecha(this.form.value.p_final);

    // Asignar la respuesta a las propiedades de rango de fecha
    this.form.value.p_inicial = inicial;
    this.form.value.p_final = final;

    // Validar que tipo de rol y asignar un valor al campo sucursal
    if(!this.esSupAdmin){
      this.form.value.sucursal = this.service.idGym.getValue();
    }

    console.log(this.form.value);
    this.service.chart_sucursales(this.form.value).subscribe({
      next: (resultData) => {
        console.log(resultData);
        //Validar que se obtenga algun resultado valido de la BD
        if(resultData.nombre == 'No_result'){
          this.toastr.error('No hay resultados disponibles...', 'No hay resultados', {
            positionClass: 'toast-bottom-left',
          });
          return;
        }
        // Extraer los nombres de gimnasios y las ventas
        const sucursalesResult = resultData.map((item: any) => item.nombre);
        const ventasResult = resultData.map((item: any) => item.ventas);

        this.setContenedorChartAndShow(sucursalesResult, ventasResult);
      }, error: (error) => { console.log(error); }
    });
  }

  //Graficar datos
  showChart(sucursales: any, ventas: any): void {
    this.contenedorChart = true;
    if (this.existe_grtafica) {
      this.existe_grtafica.destroy();
    }

    this.existe_grtafica = new Chart("myChart", {
      type: 'bar',
      data: {
        labels: sucursales,
        datasets: [{
          label: 'Periodo: ' + this.form.value.p_inicial + ' - ' + this.form.value.p_final,
          data: ventas,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 205, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(201, 203, 207, 0.2)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
            'rgb(201, 203, 207)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }


  setContenedorChartAndShow(sucursalesResult: any[], ventasResult: any[]) {
    this.contenedorChart = true;
    // Usamos setTimeout para asegurarnos de que el cambio de detección de Angular se ha ejecutado
    // y el elemento canvas se ha renderizado antes de intentar crear el gráfico.
    setTimeout(() => {
      this.showChart(sucursalesResult, ventasResult);
    }, 0);
  }
}