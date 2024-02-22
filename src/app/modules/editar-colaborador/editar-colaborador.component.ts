import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ColaboradorService } from '../../service/colaborador.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { AuthService } from '../../service/auth.service';
import { NgxSpinnerService } from "ngx-spinner";

/** Error when invalid control is dirty, touched, or submitted. */
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

  constructor (private fb: FormBuilder,
    public dialogo: MatDialogRef<EditarColaboradorComponent>,
    public dialog: MatDialog,
    private activeR: ActivatedRoute, 
    private router: Router,
    private http: ColaboradorService,
    private auth: AuthService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA)  public data: any ){
    //Capturar - rescatar el parametro pasado por la url
    //this.idParam=this.activeR.snapshot.paramMap.get('id');

    //llamar al servicio datos empleado - pasando el parametro capturado por url
    this.http.consultarIdEmpleado(this.data.empleadoID).subscribe({
      next: (resultData) => {
        //asignar valor a los campos correspondientes al fomulario
        this.form.setValue({
          nombre:resultData [0]['nombre'],
          apPaterno:resultData [0]['apPaterno'],
          apMaterno:resultData [0]['apMaterno'],
          telefono:resultData [0]['telefono'],
          //rfc:resultData [0]['rfc'],
          Gimnasio_idGimnasio:resultData [0]['Gimnasio_idGimnasio'],
          turnoLaboral:resultData [0]['turnoLaboral'],
          salario:resultData [0]['salario'],
          email:resultData [0]['email']
        });
      }
    });

    //asignar validaciones a los campos de fomulario
    this.form = this.fb.group({
      nombre: ['', Validators.compose([ Validators.required, Validators.pattern(/^[^\d]*$/)])],
      apPaterno: ['', Validators.compose([ Validators.required, Validators.pattern(/^[^\d]*$/)])],
      apMaterno: ['', Validators.compose([ Validators.required, Validators.pattern(/^[^\d]*$/)])],
      telefono: ['', Validators.compose([Validators.required, Validators.pattern(/^(0|[1-9][0-9]*)$/), Validators.minLength(10)])],
      //rfc: ['', Validators.compose([ Validators.required, Validators.pattern(/^[A-ZÑ0-9]*[A-Z][A-ZÑ0-9]*$/), Validators.minLength(12),Validators.maxLength(13)])],
      Gimnasio_idGimnasio: ['', Validators.compose([ Validators.required])],
      turnoLaboral: [''],
      salario: ['', Validators.compose([Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      email: ['', Validators.compose([Validators.required, Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)])]
    });
  }

  //insanciar objeto para manejar el tipo de error en las validaciones
  matcher = new MyErrorStateMatcher();

  //mandar a llamar el sevicio correspondiente al llenado del combo sucursal
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

  //funcion correspondiente a actualizar empleado
  actualizar(){
    if (this.form.valid) {
      this.spinner.show();
      this.http.actualizaEmpleado(this.data.empleadoID, this.form.value).subscribe({
        next: (resultDataUpdate) => {
          if(resultDataUpdate.msg == 'RfcExists'){
            this.toastr.error('El rfc ya existe.', 'Error!!!');
          }
          if(resultDataUpdate.msg == 'MailExists'){
            this.toastr.error('El correo ya existe.', 'Error!!!');
          }
          if(resultDataUpdate.msg == 'Success'){
            //this.toastr.success('Registro actualizado correctamente.', 'Exíto!!!');

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
