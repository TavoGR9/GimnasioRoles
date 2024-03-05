import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { EmergenteCargarFotoComponent } from '../emergente-cargar-foto/emergente-cargar-foto.component';
import { PagoMembresiaEfectivoService } from '../../service/pago-membresia-efectivo.service';
import { MatPaginator } from '@angular/material/paginator'; //para paginacion en la tabla
import { MatTableDataSource } from '@angular/material/table'; //para controlar los datos del api y ponerlos en una tabla
import { EmergenteCapturarHuellasComponent } from '../emergente-capturar-huellas/emergente-capturar-huellas.component';
import { EmergenteAperturaPuertoSerialComponent } from '../emergente-apertura-puerto-serial/emergente-apertura-puerto-serial.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MensajeEmergenteComponent } from '../mensaje-emergente/mensaje-emergente.component';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-emergente-info-cliente',
  templateUrl: './emergente-info-cliente.component.html',
  styleUrls: ['./emergente-info-cliente.component.css']
})

export class EmergenteInfoClienteComponent implements OnInit{
  currentDate: Date = new Date();
  duracion: any;
  photo: any;
  img = 'https://';
  dataSource: any;
  //titulos de columnas de la tabla Reenovacion de membresias
  displayedColumns: string[] = [
    'ID',
    'Nombre',
    'Membresía',
    'Precio',
    'Duración',
    'Fecha Inicio',
    'Fecha Fin',
    'Status',
  ];
  membresiaHisto: any;
  item: any;
  //paginator es una variable de la clase MatPaginator
  @ViewChild('paginatorHistorialMembre', { static: true }) paginator!: MatPaginator;
  // Manejar el contenido del formulario
  form: FormGroup;


  constructor(public dialog: MatDialog, private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private pagoService: PagoMembresiaEfectivoService,
    public dialogo: MatDialogRef<EmergenteInfoClienteComponent>,
    @Inject(MAT_DIALOG_DATA)  public data: any) { 
      // Agregar campos el formulario 
      this.form = this.fb.group({
        id_cliente: [this.data.idCliente, Validators.required],
        nombre: [this.data.nombre_cl, Validators.required],
        apPaterno: [this.data.paterno, Validators.required],
        apMaterno: [this.data.materno, Validators.required],
        telefono: [this.data.telefono, Validators.required],
        email: [this.data.email, Validators.required],
        peso: [this.data.peso, Validators.required],
        estatura: [this.data.estatura, Validators.required]
      });

      
    }   //public mensaje: string,

  cerrarDialogo(): void {
    this.dialogo.close(true);
  }
  /*confirmado(): void {
    this.dialogo.close(true);
  }*/

  ngOnInit() {
    this.duracion = this.data.duracion + ' ' + 'días';
    this.photo = this.img+this.data.foto;
    this.pagoService.histoClienteMemb(this.data.idCliente).subscribe((respuesta) => {
      //console.log('historial:',respuesta);
      this.membresiaHisto = respuesta;
      this.dataSource = new MatTableDataSource(this.membresiaHisto);
      this.dataSource.paginator = this.paginator;
    });
  }

  estaEnRango(fechaInicio: string, fechaFin: string): boolean {
    const fechaInicioDate = this.parseFecha(fechaInicio);
    const fechaFinDate = this.parseFecha(fechaFin);
    return this.currentDate >= fechaInicioDate && this.currentDate <= fechaFinDate;
  }

  private parseFecha(fecha: string): Date {
    const partes = fecha.split('/');
    const fechaLocal = new Date(+partes[2], +partes[1] - 1, +partes[0]);
    return new Date(fechaLocal.getTime() + fechaLocal.getTimezoneOffset() * 60000);
  }


  abrirDialogFoto(data: any): void {
    this.dialogo.close(true);
    this.dialog.open(EmergenteCargarFotoComponent, {
      data: {
        clienteID: `${data.idCliente}`
      },
    })
    .afterClosed()
    .subscribe((cerrarDialogo: Boolean) => {
      if (cerrarDialogo) {

      } else {

      }
    });
  }

  // Apertura mat-dialog captura de huella
  abrirDialogCapturarHuella(data: any): void {
    this.dialogo.close(true);
    this.dialog.open(EmergenteCapturarHuellasComponent, {
      data: {
        clienteID: `${data.idCliente}`
      },
    })
    .afterClosed()
    .subscribe((cerrarDialogo: Boolean) => {
      if (cerrarDialogo) {

      } else {

      }
    });
  }

  // Apertura mat-dialog apertura de puerto serial com
  abrirPuertoSerial(data: any): void {
    this.dialogo.close(true);
    this.dialog.open(EmergenteAperturaPuertoSerialComponent, {
      data: {
        clienteID: `${data.idCliente}`
      },
    })
    .afterClosed()
    .subscribe((cerrarDialogo: Boolean) => {
      if (cerrarDialogo) {

      } else {

      }
    });
  }
  
  // Actualizar datos de cliente
  actualizar(): void {
    if(!this.form.valid){
      return;
    }

    this.spinner.show();
    this.pagoService.actualizaDatosCliente(this.form.value).subscribe({
      next: (resultData) => {
        this.spinner.hide();
        this.cerrarDialogo();
        this.dialog.open(MensajeEmergenteComponent, {
          data: `Datos actualizados satisfacoriamente`,
        })
        .afterClosed()
        .subscribe((cerrarDialogo: Boolean) => {
          if (cerrarDialogo) {

          } else {
    
          }
        });
      }, error: (error) => { console.log(error); }
    });
  }
}
