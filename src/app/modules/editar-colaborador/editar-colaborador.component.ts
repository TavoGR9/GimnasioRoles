import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ColaboradorService } from '../../service/colaborador.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { AuthService } from '../../service/auth.service';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-editar-colaborador',
  templateUrl: './editar-colaborador.component.html',
  styleUrls: ['./editar-colaborador.component.css']
})
export class EditarColaboradorComponent implements OnInit {
  public form: FormGroup;
  public sucursales: any;
  public idParam: any;
  resultadoData: any = {};
  idGym!: number;

  constructor(
    private fb: FormBuilder,
    public dialogo: MatDialogRef<EditarColaboradorComponent>,
    public dialog: MatDialog,
    private http: ColaboradorService,
    private auth: AuthService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      nombreCompleto: ['', Validators.compose([Validators.required, Validators.pattern(/^[^\d]*$/)])],
      telefono: ['', Validators.compose([Validators.required, Validators.pattern(/^(0|[1-9][0-9]*)$/), Validators.minLength(10)])],
      id_bodega: ['', Validators.compose([Validators.required])],
      CorreoEmpleado: ['', Validators.compose([Validators.required, Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)])]
    });

    this.http.InfoIdEmpleado(this.data.empleadoID).subscribe({
      next: (resultData) => {
        if (Array.isArray(resultData) && resultData.length > 0) {
          this.resultadoData = resultData;
          this.form.setValue({
            nombreCompleto: this.resultadoData[0].nombreCompleto,
            telefono: this.resultadoData[0].telefono,
            CorreoEmpleado: this.resultadoData[0].CorreoEmpleado,
            id_bodega: this.resultadoData[0].id_bodega,
          });
        } else {
          this.toastr.error('No se encontró información del empleado.', 'Error!!!');
        }
      },
      error: (err) => {
        console.error('Error en la solicitud InfoIdEmpleado:', err);
        this.toastr.error('Error al cargar la información del empleado.', 'Error!!!');
      }
    });
  }

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.http.comboDatosGym(this.auth.idGym.getValue()).subscribe({
        next: (resultData) => {
          this.sucursales = resultData;
        }
      });
    }
    if (this.isSupadmin()) {
      this.http.comboDatosAllGym().subscribe({
        next: (dataResponse) => {
          this.sucursales = dataResponse;
        }
      });
    }
  }

  cerrarDialogo(): void {
    this.dialogo.close(true); // Cierra el modal
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  isSupadmin(): boolean {
    return this.auth.isSupadmin();
  }

  actualizar() {
    if (this.form.valid) {
      this.spinner.show();

      // Obtener el ID del gimnasio
      this.auth.idGym.subscribe((data) => {
        this.idGym = data;
      });

      // Llamar al servicio para actualizar el colaborador
      this.http.ActualizarColaborador(
        this.idGym,
        this.form.value.nombreCompleto,
        this.form.value.CorreoEmpleado,
        this.form.value.telefono,
        this.data.empleadoID
      ).subscribe({
        next: (resultDataUpdate: any) => {
          this.spinner.hide();

          if (resultDataUpdate.status === 'false') {
            this.toastr.error('El correo ya existe.', 'Error!!!');
          } else 
          if (resultDataUpdate.status === 'success') {
            this.dialog
              .open(MensajeEmergentesComponent, {
                data: 'Colaborador actualizado correctamente.',
              })
              .afterClosed()
              .subscribe(() => {
                this.cerrarDialogo();
                
              });
          }          
        },
        error: (error) => {
          console.error('Error en la actualización:', error);
          this.spinner.hide();
          this.toastr.error('Error en la actualización.', 'Error!!!');
        },
      });
    } else {
      this.toastr.error('Completar todos los campos antes de guardar.', 'Error!!!');
    }
  }
}
