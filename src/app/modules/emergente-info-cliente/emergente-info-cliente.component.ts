import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { EmergenteCargarFotoComponent } from '../emergente-cargar-foto/emergente-cargar-foto.component';
import { PagoMembresiaEfectivoService } from '../../service/pago-membresia-efectivo.service';
import { MatPaginator } from '@angular/material/paginator'; //para paginacion en la tabla
import { MatTableDataSource } from '@angular/material/table'; //para controlar los datos del api y ponerlos en una tabla
import { EmergenteAperturaPuertoSerialComponent } from '../emergente-apertura-puerto-serial/emergente-apertura-puerto-serial.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MensajeEmergenteComponent } from '../mensaje-emergente/mensaje-emergente.component';
import { NgxSpinnerService } from "ngx-spinner";
import { MensajeEliminarComponent } from "../mensaje-eliminar/mensaje-eliminar.component";
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-emergente-info-cliente',
  templateUrl: './emergente-info-cliente.component.html',
  styleUrls: ['./emergente-info-cliente.component.css']
})

export class EmergenteInfoClienteComponent implements OnInit{
  url: string = `Finger://?id=${this.data.idCliente}`;
  currentDate: Date = new Date();
  duracion: any;
  photo: any;
  huella: any;
  img = 'https://';
  dataSource: any;
  displayedColumns: string[] = [
    'ID',
    'Nombre',
    'Membresía',
    'Precio',
    'Duración',
    'Fecha Inicio',
    'Fecha Fin',
    'Status',
    'Eliminar',
  ];
  membresiaHisto: any;
  item: any;
  @ViewChild('paginatorHistorialMembre', { static: true }) paginator!: MatPaginator;
  form: FormGroup;

  constructor(public dialog: MatDialog, private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private pagoService: PagoMembresiaEfectivoService,
    private toastr: ToastrService,
    public dialogo: MatDialogRef<EmergenteInfoClienteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      this.form = this.fb.group({
        id_cliente: [this.data.idCliente, Validators.required],
        estafeta: [this.data.estafeta, Validators.required],
        nombre: [this.data.nombre, Validators.required],
        telefono: [this.data.telefono, Validators.required],
        correo: [this.data.email, Validators.required]
      }); 
  }  

  cerrarDialogo(): void {
    this.dialogo.close(true);
  }

  ngOnInit() {
    this.duracion = this.data.duracion + ' ' + 'días';
    this.photo = this.img+this.data.foto;
    this.huella = this.data.huella;
    this.pagoService.histoClienteMemb(this.data.idCliente).subscribe((respuesta) => {
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
      disableClose: true 
    })
    .afterClosed()
    .subscribe((cerrarDialogo: Boolean) => {
      if (cerrarDialogo) {

      } else {

      }
    });
  }

  abrirDialogCapturarHuella(data: any): void {
  }

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

  capturarHuella(): void {
    this.spinner.show();

    setTimeout(() => {
      this.spinner.hide();
    }, 550);
  }

  borrarSucursal(id:any){
    this.dialog.open(MensajeEliminarComponent,{
      data: `¿Desea eliminar este servicio?`,
    })
    .afterClosed()
    .subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.pagoService.deleteMem(id).subscribe(
          (respuesta) => {
            this.pagoService.histoClienteMemb(this.data.idCliente).subscribe((respuesta) => {
              this.membresiaHisto = respuesta;
              this.dataSource = new MatTableDataSource(this.membresiaHisto);
              this.dataSource.paginator = this.paginator;
            });
                this.toastr.success('Registro eliminado exitosamente', 'Exitó', {
                  positionClass: 'toast-bottom-left',
                });
          },
          (error) => {
          }
        );
      } else {
      }
    });
  }
}
