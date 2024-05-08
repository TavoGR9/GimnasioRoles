import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { ColaboradorService } from '../../service/colaborador.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { AuthService } from '../../service/auth.service';
import { NgxSpinnerService } from "ngx-spinner";

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, formulario: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = formulario && formulario.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-editar-colaborador',
  templateUrl: './editar-colaborador.component.html',
  styleUrls: ['./editar-colaborador.component.css']
})

export class EditarColaboradorComponent implements OnInit{
  public form: FormGroup;
  public sucursales: any;
  public idParam: any;
  resultadoData:  any = {};
  idGym!: number;
  matcher = new MyErrorStateMatcher();
  constructor (private fb: FormBuilder,
    public dialogo: MatDialogRef<EditarColaboradorComponent>,
    public dialog: MatDialog,
    private http: ColaboradorService,
    private auth: AuthService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA)  public data: any ){

    this.http.InfoIdEmpleado(this.data.empleadoID).subscribe({
      next: (resultData) => {
        this.resultadoData = resultData;
         this.form.setValue({
           nombreCompleto: this.resultadoData[0].nombreCompleto,
           telefono: this.resultadoData[0].telefono,
           CorreoEmpleado: this.resultadoData[0].CorreoEmpleado,
           id_bodega: this.resultadoData[0].id_bodega,
         });
      }
    });

    this.form = this.fb.group({
      nombreCompleto: ['', Validators.compose([ Validators.required, Validators.pattern(/^[^\d]*$/)])],
      telefono: ['', Validators.compose([Validators.required, Validators.pattern(/^(0|[1-9][0-9]*)$/), Validators.minLength(10)])],
      id_bodega: ['', Validators.compose([ Validators.required])],
      CorreoEmpleado: ['', Validators.compose([Validators.required, Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)])]
    });
  }

  ngOnInit():void{
    if (this.isAdmin()){
      this.http.comboDatosGym(this.auth.idGym.getValue()).subscribe({
        next: (resultData) => {
          this.sucursales = resultData;
        }
      });
    }
    if(this.isSupadmin()){
      this.http.comboDatosAllGym().subscribe({
        next: (dataResponse) => {
          this.sucursales = dataResponse;
        }
      });
    }
  }

  cerrarDialogo(): void {
    this.dialogo.close(true);
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }
  
  isSupadmin(): boolean {
    return this.auth.isSupadmin();
  }

  actualizar(){
    if (this.form.valid) {
      this.spinner.show();
      this.auth.idGym.subscribe((data) => {
        this.idGym = data;
      });
      this.http.ActualizarColaborador(this.idGym, this.form.value.nombreCompleto, this.form.value.CorreoEmpleado, this.form.value.telefono, this.data.empleadoID).subscribe({
        next: (resultDataUpdate) => {
          if(resultDataUpdate == '2'){
            this.toastr.error('El correo ya existe.', 'Error!!!');
          }
          if(resultDataUpdate == '1'){
            this.cerrarDialogo();
            this.spinner.hide();
            this.dialog.open(MensajeEmergentesComponent,{
              data: 'Registro actualizado correctamente.'
              //width: '500px',
              //height: '500px',
            })
              .afterClosed()
              .subscribe((cerrarDialogo:Boolean) => {
                if(cerrarDialogo){ 
                } else {
                }
              });
            this.form.reset(); 
            this.cerrarDialogo() 
          }
        },
        error: (error) => {
          console.error(error);
        }
      });
    } else {
      this.toastr.error('Completar todos los campos antes de guardar.', 'Error!!!');
    }
  }
}
