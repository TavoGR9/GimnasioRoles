import { Component, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ColaboradorService } from "../../service/colaborador.service";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: "app-restablecer-contra",
  templateUrl: "./restablecer-contra.component.html",
  styleUrls: ["./restablecer-contra.component.css"],
})
export class RestablecerContraComponent {
  hidePassword = true;
  hideConfirmPassword = true;
  resetPasswordForm: FormGroup;
  constructor(
    private http: ColaboradorService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<RestablecerContraComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) {
    this.resetPasswordForm = this.fb.group(
      {
        newPassword: ["", [Validators.required]],
        confirmPassword: ["", [Validators.required]],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    //console.log("Datos recibidos en el modal:", this.data);
    if (!this.data?.id_empleado) {
      console.error("ID del empleado no está disponible en los datos:", this.data);
    }
  }
  
  passwordMatchValidator(formGroup: FormGroup): void {
    const password = formGroup.get("newPassword")?.value;
    const confirmPassword = formGroup.get("confirmPassword")?.value;
    if (password !== confirmPassword) {
      formGroup.get("confirmPassword")?.setErrors({ mismatch: true });
    } else {
      formGroup.get("confirmPassword")?.setErrors(null);
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      const idempleado = this.data?.id_empleado; // Verifica que id_empleado esté disponible
      if (!idempleado) {
        console.error("ID del empleado no está disponible en los datos proporcionados al modal.");
        return;
      }
  
      const contrasenia = this.resetPasswordForm.value.confirmPassword;
      //console.log("ID del empleado:", idempleado);
  
      this.http.ActualizarContrasenia(idempleado, contrasenia).subscribe({
        next: (resultDataUpdate) => {
          //console.log("Respuesta del servidor:", resultDataUpdate);
  
          // Mostrar mensaje emergente de confirmación
          this.dialog
            .open(MensajeEmergentesComponent, {
              data: 'CONTRASEÑA actualizada correctamente.',
            })
            .afterClosed()
            .subscribe(() => {
              // Cerrar el modal principal después del mensaje emergente
              this.cerrarDialogo();
            });
        },
        error: (error) => {
          console.error("Error al comunicarse con el servidor:", error);
        },
      });
    } else {
      console.error("Formulario inválido.");
    }
  }
  
  
  onCancel(): void {
    this.dialogRef.close();
  }

  cerrarDialogo(): void {
    this.dialogRef.close(true);
  }
}
