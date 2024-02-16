import { Component, OnInit, Inject} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { FormGroup,FormBuilder,Validators, AbstractControl } from '@angular/forms';
import { MembresiaService } from 'src/app/service/membresia.service';
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from 'src/app/service/auth.service';
import { PlanService } from '../../service/plan.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-membresias-editar',
  templateUrl: './membresias-editar.component.html',
  styleUrls: ['./membresias-editar.component.css'] 
})
export class planEditarComponent {
  formulariodePlan: FormGroup;
  gimnasio: any;
  elID:any;
  plan: any[] = [];
  selectedMembresia: any;
  message: string = '';
  dataToUpdate: any = [];
  serviceToUpdate: any = [];
  memberships: any = [];

  constructor(
    public dialogo: MatDialogRef<planEditarComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string,
    public formulario:FormBuilder,
    private activeRoute: ActivatedRoute, 
    private membresiaService:MembresiaService,
    private router:Router,
    private auth: AuthService,
    public dialog: MatDialog,
    private planService: PlanService) {

      this.formulariodePlan = this.formulario.group({
        titulo: ['', Validators.required],
        detalles: ['', Validators.required],
        duracion: ['', Validators.required],
        precio: ['', Validators.required],
        status: [1, Validators.required],
        tipo_membresia: [3],
        Gimnasio_idGimnasio: [this.auth.idGym.getValue(), Validators.required],
        fechaInicio:['', Validators.required],
        fechaFin:['', Validators.required],
        membresias: [[], [Validators.required, this.requireMinItems(1)]],
      }, {validators: this.dateLessThan('fechaInicio', 'fechaFin')});
  }

  ngOnInit(): void {
    this.planService.consultarPlanIdMem(this.auth.idGym.getValue()).subscribe(respuesta => {
      if(respuesta){
        this.memberships = respuesta;
      }
    });

    this.planService.getDataToUpdate().subscribe((data) => {
      if(data){
        this.dataToUpdate = data;
      }
    });

    this.planService.consultarPlan(this.dataToUpdate.id).subscribe(respuesta => {
      if(respuesta){
        this.serviceToUpdate = respuesta;
        console.log("TEST:", this.serviceToUpdate);
        this.formulariodePlan.setValue({
          titulo: this.serviceToUpdate[0].titulo,
          detalles: this.serviceToUpdate[0].detalles,
          duracion: this.serviceToUpdate[0].duracion,
          precio: this.serviceToUpdate[0].precio,
          status: this.serviceToUpdate[0].status,
          tipo_membresia: this.serviceToUpdate[0].tipo_membresia,
          Gimnasio_idGimnasio: this.serviceToUpdate[0].Gimnasio_idGimnasio,
          fechaInicio: this.serviceToUpdate[0].fechaInicio,
          fechaFin: this.serviceToUpdate[0].fechaFin,
          membresias: "gimnasio"
        });
      }
    });
  }
    
  actualizar(){
    this.membresiaService.actualizarPlan(this.elID,this.formulariodePlan.value).subscribe(()=>{
      this.dialog.open(MensajeEmergentesComponent, {
        data: `Membresía actualizada exitosamente`,
      })
      .afterClosed()
      .subscribe((cerrarDialogo: Boolean) => {
        if (cerrarDialogo) {
          this.router.navigateByUrl("/admin/misMembresias");
        } else {
        }
      });
    })
  }

  cerrarDialogo(){
    this.dialogo.close(true);
  }

  enviar(){

  }

  isFieldInvalid(field: string, error: string): boolean {
    const control = this.formulariodePlan.get(field);
    return control?.errors?.[error] && (control?.touched ?? false);  
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
