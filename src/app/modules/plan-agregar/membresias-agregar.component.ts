import { Component, OnInit, Inject} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MembresiaService } from 'src/app/service/membresia.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
//import { GimnasioService } from 'src/app/service/gimnasio.service';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { AuthService } from 'src/app/service/auth.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlanService } from 'src/app/service/plan.service';
import { plan } from 'src/app/models/plan';

@Component({
  selector: 'app-membresias-agregar',
  templateUrl: './membresias-agregar.component.html',
  styleUrls: ['./membresias-agregar.component.css'] 
})
export class planAgregarComponent {
  formulariodePlan: FormGroup;
  message: string = '';
  hide = true;
  gimnasio: any;
  selectedMembresia: any;
  idGym: number = 0;
  plan: plan[] = [];

  constructor(
    public dialogo: MatDialogRef<planAgregarComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string,
    
    public formulario: FormBuilder,
    private router: Router,
    private membresiaService: MembresiaService,
    private auth: AuthService,
    private planService: PlanService,
   // private gimnasioService: GimnasioService,
    public dialog: MatDialog
  ) {
    this.formulariodePlan = this.formulario.group({
      titulo: ['', Validators.required],
      detalles: ['', Validators.required],
      duracion: ['', Validators.required],
      precio: ['', Validators.required],
      tipo_membresia: [3],
      Gimnasio_idGimnasio: [this.auth.idGym.getValue(), Validators.required],
      fechaInicio:[''],
      fechaFin:[''],
    });
  }

  ngOnInit(): void {
    this.auth.idGym.subscribe((id) => {
      if(id){
        this.idGym = id;
      }
    });
    this.planService.consultarPlanId(this.idGym).subscribe(respuesta => {
      this.plan = respuesta;
     
    });
  }

  cancelar() {
    this.formulariodePlan.reset(); // Esto restablecerá los valores del formulario
    this.router.navigateByUrl('admin/misMembresias');
  }

  
  enviar(): any {
    console.log(this.formulariodePlan.value);
    // Verifica si el formulario es válido
    if (this.formulariodePlan.valid) {
      this.membresiaService
        .agregarPlan(this.formulariodePlan.value)
        .subscribe((respuesta) => {
          this.dialog
            .open(MensajeEmergentesComponent, {
              data: `Membresía agregada exitosamente`,
            })
            .afterClosed()
            .subscribe((cerrarDialogo: Boolean) => {
              if (cerrarDialogo) {
                this.router.navigateByUrl('/admin/misMembresias');
              } else {
              }
            });
        });
    } else {
      // El formulario no es válido, muestra un mensaje de error
      this.message = 'Por favor, complete todos los campos requeridos.';
    }
  }

  cerrarDialogo(): void {
    this.dialogo.close(true);
  }


  isFieldInvalid(field: string, error: string): boolean {
    const control = this.formulariodePlan.get(field);
    return control?.errors?.[error] && (control?.touched ?? false);  
  }
}
