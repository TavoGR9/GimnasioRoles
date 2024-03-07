import { Component, OnInit, ElementRef, Inject, ViewChild} from '@angular/core';
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
import { interval, Subscription } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';

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

  IdFormControl = new FormControl('');
  matcher = new MyErrorStateMatcher();
  clienteIdControl = new FormControl();
  cliente: any;
  img:string =  'https://';
  private subscription: Subscription = new Subscription(); // Inicializar la propiedad subscription
  idGuardado: any; // Variable para almacenar el ID recibido la primera vez
  //realizandoBusqueda: boolean = false;
  // En tu componente Angular, puedes usar ViewChild para obtener una referencia al elemento del input
  @ViewChild('inputField') inputField!: ElementRef;

  constructor(
    public dialogo: MatDialogRef<EmergenteAccesosComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string,
    private serviceHuella: HuellaService) { }

  /*ngOnInit(): void {
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
    }*/

    /*ngOnInit(): void {
      // Obtener el ID la primera vez y guardarlo en la variable idGuardado
      this.serviceHuella.ultimoAcceso().subscribe((data: any) => {
        this.cliente = data.cliente;
        this.idGuardado = this.cliente.ID_Cliente;
        this.dialogo.updateSize('600px', 'auto');
      });
  
      // Ejecutar la tarea cada 5 segundos
      this.subscription = interval(5000).pipe(
        startWith(0),
        switchMap(() => this.serviceHuella.ultimoAcceso())
      ).subscribe((data: any) => {
        this.cliente = data.cliente;
        // Comparar el ID recibido con el ID guardado
        if (this.cliente.ID_Cliente !== this.idGuardado) {
          // Si son diferentes, actualizar la información y guardar el nuevo ID
          this.idGuardado = this.cliente.ID_Cliente;
          this.dialogo.updateSize('600px', 'auto');
        }
      });
    }*/

    ngOnInit(): void {
      // Obtener el ID la primera vez y guardarlo en la variable idGuardado
      this.serviceHuella.ultimoAcceso().subscribe((data: any) => {
        this.cliente = data.cliente;
        this.idGuardado = this.cliente.ID_Cliente;
        this.dialogo.updateSize('600px', 'auto');
      });
    
      // Ejecutar la tarea cada 5 segundos
      this.subscription = interval(5000).pipe(
        startWith(0),
        switchMap(() => this.serviceHuella.ultimoAcceso())
      ).subscribe((data: any) => {
        // Solo actualiza si el idFormControl está vacío
        if (!this.IdFormControl.value) {
          this.cliente = data.cliente;
          // Comparar el ID recibido con el ID guardado
          if (this.cliente.ID_Cliente !== this.idGuardado) {
            // Si son diferentes, actualizar la información y guardar el nuevo ID
            this.idGuardado = this.cliente.ID_Cliente;
            this.dialogo.updateSize('600px', 'auto');
          }
        }
      });
    }
  
    ngOnDestroy(): void {
      // Liberar la suscripción al destruir el componente
      this.subscription.unsubscribe();
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
    this.IdFormControl.setValue('');
    if (this.inputField) {
      this.inputField.nativeElement.value = '';
    }
  }
  

}
