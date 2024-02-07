import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlanService } from 'src/app/service/plan.service';
import { AuthService } from 'src/app/service/auth.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { RouterLink, Router} from '@angular/router';
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';


@Component({
  selector: 'app-service-dialog',
  templateUrl: './service-dialog.component.html',
  styleUrls: ['./service-dialog.component.css']
})
export class ServiceDialogComponent implements OnInit{
  serviceForm!: FormGroup;
  idGym: number = 0;
  idService: number = 0;
  service: Service | null = null;
  seleccionado: number = 0;


  constructor(
    private fb: FormBuilder, 
    private planService: PlanService, 
    private auth: AuthService,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<ServiceDialogComponent>,
    private dialogRefConfirm: MatDialogRef<MensajeEmergentesComponent>,
    private router: Router
    ) 
  {
    this.serviceForm = this.fb.group({
      id_servicios_individuales: [0],
      nombre_servicio: ['' , [Validators.required, Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u)]],
      detalles: ['' , [Validators.required, Validators.pattern(/^[^\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/u)]],
      precio_unitario: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      fk_idGimnasio: [0]
    });
  }

  ngOnInit(): void {
    this.auth.idGym.subscribe((id) => {
      if(id){
        this.idGym = id;
        console.log("ID GYM: ", this.idGym);
      }
  });

  this.planService.seleccionado.subscribe((id) => {
    if(id){
      this.seleccionado = id;
      if(id == 1){
        console.log("AGREGAR FORMULARIO");
      } else if(id == 2){
        console.log("EDITAR FORMULARIO");
        this.planService.idService.subscribe((id) => {
          if(id){
            this.idService = id;
            this.planService.getService(this.idService).subscribe((res) => {
              if(res){
                this.service = res;
                console.log("ANTES DE SET VALUE", this.service)
                if(this.service){
                this.serviceForm.setValue({
                  id_servicios_individuales: this.service.id_servicios_individuales,
                  nombre_servicio: this.service.nombre_servicio,
                  detalles: this.service.detalles,
                  precio_unitario: this.service.precio_unitario,
                  fk_idGimnasio: this.idGym
                });
              }
              } else {
                console.log("NO HAY SERVICIO");
              }
            });
          }
        });
      }
    }
  });
}


  isFieldInvalidService(field: string, error: string): boolean {
    const control = this.serviceForm.get(field);
    return control?.errors?.[error] && (control?.touched ?? false);  
  }

  validaFormService(){
    if(this.serviceForm.invalid){
      console.log("Formulario invalido");
      Object.values(this.serviceForm.controls).forEach(control => {
        console.log(control.errors); // Imprime los errores de cada control
        control.markAsTouched();
      });
    } else {
    console.log("FORM SERVICIO VALIDO");
    this.serviceForm.setValue({
      id_servicios_individuales: 0,
      nombre_servicio: this.serviceForm.value.nombre_servicio,
      detalles: this.serviceForm.value.detalles,
      precio_unitario: this.serviceForm.value.precio_unitario,
      fk_idGimnasio: this.idGym
    });
    console.log("Formulario servicio: ", this.serviceForm.value);
    this.planService.newService(this.serviceForm.value).subscribe(respuesta => {
      if(respuesta){
        //console.log("SERVICIOS INSERTADOS?: ",respuesta);
        if(respuesta.message == "Insertado con exito"){
          const dialogRefConfirm = this.dialog.open(MensajeEmergentesComponent, {
            width: '400px',
            height: '200px',
            data: `¡Servicio agregado con éxito!`
          });
          this.serviceForm.reset();

          dialogRefConfirm.afterClosed().subscribe((result => {
            console.log("Se tiene que cerrar el dialogo");
            this.planService.confirmButton.next(true);
            this.dialogRef.close();
          }));
        }

      }else {
        console.log("PARECE QUE NO HAY RESPUESTA");
      }
    });
    }
  }

  actualizarForm(){
    console.log("Esto es lo que se le va enviar para actualizar jejeje: ", this.serviceForm.value);
    this.planService.updateService(this.serviceForm.value).subscribe((res) => {
      if(res){
        console.log("Respuesta:", res);
        if(res.message == "Actualizado con exito"){
          const dialogRefConfirm = this.dialog.open(MensajeEmergentesComponent, {
            width: '400px',
            height: '200px',
            data: `¡Servicio actualizado con éxito!`
          });

          dialogRefConfirm.afterClosed().subscribe((result => {
            console.log("Se tiene que cerrar el dialogo");
            this.planService.confirmButton.next(true);
            this.dialogRef.close();
          }));
        }
      }
    });
  }

  cancelar(){
    this.dialogRef.close();
  }
}

interface Service {
  id_servicios_individuales: number;
  nombre_servicio: string;
  detalles: string;
  precio_unitario: number;
  fk_idGimnasio: number;
}