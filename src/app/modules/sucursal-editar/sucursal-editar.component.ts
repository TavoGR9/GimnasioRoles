import { Component, OnInit, Inject} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormGroupDirective, NgForm, FormArray , FormControl} from "@angular/forms";
import { MatDialog } from '@angular/material/dialog';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { ErrorStateMatcher} from '@angular/material/core';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, formulario: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = formulario && formulario.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-sucursal-editar',
  templateUrl: './sucursal-editar.component.html',
  styleUrls: ['./sucursal-editar.component.css']
})
export class SucursalEditarComponent implements OnInit {

  formularioSucursales: FormGroup;
  gimnasio: any;
  franquicia: any;
  message: string = '';
  idGimnasio: any;

  constructor(
    //public dialogo: MatDialogRef<SucursalEditarComponent>,
    //@Inject(MAT_DIALOG_DATA) public data: any,
    private formulario: FormBuilder,
    private activeRoute: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) {
  
    //this.idGimnasio = data.idGimnasio;
   
    this.formularioSucursales = this.formulario.group({
     nombreGym: ["", Validators.required],
     codigoPostal: ["", Validators.required],
      estado: ["", Validators.required],
      ciudad: ["", Validators.required],
      colonia: ["", Validators.required],
      calle: ["", Validators.required],
      numExt: ["", Validators.required],
      numInt: [""],
      telefono:  ['', Validators.compose([Validators.required, Validators.pattern(/^(0|[1-9][0-9]*)$/)])],
      tipo: ["", Validators.required],
      Franquicia_idFranquicia: ["", Validators.required],
      casilleros: ["", Validators.required],
      estacionamiento: ["", Validators.required],
      regaderas: ["", Validators.required],
      bicicletero: ["", Validators.required],
      
    });
  }

  matcher = new MyErrorStateMatcher();

  ngOnInit(): void {
  }

  actualizar() {
  }

  cerrarDialogo(): void {
    //this.dialogo.close(true);
  }
}




