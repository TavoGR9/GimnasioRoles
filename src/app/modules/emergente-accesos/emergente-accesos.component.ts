import { Component, OnInit, OnDestroy, Inject, ViewChild} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import { HuellaService } from '../../service/huella.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-emergente-accesos',
  templateUrl: './emergente-accesos.component.html',
  styleUrls: ['./emergente-accesos.component.css']
})
export class EmergenteAccesosComponent implements OnInit{

  IdFormControl = new FormControl('', [Validators.required]);
  matcher = new MyErrorStateMatcher();
  clienteIdControl = new FormControl();
  cliente: any;
  img:string =  'https://';

  constructor(
    public dialogo: MatDialogRef<EmergenteAccesosComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string,
    private serviceHuella: HuellaService) { }

  ngOnInit(): void {
    this.serviceHuella.ultimoAcceso()
        .subscribe(
          (data: any) => {
            this.cliente = data.cliente; // Asigna directamente los datos del cliente
            console.log("info: ", this.cliente);
            // Ajusta el tamaño del diálogo después de que se han cargado los datos del cliente
            this.dialogo.updateSize('600px', 'auto');
          },
          error => {
            console.error('Error al buscar cliente:', error);
          }
        );
  }
  
  cerrarDialogo(): void {
    this.dialogo.close(true);
  }

  buscarCliente(): void {
    const clienteId = this.IdFormControl.value as string; // Utiliza IdFormControl para obtener el valor del campo de entrada
    if (clienteId) {
      this.serviceHuella.accesoID(clienteId)
        .subscribe(
          (data: any) => {
            this.cliente = data.cliente; // Asigna directamente los datos del cliente
            console.log("info: ", this.cliente);
            // Ajusta el tamaño del diálogo después de que se han cargado los datos del cliente
            this.dialogo.updateSize('600px', 'auto');
          },
          error => {
            console.error('Error al buscar cliente:', error);
          }
        );
    }
  }

  //para mandar la solicitud para abrir torniquete
  accesoManual(): void {

  }
  

}
