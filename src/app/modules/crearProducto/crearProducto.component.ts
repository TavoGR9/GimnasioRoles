import {ChangeDetectionStrategy,Component,OnInit,Inject} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { DatePipe } from "@angular/common";
import { MessageService } from "primeng/api"; 
import { ToastrService } from "ngx-toastr";
import { CategoriaService } from "../../service/categoria.service";
import { AuthService } from "../../service/auth.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatDialog } from "@angular/material/dialog";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import { ProductoService } from "../../service/producto.service";
import { Subject } from "rxjs";
import { NgxSpinnerService } from "ngx-spinner";
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    formulario: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = formulario && formulario.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}
@Component({
  selector: "crear-producto",
  templateUrl: "./crearProducto.component.html",
  styleUrls: ["./crearProducto.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe, MessageService],
})
export class CrearProductoComponent implements OnInit {
  fechaCreacion: string;
  form: FormGroup;
  matcher = new MyErrorStateMatcher();
  idCategoria: number = 0;
  listaCategorias: any;
  uploadedFiles: File[] = [];
  private idGym: number = 0;
  message: string = "";
  currentUser: string = "";
  categorias: any[] = [];
  sabores: string[] = [];
  marcas: string[] = [];
  subcategorias: string[] = [];
  filteredSabores: string[] = [];
  filteredCategorias: string[] = [];
  filteredSubCategorias: string[] = [];
  filteredMarcas: string[] = [];
  private productoSubject = new Subject<void>();

  constructor(
    public dialogo: MatDialogRef<CrearProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private auth: AuthService,
    private productoService: ProductoService,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService
  ) {
    this.fechaCreacion = this.obtenerFechaActual();
    this.form = this.fb.group({
      detalleUnidadMedida: ["pza"],
      precioCompra: [0],
      detalleCompra: ["", Validators.required],
      marcaP: ["", Validators.required],
      activo: [1],
      ItemNumber: [0],
      codigoBarra: ["", Validators.required],
      ieps: [0],
      iva: [0],
      sat: [0],
      nombreCategoriaP: ["", Validators.required],
      nomsubcate: ["", Validators.required],
      factura: [0],
      STYLE_ITEM_ID: ["0"],
      precioCaja: ["0"],
      cantidadMayoreo: ["0"],
      descripcion: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    if (this.currentUser) {
      this.getSSdata(JSON.stringify(this.currentUser));
    }
    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
    });
  }

  getSSdata(data: any) {
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
        this.auth.role.next(resultData.rolUser);
        this.auth.userId.next(resultData.id);
        this.auth.idGym.next(resultData.idGym);
        this.auth.nombreGym.next(resultData.nombreGym);
        this.auth.email.next(resultData.email);
        this.auth.encryptedMail.next(resultData.encryptedMail);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  validarNumeroDecimal(event: any) {
    const input = event.target.value;
    // Patrón para aceptar números decimales
    const pattern = /^\d+(\.\d{0,2})?$/;
    if (!pattern.test(input)) {
      this.form.get("cantidadUnidades")?.setValue(input.slice(0, -1));
    }
  }

  obtenerFechaActual(): string {
    const fechaActual = new Date();
    return this.datePipe.transform(fechaActual, "yyyy-MM-dd HH:mm:ss") || "";
  }

  cerrarDialogo(): void {
    this.dialogo.close(true);
  }

  buscarCategorias() {
    const saborIngresado = this.form.get("nombreCategoriaP")?.value;
    this.categoriaService.obtenerCategoria().subscribe({
      next: (respuesta) => {
        const categoriasU = new Set(
          respuesta.categorias.map((categoria: any) => categoria.nombreCategoria)
        );
        this.categorias = Array.from(categoriasU) as string[];
        this.filteredCategorias = this.categorias.filter(
          (categoria) =>
            !saborIngresado ||
            categoria.toLowerCase().includes(saborIngresado.toLowerCase())
        );
      },
    });
  }
  
  buscarSubCategorias() {
    const subCIngresado = this.form.get("nomsubcate")?.value;
    this.categoriaService.obtenerSubCategoria().subscribe({
      next: (respuesta) => {
        const subCategoriasU = new Set(
          respuesta.subCategoria.map((subCategoria: any) => subCategoria.nombreProducto)
        );
        this.subcategorias = Array.from(subCategoriasU) as string[];
        this.filteredSubCategorias = this.subcategorias.filter(
          (subcategoria) =>
            !subCIngresado ||
            subcategoria.toLowerCase().includes(subCIngresado.toLowerCase())
        );
      },
    });
  }
  
  buscarMarca() {
    const marcaIngresado = this.form.get("marcaP")?.value;
    this.categoriaService.obtenerMarcas().subscribe({
      next: (respuesta) => {
        const marcasU = new Set(
          respuesta.marcas.map((marca: any) => marca.marca)
        );
        this.marcas = Array.from(marcasU) as string[];
        this.filteredMarcas = this.marcas.filter(
          (marca) =>
            !marcaIngresado ||
            marca.toLowerCase().includes(marcaIngresado.toLowerCase())
        );
      },
    });
  }
  
  marcarCamposInvalidos(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((campo) => {
      const control = formGroup.get(campo);
      if (control instanceof FormGroup) {
        this.marcarCamposInvalidos(control);
      } else {
        if (control) {
          control.markAsTouched();
        }
      }
    });
  }

  registrarProd() {
    if (this.form.valid) {
      this.spinner.show();
      ///********** Verifica si la categoria ya existe */
      this.categoriaService
        .obtenerCategoriaPorNombre(this.form.value.nombreCategoriaP)
        .subscribe((categoriaExistente) => {
          if (categoriaExistente.success == 1) {
            ///********** Verifica si la subcategoria ya existe */
            this.categoriaService
              .obtenerSubCategoriaPorNombre(
                this.form.value.nomsubcate,
                categoriaExistente.categoria.id_categoria
              )
              .subscribe((subCategoriaExistente) => {
                if (subCategoriaExistente.success == 1) {
                  ///********** Verifica si la marca ya existe */
                  this.categoriaService
                    .obtenerMarcaPorNombre(this.form.value.marcaP)
                    .subscribe((marcaExistente) => {
                      if (marcaExistente.success == 1) {
                        const formularioP = {
                          idProducto:subCategoriaExistente.producto.id_producto,
                          detalleUnidadMedida: "pza",
                          precioCompra: this.form.value.precioCompra,
                          detalleCompra: this.form.value.detalleCompra,
                          id_marcaV: marcaExistente.marcasproducto.id_marcas,
                          descripcion: this.form.value.descripcion,
                          codigoBarra: this.form.value.codigoBarra,
                          ItemNumber: this.form.value.ItemNumber,
                          activo: this.form.value.activo,
                          sat: this.form.value.sat,
                          ieps: this.form.value.ieps,
                          iva: this.form.value.iva,
                          factura: this.form.value.factura,
                          STYLE_ITEM_ID: this.form.value.STYLE_ITEM_ID,
                          precioCaja: this.form.value.precioCaja,
                          cantidadMayoreo: this.form.value.cantidadMayoreo,
                        };

                        this.productoService
                          .creaProducto(formularioP)
                          .subscribe({
                            next: (respuesta) => {
                              if (respuesta.success) {
                                this.spinner.hide();
                                this.dialog
                                  .open(MensajeEmergentesComponent, {
                                    data: `Producto agregado exitosamente`,
                                  })
                                  .afterClosed()
                                  .subscribe((cerrarDialogo: Boolean) => {
                                    if (cerrarDialogo) {
                                      this.productoSubject.next();
                                      this.dialogo.close(true);
                                    } else {
                                      // Puedes agregar lógica adicional aquí si es necesario
                                    }
                                  });
                              } else {
                                this.toastr.error(respuesta.message, "Error", {
                                  positionClass: "toast-bottom-left",
                                });
                              }
                            },
                            error: (paramError) => {
                              this.toastr.error(
                                paramError.error.message,
                                "Error",
                                {
                                  positionClass: "toast-bottom-left",
                                }
                              );
                            },
                          });
                      } else {
                        const formMarca = {
                          marcaP: this.form.value.marcaP,
                        };
                        this.categoriaService
                          .agregarMarca(formMarca)
                          .subscribe((respuestaMarca) => {
                            const formularioP = {
                              idProducto: subCategoriaExistente.producto.id_producto,
                              detalleUnidadMedida: "pza",
                              precioCompra: this.form.value.precioCompra,
                              detalleCompra: this.form.value.detalleCompra,
                              id_marcaV: respuestaMarca.id_marcas,
                              descripcion: this.form.value.descripcion,
                              codigoBarra: this.form.value.codigoBarra,
                              ItemNumber: this.form.value.ItemNumber,
                              activo: this.form.value.activo,
                              sat: this.form.value.sat,
                              ieps: this.form.value.ieps,
                              iva: this.form.value.iva,
                              factura: this.form.value.factura,
                              STYLE_ITEM_ID: this.form.value.STYLE_ITEM_ID,
                              precioCaja: this.form.value.precioCaja,
                              cantidadMayoreo: this.form.value.cantidadMayoreo,
                            };

                            this.productoService
                              .creaProducto(formularioP)
                              .subscribe({
                                next: (respuesta) => {
                                  if (respuesta.success) {
                                    this.spinner.hide();
                                    this.dialog
                                      .open(MensajeEmergentesComponent, {
                                        data: `Producto agregado exitosamente`,
                                      })
                                      .afterClosed()
                                      .subscribe((cerrarDialogo: Boolean) => {
                                        if (cerrarDialogo) {
                                          this.productoSubject.next();
                                          this.dialogo.close(true);
                                        } else {
                                          // Puedes agregar lógica adicional aquí si es necesario
                                        }
                                      });
                                  } else {
                                    this.toastr.error(
                                      respuesta.message,
                                      "Error",
                                      {
                                        positionClass: "toast-bottom-left",
                                      }
                                    );
                                  }
                                },
                                error: (paramError) => {
                                  this.toastr.error(
                                    paramError.error.message,
                                    "Error",
                                    {
                                      positionClass: "toast-bottom-left",
                                    }
                                  );
                                },
                              });
                          });
                      }
                    });
                } else {
                  ///********** Si la sub no existe */
                  const formSub = {
                    idcatte: categoriaExistente.categoria.id_categoria,
                    nomsubcate: this.form.value.nomsubcate,
                  };

                  this.categoriaService
                    .agregarSubCategoria(formSub)
                    .subscribe((respuestaSub) => {
                      ///********** Verifica si la marca ya existe */
                      this.categoriaService
                        .obtenerMarcaPorNombre(this.form.value.marcaP)
                        .subscribe((marcaExistente) => {
                          if (marcaExistente.success == 1) {
                            this.spinner.hide();
                            //agregar producto

                            const formularioP = {
                              idProducto:respuestaSub.id_producto,
                              detalleUnidadMedida: "pza",
                              precioCompra: this.form.value.precioCompra,
                              detalleCompra: this.form.value.detalleCompra,
                              id_marcaV:marcaExistente.marcasproducto.id_marcas,
                              descripcion: this.form.value.descripcion,
                              codigoBarra: this.form.value.codigoBarra,
                              ItemNumber: this.form.value.ItemNumber,
                              activo: this.form.value.activo,
                              sat: this.form.value.sat,
                              ieps: this.form.value.ieps,
                              iva: this.form.value.iva,
                              factura: this.form.value.factura,
                              STYLE_ITEM_ID: this.form.value.STYLE_ITEM_ID,
                              precioCaja: this.form.value.precioCaja,
                              cantidadMayoreo: this.form.value.cantidadMayoreo,
                            };

                            this.productoService
                              .creaProducto(formularioP)
                              .subscribe({
                                next: (respuesta) => {
                                  if (respuesta.success) {
                                    this.spinner.hide();
                                    this.dialog
                                      .open(MensajeEmergentesComponent, {
                                        data: `Producto agregado exitosamente`,
                                      })
                                      .afterClosed()
                                      .subscribe((cerrarDialogo: Boolean) => {
                                        if (cerrarDialogo) {
                                          this.productoSubject.next();
                                          this.dialogo.close(true);
                                        } else {
                                          // Puedes agregar lógica adicional aquí si es necesario
                                        }
                                      });
                                  } else {
                                    this.toastr.error(
                                      respuesta.message,
                                      "Error",
                                      {
                                        positionClass: "toast-bottom-left",
                                      }
                                    );
                                  }
                                },
                                error: (paramError) => {
                                  this.toastr.error(
                                    paramError.error.message,
                                    "Error",
                                    {
                                      positionClass: "toast-bottom-left",
                                    }
                                  );
                                },
                              });
                          } else {
                            const formMarca = {
                              marcaP: this.form.value.marcaP,
                            };
                            this.categoriaService
                              .agregarMarca(formMarca)
                              .subscribe((respuestaMarca) => {
                                const formularioP = {
                                  idProducto:respuestaSub.id_producto,
                                  detalleUnidadMedida: "pza",
                                  precioCompra: this.form.value.precioCompra,
                                  detalleCompra: this.form.value.detalleCompra,
                                  id_marcaV:
                                  respuestaMarca.id_marcas,
                                  descripcion: this.form.value.descripcion,
                                  codigoBarra: this.form.value.codigoBarra,
                                  ItemNumber: this.form.value.ItemNumber,
                                  activo: this.form.value.activo,
                                  sat: this.form.value.sat,
                                  ieps: this.form.value.ieps,
                                  iva: this.form.value.iva,
                                  factura: this.form.value.factura,
                                  STYLE_ITEM_ID: this.form.value.STYLE_ITEM_ID,
                                  precioCaja: this.form.value.precioCaja,
                                  cantidadMayoreo:
                                    this.form.value.cantidadMayoreo,
                                };

                                this.productoService
                                  .creaProducto(formularioP)
                                  .subscribe({
                                    next: (respuesta) => {
                                      if (respuesta.success) {
                                        this.spinner.hide();
                                        this.dialog
                                          .open(MensajeEmergentesComponent, {
                                            data: `Producto agregado exitosamente`,
                                          })
                                          .afterClosed()
                                          .subscribe(
                                            (cerrarDialogo: Boolean) => {
                                              if (cerrarDialogo) {
                                                this.productoSubject.next();
                                                this.dialogo.close(true);
                                              } else {
                                                // Puedes agregar lógica adicional aquí si es necesario
                                              }
                                            }
                                          );
                                      } else {
                                        this.toastr.error(
                                          respuesta.message,
                                          "Error",
                                          {
                                            positionClass: "toast-bottom-left",
                                          }
                                        );
                                      }
                                    },
                                    error: (paramError) => {
                                      this.toastr.error(
                                        paramError.error.message,
                                        "Error",
                                        {
                                          positionClass: "toast-bottom-left",
                                        }
                                      );
                                    },
                                  });
                                this.spinner.hide();
                              });
                          }
                        });
                    });
                }
              });
          } else {
            // Si la categoría no existe, se agrega
            this.categoriaService
              .agregarCategoria(this.form.value)
              .subscribe((respuesta) => {

                ///********** Verifica si la subcategoria ya existe */
                this.categoriaService
                  .obtenerSubCategoriaPorNombre(
                    this.form.value.nomsubcate,
                    respuesta.id_categoria
                  )
                  .subscribe((subCategoriaExistente) => {
                    if (subCategoriaExistente.success == 1) {

                      this.categoriaService
                        .obtenerMarcaPorNombre(this.form.value.marcaP)
                        .subscribe((marcaExistente) => {
                          if (marcaExistente.success == 1) {
                            //agregar producto

                            const formularioP = {
                              idProducto:subCategoriaExistente.producto.id_producto,
                              detalleUnidadMedida: "pza",
                              precioCompra: this.form.value.precioCompra,
                              detalleCompra: this.form.value.detalleCompra,
                              id_marcaV:marcaExistente.marcasproducto.id_marcas,
                              descripcion: this.form.value.descripcion,
                              codigoBarra: this.form.value.codigoBarra,
                              ItemNumber: this.form.value.ItemNumber,
                              activo: this.form.value.activo,
                              sat: this.form.value.sat,
                              ieps: this.form.value.ieps,
                              iva: this.form.value.iva,
                              factura: this.form.value.factura,
                              STYLE_ITEM_ID: this.form.value.STYLE_ITEM_ID,
                              precioCaja: this.form.value.precioCaja,
                              cantidadMayoreo: this.form.value.cantidadMayoreo,
                            };

                            this.productoService
                              .creaProducto(formularioP)
                              .subscribe({
                                next: (respuesta) => {
                                  if (respuesta.success) {
                                    this.spinner.hide();
                                    this.dialog
                                      .open(MensajeEmergentesComponent, {
                                        data: `Producto agregado exitosamente`,
                                      })
                                      .afterClosed()
                                      .subscribe((cerrarDialogo: Boolean) => {
                                        if (cerrarDialogo) {
                                          this.productoSubject.next();
                                          this.dialogo.close(true);
                                        } else {
                                          // Puedes agregar lógica adicional aquí si es necesario
                                        }
                                      });
                                  } else {
                                    this.toastr.error(
                                      respuesta.message,
                                      "Error",
                                      {
                                        positionClass: "toast-bottom-left",
                                      }
                                    );
                                  }
                                },
                                error: (paramError) => {
                                  this.toastr.error(
                                    paramError.error.message,
                                    "Error",
                                    {
                                      positionClass: "toast-bottom-left",
                                    }
                                  );
                                },
                              });
                          } else {
                            const formMarca = {
                              marcaP: this.form.value.marcaP,
                            };
                            this.categoriaService
                              .agregarMarca(formMarca)
                              .subscribe((respuestaMarca) => {
                                const formularioP = {
                                  idProducto:subCategoriaExistente.producto.id_producto,
                                  detalleUnidadMedida: "pza",
                                  precioCompra: this.form.value.precioCompra,
                                  detalleCompra: this.form.value.detalleCompra,
                                  id_marcaV:respuestaMarca.id_marcas,
                                  descripcion: this.form.value.descripcion,
                                  codigoBarra: this.form.value.codigoBarra,
                                  ItemNumber: this.form.value.ItemNumber,
                                  activo: this.form.value.activo,
                                  sat: this.form.value.sat,
                                  ieps: this.form.value.ieps,
                                  iva: this.form.value.iva,
                                  factura: this.form.value.factura,
                                  STYLE_ITEM_ID: this.form.value.STYLE_ITEM_ID,
                                  precioCaja: this.form.value.precioCaja,
                                  cantidadMayoreo:this.form.value.cantidadMayoreo,
                                };

                                this.productoService
                                  .creaProducto(formularioP)
                                  .subscribe({
                                    next: (respuesta) => {
                                      if (respuesta.success) {
                                        this.spinner.hide();
                                        this.dialog
                                          .open(MensajeEmergentesComponent, {
                                            data: `Producto agregado exitosamente`,
                                          })
                                          .afterClosed()
                                          .subscribe(
                                            (cerrarDialogo: Boolean) => {
                                              if (cerrarDialogo) {
                                                this.productoSubject.next();
                                                this.dialogo.close(true);
                                              } else {
                                              }
                                            }
                                          );
                                      } else {
                                        this.toastr.error(
                                          respuesta.message,
                                          "Error",
                                          {
                                            positionClass: "toast-bottom-left",
                                          }
                                        );
                                      }
                                    },
                                    error: (paramError) => {
                                      this.toastr.error(
                                        paramError.error.message,
                                        "Error",
                                        {
                                          positionClass: "toast-bottom-left",
                                        }
                                      );
                                    },
                                  });
                                this.spinner.hide();
                              });
                          }
                        });
                    } else {
                      // Si la subcategoría no existe, agregarla
                      const formSub = {
                        idcatte: respuesta.id_categoria,
                        nomsubcate: this.form.value.nomsubcate,
                      };

                      this.categoriaService
                        .agregarSubCategoria(formSub)
                        .subscribe((respuestaSub) => {

                          ///********** Verifica si la marca ya existe */
                          this.categoriaService
                            .obtenerMarcaPorNombre(this.form.value.marcaP)
                            .subscribe((marcaExistente) => {
                              if (marcaExistente.success == 1) {

                                const formularioP = {
                                  idProducto:respuestaSub.id_producto,
                                  detalleUnidadMedida: "pza",
                                  precioCompra: this.form.value.precioCompra,
                                  detalleCompra: this.form.value.detalleCompra,
                                  id_marcaV:marcaExistente.marcasproducto.id_marcas,
                                  descripcion: this.form.value.descripcion,
                                  codigoBarra: this.form.value.codigoBarra,
                                  ItemNumber: this.form.value.ItemNumber,
                                  activo: this.form.value.activo,
                                  sat: this.form.value.sat,
                                  ieps: this.form.value.ieps,
                                  iva: this.form.value.iva,
                                  factura: this.form.value.factura,
                                  STYLE_ITEM_ID: this.form.value.STYLE_ITEM_ID,
                                  precioCaja: this.form.value.precioCaja,
                                  cantidadMayoreo:this.form.value.cantidadMayoreo,
                                };
                                this.productoService
                                  .creaProducto(formularioP)
                                  .subscribe({
                                    next: (respuesta) => {
                                      if (respuesta.success) {
                                        this.spinner.hide();
                                        this.dialog
                                          .open(MensajeEmergentesComponent, {
                                            data: `Producto agregado exitosamente`,
                                          })
                                          .afterClosed()
                                          .subscribe(
                                            (cerrarDialogo: Boolean) => {
                                              if (cerrarDialogo) {
                                                this.productoSubject.next();
                                                this.dialogo.close(true);
                                              } else {
                                              }
                                            }
                                          );
                                      } else {
                                        this.toastr.error(
                                          respuesta.message,
                                          "Error",
                                          {
                                            positionClass: "toast-bottom-left",
                                          }
                                        );
                                      }
                                    },
                                    error: (paramError) => {
                                      this.toastr.error(
                                        paramError.error.message,
                                        "Error",
                                        {
                                          positionClass: "toast-bottom-left",
                                        }
                                      );
                                    },
                                  });
                              } else {
                                const formMarca = {
                                  marcaP: this.form.value.marcaP,
                                };
                                this.categoriaService
                                  .agregarMarca(formMarca)
                                  .subscribe((respuestaMarca) => {
                                    const formularioP = {
                                      idProducto:respuestaSub.id_producto,
                                      detalleUnidadMedida: "pza",
                                      precioCompra:this.form.value.precioCompra,
                                      detalleCompra:this.form.value.detalleCompra,
                                      id_marcaV:respuestaMarca.id_marcas,
                                      descripcion: this.form.value.descripcion,
                                      codigoBarra: this.form.value.codigoBarra,
                                      ItemNumber: this.form.value.ItemNumber,
                                      activo: this.form.value.activo,
                                      sat: this.form.value.sat,
                                      ieps: this.form.value.ieps,
                                      iva: this.form.value.iva,
                                      factura: this.form.value.factura,
                                      STYLE_ITEM_ID:this.form.value.STYLE_ITEM_ID,
                                      precioCaja: this.form.value.precioCaja,
                                      cantidadMayoreo:this.form.value.cantidadMayoreo,
                                    };

                                    this.productoService
                                      .creaProducto(formularioP)
                                      .subscribe({
                                        next: (respuesta) => {
                                          if (respuesta.success) {
                                            this.spinner.hide();
                                            this.dialog
                                              .open(
                                                MensajeEmergentesComponent,
                                                {
                                                  data: `Producto agregado exitosamente`,
                                                }
                                              )
                                              .afterClosed()
                                              .subscribe(
                                                (cerrarDialogo: Boolean) => {
                                                  if (cerrarDialogo) {
                                                    this.productoSubject.next();
                                                    this.dialogo.close(true);
                                                  } else {
                                                  }
                                                }
                                              );
                                          } else {
                                            this.toastr.error(
                                              respuesta.message,
                                              "Error",
                                              {
                                                positionClass:
                                                  "toast-bottom-left",
                                              }
                                            );
                                          }
                                        },
                                        error: (paramError) => {
                                          this.toastr.error(
                                            paramError.error.message,
                                            "Error",
                                            {
                                              positionClass:
                                                "toast-bottom-left",
                                            }
                                          );
                                        },
                                      });
                                    this.spinner.hide();
                                  });
                              }
                            });
                        });
                    }
                  });
              });
          }
        });
    } else {
      this.message = "Por favor, complete todos los campos requeridos.";
      this.marcarCamposInvalidos(this.form);
    }
  }
}
