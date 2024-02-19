import { Component, OnInit, Inject} from '@angular/core';
import { FormGroup, FormBuilder, Validators,AbstractControl } from '@angular/forms';
import { MembresiaService } from 'src/app/service/membresia.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
//import { GimnasioService } from 'src/app/service/gimnasio.service';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { AuthService } from 'src/app/service/auth.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlanService } from 'src/app/service/plan.service';
import { plan } from 'src/app/models/plan';
import { NgxSpinnerService } from "ngx-spinner";

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
    private spinner: NgxSpinnerService,
   // private gimnasioService: GimnasioService,
    public dialog: MatDialog
  ) {
    this.formulariodePlan = this.formulario.group({
      titulo: ['', Validators.required],
      detalles: [''],
      duracion: ['1', Validators.required],
      precio: ['', Validators.required],
      status: [1, Validators.required],
      tipo_membresia: [3],
      Gimnasio_idGimnasio: [this.auth.idGym.getValue(), Validators.required],
      fechaInicio:['', Validators.required],
      fechaFin:['', Validators.required],
     // membresias: [[], [Validators.required, this.requireMinItems(1)]],
    }, {validators: this.dateLessThan('fechaInicio', 'fechaFin')});
  }

  ngOnInit(): void {
    this.auth.idGym.subscribe((id) => {
      if(id){
        this.idGym = id;
      }
      this.planService.consultarPlanIdMem(this.idGym).subscribe(respuesta => {
        this.plan = respuesta;
      });
    });
    /*this.planService.consultarPlanId(JSON.stringify(this.idGym)).subscribe(respuesta => {
      this.plan = respuesta;
    });*/

    this.formulariodePlan.get('membresias')?.valueChanges.subscribe(() => {
      this.setDuration();
    });
  }

  cancelar() {
    this.formulariodePlan.reset(); // Esto restablecerá los valores del formulario
    this.router.navigateByUrl('admin/misMembresias');
  }

  
  enviar(): any {
    if (this.formulariodePlan.valid) {
      this.spinner.show();
      this.membresiaService
        .agregarPlan(this.formulariodePlan.value)
        .subscribe((respuesta) => {
          if(respuesta){

          }
          this.spinner.hide();
          this.dialog
            .open(MensajeEmergentesComponent, {
              data: `Plan agregado exitosamente`,
            })
            .afterClosed()
            .subscribe((cerrarDialogo: Boolean) => {
              if (cerrarDialogo) {
                this.dialogo.close(true);
                this.formulariodePlan.reset();

              } else {
              }
            });
        });
    } else {
      this.message = 'Por favor, complete todos los campos requeridos.';
      this.marcarCamposInvalidos(this.formulariodePlan);
    }
  }

  marcarCamposInvalidos(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((campo) => {
      const control = formGroup.get(campo);
      if (control instanceof FormGroup) {
        this.marcarCamposInvalidos(control);
      } else {
        if (control) {
          control.markAsTouched();
        };
      }
    });
  }

  cerrarDialogo(): void {
    this.dialogo.close(true);
  }


  isFieldInvalid(field: string, error: string): boolean {
    const control = this.formulariodePlan.get(field);
    return control?.errors?.[error] && (control?.touched ?? false);  
  }

  setDuration(){
    if(this.formulariodePlan.get('membresias')?.value.length > 0){
        let duracion = this.formulariodePlan.get('membresias')?.value.reduce((acc: number, item: any) => {
            return acc + Number(item.duracion);
        }, 0);
        this.formulariodePlan.get('duracion')?.setValue(duracion);
    } else {
        this.formulariodePlan.get('duracion')?.setValue(0);
    }
}

  requireMinItems(min: number) {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const length = control.value ? control.value.length : 0;
      return length >= min ? null : { 'minItems': {value: control.value}};
    };
  }

  dateLessThan(from: string, to: string) {
    return (group: FormGroup): {[key: string]: any} => {
      let f = group.controls[from];
      let t = group.controls[to];
      if (f.value > t.value) {
        return {
          dates: "La fecha de inicio debe ser anterior a la fecha de fin"
        };
      }
      return {};
    }
  }
}
