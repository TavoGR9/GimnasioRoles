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
      this.spinner.show();
      this.http.ActualizarContrasenia(this.data.clave,this.resetPasswordForm.value.confirmPassword) .subscribe({
        next: (resultDataUpdate: any) => {
          if (resultDataUpdate.respuesta) {
            if (resultDataUpdate.respuesta == 2) {
              this.toastr.error("Contraseña no actualizada", "Error!!!");
              this.cerrarDialogo();
            } else if (resultDataUpdate.respuesta == 1) {
              this.spinner.hide();
              this.cerrarDialogo();
              this.dialog.open(MensajeEmergentesComponent, { data: "Registro actualizado correctamente."})
              .afterClosed()
              .subscribe((cerrarDialogo: Boolean) => {
              if (cerrarDialogo) {}
              });

              this.resetPasswordForm.reset();
              this.dialogRef.close(true);
            } 
          }}, error: (error) => {
            this.toastr.error(
              "Ocurrió un error en la comunicación con el servidor.",
              "Error!!!"
            );
          },
        });
    } else {
      this.toastr.error( "Verifique los campos antes de guardar.", "Error!!!");
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  cerrarDialogo(): void {
    this.dialogRef.close(true);
  }
}
