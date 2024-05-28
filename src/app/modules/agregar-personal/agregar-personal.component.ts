import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ColaboradorService } from '../../service/colaborador.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-agregar-personal',
  templateUrl: './agregar-personal.component.html',
  styleUrls: ['./agregar-personal.component.css']
})
export class AgregarPersonalComponent {
  form: FormGroup;

  constructor (private fb: FormBuilder, private http: ColaboradorService,
    public dialog: MatDialog,
    public dialogo: MatDialogRef<AgregarPersonalComponent>,
  ){
  this.form= this.fb.group({
    nombre: ['', Validators.compose([ Validators.required, Validators.pattern(/^[^\d]*$/)])],
  })  }


  registrar(){   
  }

  cerrarDialogo(): void {
    this.dialogo.close(true);
  }
 

}
