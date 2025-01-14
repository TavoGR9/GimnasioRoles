import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Inject,
} from "@angular/core";
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
      // detalleUnidadMedida: ["pza"],
      precioCompra: [0],
      detalleCompra: ["", Validators.required],
      marcaP: ["", Validators.required],
      activo: [1],
      // ItemNumber: [0],
      codigoBarra: ["", Validators.required],
      // ieps: [0],
      // iva: [0],
      // sat: [0],
      nombreCategoriaP: ["", Validators.required],
      nomsubcate: [{ value: "", disabled: true }, Validators.required],
      // factura: [0],
      // STYLE_ITEM_ID: ["0"],
      // precioCaja: ["0"],
      cantidadMayoreo: ["0"],
      descripcion: ["", Validators.required],
    });

    this.form.get("nombreCategoriaP")?.valueChanges.subscribe((value) => {
      // Habilitar o deshabilitar dinámicamente el control de la subcategoría
      if (value) {
        this.form.get("nomsubcate")?.enable();
      } else {
        this.form.get("nomsubcate")?.disable();
      }
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
    this.buscarCategorias();
    this.buscarMarca();
    //  this.buscarSubCategorias();
  }

  getSSdata(data: any) {
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
        this.auth.role.next(resultData.rolUser);
        this.auth.idUser.next(resultData.clave);
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
    this.categoriaService.obtenerCategoria2().subscribe({
      next: (respuesta) => {
        console.log('TODAS LAS CATEGORIAS: ', respuesta);

        // Filtrar las categorías excluyendo aquellas donde nombreCategoria sea "Servicios"
        const categoriasFiltradas = respuesta.filter(
          (categoria: any) => categoria.nombreCategoria !== "Servicios"
        );

        const categoriasU = new Set(
          categoriasFiltradas.map(
            (categoria: any) => categoria.nombreCategoria
          )
        );
        this.categorias = Array.from(categoriasU) as string[];
        this.filteredCategorias = this.categorias.filter(
          (categoria) =>
            !saborIngresado ||
            categoria.toLowerCase().includes(saborIngresado.toLowerCase())
        );

        // Obtener el ID de la categoría seleccionada
        const categoriaSeleccionada = respuesta.find(
          (categoria: any) => categoria.nombreCategoria === saborIngresado
        );
        if (categoriaSeleccionada) {
          const idCategoriaSeleccionada = categoriaSeleccionada.id_categoria;
          localStorage.setItem(
            "idCategoriaSeleccionada",
            idCategoriaSeleccionada
          );
          this.buscarSubCategorias();
        }
      },
    });
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  isRecep(): boolean {
    return this.auth.isRecepcion();
  }

  buscarSubCategorias() {
    const idCategoriaGuardada = localStorage.getItem("idCategoriaSeleccionada");
    const subCIngresado = this.form.get("nomsubcate")?.value;
    this.categoriaService.obtenerSubCategoria2(idCategoriaGuardada).subscribe({
      next: (respuesta) => {
        console.log('TODAS LAS SUBCATEGORIAS: ', respuesta);

        // // Filtrar las subcategorías excluyendo aquellas donde
        // const subCategoriasFiltradas = respuesta.filter(
        //   (subcategoria: any) => subcategoria.membresia != "1"
        // );

        const subCategoriasU = new Set(
          respuesta.productos.map(
            (subCategoria: any) => subCategoria.nombreProducto
          )
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
    this.categoriaService.obtenerMarcas2().subscribe({
      next: (respuesta) => {
        // console.log('TODAS LAS MARCAS: ', respuesta);


        // Filtrar las marcas excluyendo aquellas donde
        const marcasFiltradas = respuesta.filter(
          (marca: any) => marca.servicio != "1"
        );

        console.log('TODAS LAS MARCAS FILTRADAS: ', respuesta);


        const marcasU = new Set(
          marcasFiltradas.map((marca: any) => marca.marca)
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

  vercodigoBarras() {
    const codigo = this.form.get("codigoBarra")?.value;
    console.log('codigoBarra: ', codigo);
    this.productoService
      .verProductoCodigoBarras2(codigo)
      .subscribe((respuesta: any) => {
        console.log('respuesta: ', respuesta);
        if (respuesta.success == 0) {
        } else {
          this.form.setValue({
            codigoBarra: respuesta[0]["codigoBarras"],
            nomsubcate: respuesta[0]["subCategoria"],
            nombreCategoriaP: respuesta[0]["categoria"],
            descripcion: respuesta[0]["nombreProducto"],
            detalleCompra: respuesta[0]["detalleCompra"],
            marcaP: respuesta[0]["marca"],
            precioCompra: respuesta[0]["precioCompra"],
            // detalleUnidadMedida: respuesta[0]["detalleUnidadMedida"],
            // precioCaja: respuesta[0]["precioCaja"],
            activo: respuesta[0]["activo"],
            // ItemNumber: respuesta[0]["ItemNumber"],
            // ieps: respuesta[0]["ieps"],
            // iva: respuesta[0]["iva"],
            // sat: respuesta[0]["sat"],
            // factura: respuesta[0]["factura"],
            // STYLE_ITEM_ID: respuesta[0]["STYLE_ITEM_ID"],
            cantidadMayoreo: respuesta[0]["cantidadMayoreo"],
          });
        }
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
      const codigo = this.form.get("codigoBarra")?.value;
      console.log('Formulario:', this.form.value);  // Verifica que los valores estén bien
      this.productoService
        .verProductoCodigoBarras2(codigo)
        .subscribe((respuesta: any) => {
          console.log('verCodigoBarras: ', respuesta);

          if (respuesta.success == 0) {
            console.log('CODIGO BARRAS NO EXISTE');

            this.categoriaService
              .obtenerCategoriaPorNombre2(this.form.value.nombreCategoriaP)
              .subscribe((categoriaExistente) => {
                console.log('CATEGORIA: ', categoriaExistente);
                console.log('CATEGORIA ECISTENTE?: ', categoriaExistente.success);
                if (categoriaExistente.success == 1) {
                  ///********** Verifica si la subcategoria ya existe */
                  this.categoriaService
                    .obtenerSubCategoriaPorNombre2(
                      this.form.value.nomsubcate,
                      categoriaExistente.categoria.id_categoria
                    )
                    .subscribe((subCategoriaExistente) => {
                      console.log("SUBCATEGORIA EXISTENTE: ", subCategoriaExistente);
                      if (subCategoriaExistente.success == 1) {
                        ///********** Verifica si la marca ya existe */
                        this.categoriaService
                          .obtenerMarcaPorNombre2(this.form.value.marcaP)
                          .subscribe((marcaExistente) => {
                            console.log('MARCA EXISTENTE: ', marcaExistente);

                            if (marcaExistente.success == 1) {
                              const formularioP = {
                                idProducto:
                                  subCategoriaExistente.producto.id_producto,
                                // detalleUnidadMedida: "pza",
                                precioCompra: this.form.value.precioCompra,
                                detalleCompra: this.form.value.detalleCompra,
                                id_marcaV:
                                  marcaExistente.marca.id_marcas,
                                descripcion: this.form.value.descripcion,
                                codigoBarra: this.form.value.codigoBarra,
                                // ItemNumber: this.form.value.ItemNumber,
                                activo: this.form.value.activo,
                                // sat: this.form.value.sat,
                                // ieps: this.form.value.ieps,
                                // iva: this.form.value.iva,
                                // factura: this.form.value.factura,
                                // STYLE_ITEM_ID: this.form.value.STYLE_ITEM_ID,
                                // precioCaja: this.form.value.precioCaja,
                                cantidadMayoreo:this.form.value.cantidadMayoreo,
                                //idUsuario: this.auth.idUser.getValue(),
                              };
                              console.log('Form enviado: ', formularioP);


                              this.productoService
                                .creaProductoMemb(formularioP)
                                .subscribe({
                                  next: (respuesta) => {
                                    console.log('Respuesta: ', respuesta);

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
                              console.log('NO EXISTE LA MARCA');
                              const formMarca = {
                                marcaP: this.form.value.marcaP,
                                idGimnasio: 0,
                                servicio: 0
                              };
                              console.log('VALOR DE LA NUEVA MARCA: ',formMarca);
                              this.categoriaService
                                .agregarMarca2(formMarca)
                                .subscribe((respuestaMarca) => {
                                  console.log('NUEVA MARCA AGREGADA: ', respuestaMarca);
                                  console.log('ID DE LA NUEVA MARCA: ', respuestaMarca.data.id_marcas);
                                  const formularioP = {
                                    idProducto:
                                      subCategoriaExistente.producto
                                        .id_producto,
                                    // detalleUnidadMedida: "pza",
                                    precioCompra: this.form.value.precioCompra,
                                    detalleCompra:
                                      this.form.value.detalleCompra,
                                    id_marcaV: respuestaMarca.data.id_marcas,
                                    descripcion: this.form.value.descripcion,
                                    codigoBarra: this.form.value.codigoBarra,
                                    // ItemNumber: this.form.value.ItemNumber,
                                    activo: this.form.value.activo,
                                    // sat: this.form.value.sat,
                                    // ieps: this.form.value.ieps,
                                    // iva: this.form.value.iva,
                                    // factura: this.form.value.factura,
                                    // STYLE_ITEM_ID:
                                    //   this.form.value.STYLE_ITEM_ID,
                                    // precioCaja: this.form.value.precioCaja,
                                    cantidadMayoreo:
                                      this.form.value.cantidadMayoreo,
                                      //idUsuario: this.auth.idUser.getValue(),
                                  };

                                  console.log('Form enviado: ', formularioP);


                                  this.productoService
                                    .creaProductoMemb(formularioP)
                                    .subscribe({
                                      next: (respuesta) => {
                                        console.log('Respuesta: ', respuesta);

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
                        console.log('No existe la subcategoria');

                        const formSub = {
                          idcatte: categoriaExistente.categoria.id_categoria,
                          nomsubcate: this.form.value.nomsubcate,
                          duracion: 0,
                          membresia: 0
                        };
                        console.log('Datos a enviar de la sub: ', formSub);
                        this.categoriaService
                          .agregarSubCategoria2(formSub)
                          .subscribe((respuestaSub) => {
                            console.log('NUEVA SUBCATEGORIA AGREGADA: ', respuestaSub);

                            ///********** Verifica si la marca ya existe */
                            this.categoriaService
                              .obtenerMarcaPorNombre2(this.form.value.marcaP)
                              .subscribe((marcaExistente) => {
                                console.log('Marca existente: ', marcaExistente);

                                if (marcaExistente.success == 1) {
                                  this.spinner.hide();
                                  //agregar producto

                                  const formularioP = {
                                    idProducto: respuestaSub.id_producto,
                                    // detalleUnidadMedida: "pza",
                                    precioCompra: this.form.value.precioCompra,
                                    detalleCompra:
                                      this.form.value.detalleCompra,
                                    id_marcaV:
                                      marcaExistente.marca.id_marcas,
                                    descripcion: this.form.value.descripcion,
                                    codigoBarra: this.form.value.codigoBarra,
                                    // ItemNumber: this.form.value.ItemNumber,
                                    activo: this.form.value.activo,
                                    // sat: this.form.value.sat,
                                    // ieps: this.form.value.ieps,
                                    // iva: this.form.value.iva,
                                    // factura: this.form.value.factura,
                                    // STYLE_ITEM_ID:
                                    //   this.form.value.STYLE_ITEM_ID,
                                    // precioCaja: this.form.value.precioCaja,
                                    cantidadMayoreo:
                                      this.form.value.cantidadMayoreo,
                                      //idUsuario: this.auth.idUser.getValue(),
                                  };
                                  console.log('form enviado: ', formularioP);


                                  this.productoService
                                    .creaProductoMemb(formularioP)
                                    .subscribe({
                                      next: (respuesta) => {
                                        console.log('respuesta: ', respuesta);

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
                                            positionClass: "toast-bottom-left",
                                          }
                                        );
                                      },
                                    });
                                } else {
                                  console.log('NO EXISTE LA MARCA');

                                  const formMarca = {
                                    marcaP: this.form.value.marcaP,
                                    idGimnasio: 0,
                                    servicio: 0
                                  };
                                  console.log('VALOR DE LA NUEVA MARCA: ',formMarca);

                                  this.categoriaService
                                    .agregarMarca2(formMarca)
                                    .subscribe((respuestaMarca) => {
                                      console.log('NUEVA MARCA AGREGADA: ', respuestaMarca);
                                      console.log('ID DE LA NUEVA MARCA: ', respuestaMarca.data.id_marcas);
                                      const formularioP = {
                                        idProducto: respuestaSub.id_producto,
                                        // detalleUnidadMedida: "pza",
                                        precioCompra:
                                          this.form.value.precioCompra,
                                        detalleCompra:
                                          this.form.value.detalleCompra,
                                        id_marcaV: respuestaMarca.data.id_marcas,
                                        descripcion:
                                          this.form.value.descripcion,
                                        codigoBarra:
                                          this.form.value.codigoBarra,
                                        // ItemNumber: this.form.value.ItemNumber,
                                        activo: this.form.value.activo,
                                        // sat: this.form.value.sat,
                                        // ieps: this.form.value.ieps,
                                        // iva: this.form.value.iva,
                                        // factura: this.form.value.factura,
                                        // STYLE_ITEM_ID:
                                        //   this.form.value.STYLE_ITEM_ID,
                                        // precioCaja: this.form.value.precioCaja,
                                        cantidadMayoreo:
                                          this.form.value.cantidadMayoreo,
                                          //idUsuario: this.auth.idUser.getValue(),
                                      };
                                      console.log('form enviado: ', formularioP);


                                      this.productoService
                                        .creaProductoMemb(formularioP)
                                        .subscribe({
                                          next: (respuesta) => {
                                            console.log('respuesta: ', respuesta);

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
                                                      // Puedes agregar lógica adicional aquí si es necesario
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
                } else {
                  console.log("La categoría no existe, creando nueva...");
                  // Si la categoría no existe, se agrega
                  this.categoriaService
                    .agregarCategoria2(this.form.value)
                    .subscribe((respuesta) => {
                      // nombreCategoriaP
                      console.log('valor de la subcategoria: ', respuesta);


                      if (respuesta.success === 1) {
                      console.log('TODO EL FORMULARIO: ', this.form.value);
                      console.log('Nombre de la nueva categoria: ', this.form.value.nombreCategoriaP)
                      console.log('Categoría agregada:', respuesta);  // Verifica la respuesta
                      ///********** Verifica si la subcategoria ya existe */
                      this.categoriaService
                        .obtenerSubCategoriaPorNombre2(
                          this.form.value.nomsubcate,
                          respuesta.id_categoria
                        )

                        .subscribe((subCategoriaExistente) => {
                          console.log('subcategoria existente: ', subCategoriaExistente);

                          if (subCategoriaExistente.success == 1) {
                            this.categoriaService
                              .obtenerMarcaPorNombre2(this.form.value.marcaP)
                              .subscribe((marcaExistente) => {
                                console.log('marca: ', marcaExistente);

                                if (marcaExistente.success == 1) {
                                  //agregar producto

                                  const formularioP = {
                                    idProducto:
                                      subCategoriaExistente.producto
                                        .id_producto,
                                    // detalleUnidadMedida: "pza",
                                    precioCompra: this.form.value.precioCompra,
                                    detalleCompra:
                                      this.form.value.detalleCompra,
                                    id_marcaV:
                                      marcaExistente.marca.id_marcas,
                                    descripcion: this.form.value.descripcion,
                                    codigoBarra: this.form.value.codigoBarra,
                                    // ItemNumber: this.form.value.ItemNumber,
                                    activo: this.form.value.activo,
                                    // sat: this.form.value.sat,
                                    // ieps: this.form.value.ieps,
                                    // iva: this.form.value.iva,
                                    // factura: this.form.value.factura,
                                    // STYLE_ITEM_ID:
                                    //   this.form.value.STYLE_ITEM_ID,
                                    // precioCaja: this.form.value.precioCaja,
                                    cantidadMayoreo:
                                      this.form.value.cantidadMayoreo,
                                      //idUsuario: this.auth.idUser.getValue(),
                                  };
                                  console.log('Form enviado: ', formularioP);


                                  this.productoService
                                    .creaProductoMemb(formularioP)
                                    .subscribe({
                                      next: (respuesta) => {
                                        console.log('Respuesta: ', respuesta);

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
                                            positionClass: "toast-bottom-left",
                                          }
                                        );
                                      },
                                    });
                                } else {
                                  console.log('NO EXISTE LA MARCA');

                                  const formMarca = {
                                    marcaP: this.form.value.marcaP,
                                    idGimnasio: 0,
                                    servicio: 0
                                  };
                                  console.log('VALOR DE LA NUEVA MARCA: ',formMarca);

                                  this.categoriaService
                                    .agregarMarca2(formMarca)
                                    .subscribe((respuestaMarca) => {
                                      console.log('NUEVA MARCA AGREGADA: ', respuestaMarca);
                                  console.log('ID DE LA NUEVA MARCA: ', respuestaMarca.data.id_marcas);
                                      const formularioP = {
                                        idProducto:
                                          subCategoriaExistente.producto
                                            .id_producto,
                                        // detalleUnidadMedida: "pza",
                                        precioCompra:
                                          this.form.value.precioCompra,
                                        detalleCompra:
                                          this.form.value.detalleCompra,
                                        id_marcaV: respuestaMarca.data.id_marcas,
                                        descripcion:
                                          this.form.value.descripcion,
                                        codigoBarra:
                                          this.form.value.codigoBarra,
                                        // ItemNumber: this.form.value.ItemNumber,
                                        activo: this.form.value.activo,
                                        // sat: this.form.value.sat,
                                        // ieps: this.form.value.ieps,
                                        // iva: this.form.value.iva,
                                        // factura: this.form.value.factura,
                                        // STYLE_ITEM_ID:
                                        //   this.form.value.STYLE_ITEM_ID,
                                        // precioCaja: this.form.value.precioCaja,
                                        cantidadMayoreo:
                                          this.form.value.cantidadMayoreo,
                                          //idUsuario: this.auth.idUser.getValue(),
                                      };
                                      console.log('Form enviado: ', formularioP);


                                      this.productoService
                                        .creaProductoMemb(formularioP)
                                        .subscribe({
                                          next: (respuesta) => {
                                            console.log('Respuesta: ', respuesta);

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
                          } else {
                            console.log('NO EXISTE LA subcategoria');
                            // Si la subcategoría no existe, agregarla
                            const formSub = {
                              idcatte: respuesta.id_categoria,
                              nomsubcate: this.form.value.nomsubcate,
                              duracion: 0,
                              membresia: 0
                            };
                            console.log('valor de la nueva subcategoria: ', formSub);


                            this.categoriaService
                              .agregarSubCategoria2(formSub)
                              .subscribe((respuestaSub) => {
                                console.log('no existe categoriaExistente, creando: ', respuestaSub);

                                ///********** Verifica si la marca ya existe */
                                this.categoriaService
                                  .obtenerMarcaPorNombre2(this.form.value.marcaP)
                                  .subscribe((marcaExistente) => {
                                    console.log('MARCA EXISTENTE: ', marcaExistente);

                                    if (marcaExistente.success == 1) {
                                      const formularioP = {
                                        idProducto: respuestaSub.id_producto,
                                        // detalleUnidadMedida: "pza",
                                        precioCompra:
                                          this.form.value.precioCompra,
                                        detalleCompra:
                                          this.form.value.detalleCompra,
                                        id_marcaV:
                                          marcaExistente.marca
                                            .id_marcas,
                                        descripcion:
                                          this.form.value.descripcion,
                                        codigoBarra:
                                          this.form.value.codigoBarra,
                                        // ItemNumber: this.form.value.ItemNumber,
                                        activo: this.form.value.activo,
                                        // sat: this.form.value.sat,
                                        // ieps: this.form.value.ieps,
                                        // iva: this.form.value.iva,
                                        // factura: this.form.value.factura,
                                        // STYLE_ITEM_ID:
                                        //   this.form.value.STYLE_ITEM_ID,
                                        // precioCaja: this.form.value.precioCaja,
                                        cantidadMayoreo:
                                          this.form.value.cantidadMayoreo,
                                          //idUsuario: this.auth.idUser.getValue(),
                                      };
                                      console.log('Form enviado: ', formularioP);

                                      this.productoService
                                        .creaProductoMemb(formularioP)
                                        .subscribe({
                                          next: (respuesta) => {
                                            console.log('Respuesta: ', respuesta);

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
                                    } else {
                                      console.log('NO EXISTE LA MARCA');

                                      const formMarca = {
                                        marcaP: this.form.value.marcaP,
                                        idGimnasio: 0,
                                        servicio: 0
                                      };
                                      console.log('VALOR DE LA NUEVA MARCA: ',formMarca);

                                      this.categoriaService
                                        .agregarMarca2(formMarca)
                                        .subscribe((respuestaMarca) => {
                                          console.log('NUEVA MARCA AGREGADA: ', respuestaMarca);
                                  console.log('ID DE LA NUEVA MARCA: ', respuestaMarca.data.id_marcas);

                                          const formularioP = {
                                            idProducto:
                                              respuestaSub.id_producto,
                                            // detalleUnidadMedida: "pza",
                                            precioCompra:
                                              this.form.value.precioCompra,
                                            detalleCompra:
                                              this.form.value.detalleCompra,
                                            id_marcaV: respuestaMarca.data.id_marcas,
                                            descripcion:
                                              this.form.value.descripcion,
                                            codigoBarra:
                                              this.form.value.codigoBarra,
                                            // ItemNumber:
                                            //   this.form.value.ItemNumber,
                                            activo: this.form.value.activo,
                                            // sat: this.form.value.sat,
                                            // ieps: this.form.value.ieps,
                                            // iva: this.form.value.iva,
                                            // factura: this.form.value.factura,
                                            // STYLE_ITEM_ID:
                                            //   this.form.value.STYLE_ITEM_ID,
                                            // precioCaja:
                                            //   this.form.value.precioCaja,
                                            cantidadMayoreo:
                                              this.form.value.cantidadMayoreo,
                                              //idUsuario: this.auth.idUser.getValue(),
                                          };
                                          console.log('Form enviado: ', formularioP);


                                          this.productoService
                                            .creaProductoMemb(formularioP)
                                            .subscribe({
                                              next: (respuesta) => {
                                                console.log('Respuesta: ', respuesta);

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
                                                      (
                                                        cerrarDialogo: Boolean
                                                      ) => {
                                                        if (cerrarDialogo) {
                                                          this.productoSubject.next();
                                                          this.dialogo.close(
                                                            true
                                                          );
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
                      } else {
                        console.log('Error al agregar la categoría:', respuesta.message);
                      }
                    });
                }
              });
          } else {
            console.log('Existe el codigo barras');

            this.form.get("nomsubcate")?.enable();
            this.categoriaService
              .obtenerCategoriaPorNombre2(this.form.value.nombreCategoriaP)
              .subscribe((categoriaExistente) => {
                if (categoriaExistente.success == 1) {
                  ///********** Verifica si la subcategoria ya existe */
                  this.categoriaService
                    .obtenerSubCategoriaPorNombre2(
                      this.form.value.nomsubcate,
                      categoriaExistente.categoria.id_categoria
                    )
                    .subscribe((subCategoriaExistente) => {
                      if (subCategoriaExistente.success == 1) {
                        ///********** Verifica si la marca ya existe */
                        this.categoriaService
                          .obtenerMarcaPorNombre2(this.form.value.marcaP)
                          .subscribe((marcaExistente) => {
                            if (marcaExistente.success == 1) {
                              const formularioP = {
                                idProducto:
                                  subCategoriaExistente.producto.id_producto,
                                // detalleUnidadMedida: "pza",
                                precioCompra: this.form.value.precioCompra,
                                detalleCompra: this.form.value.detalleCompra,
                                idMarcaProducto:
                                  marcaExistente.marca.id_marcas,
                                descripcion: this.form.value.descripcion,
                                codigoBarra: this.form.value.codigoBarra,
                                // ItemNumber: this.form.value.ItemNumber,
                                activo: this.form.value.activo,
                                // sat: this.form.value.sat,
                                // ieps: this.form.value.ieps,
                                // iva: this.form.value.iva,
                                // factura: this.form.value.factura,
                                // STYLE_ITEM_ID: this.form.value.STYLE_ITEM_ID,
                                // precioCaja: this.form.value.precioCaja,
                                cantidadMayoreo:
                                  this.form.value.cantidadMayoreo,
                                  //idUsuario: this.auth.idUser.getValue(),
                              };
                              this.productoService
                                .actualizarProducto2(formularioP)
                                .subscribe({
                                  next: (respuesta) => {
                                    if (respuesta.success) {
                                      this.spinner.hide();
                                      this.dialog
                                        .open(MensajeEmergentesComponent, {
                                          data: `Producto actualizado exitosamente`,
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
                                idGimnasio: 0,
                                servicio: 0
                              };
                              this.categoriaService
                                .agregarMarca2(formMarca)
                                .subscribe((respuestaMarca) => {
                                  const formularioP = {
                                    idProducto:
                                      subCategoriaExistente.producto
                                        .id_producto,
                                    // detalleUnidadMedida: "pza",
                                    precioCompra: this.form.value.precioCompra,
                                    detalleCompra:
                                      this.form.value.detalleCompra,
                                    idMarcaProducto: respuestaMarca.data.id_marcas,
                                    descripcion: this.form.value.descripcion,
                                    codigoBarra: this.form.value.codigoBarra,
                                    // ItemNumber: this.form.value.ItemNumber,
                                    activo: this.form.value.activo,
                                    // sat: this.form.value.sat,
                                    // ieps: this.form.value.ieps,
                                    // iva: this.form.value.iva,
                                    // factura: this.form.value.factura,
                                    // STYLE_ITEM_ID:
                                    //   this.form.value.STYLE_ITEM_ID,
                                    // precioCaja: this.form.value.precioCaja,
                                    cantidadMayoreo:
                                      this.form.value.cantidadMayoreo,
                                      //idUsuario: this.auth.idUser.getValue(),
                                  };

                                  this.productoService
                                    .actualizarProducto2(formularioP)
                                    .subscribe({
                                      next: (respuesta) => {
                                        if (respuesta.success) {
                                          this.spinner.hide();
                                          this.dialog
                                            .open(MensajeEmergentesComponent, {
                                              data: `Producto actualizado exitosamente`,
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
                          duracion: 0,
                          membresia: 0
                        };

                        this.categoriaService
                          .agregarSubCategoria2(formSub)
                          .subscribe((respuestaSub) => {
                            ///********** Verifica si la marca ya existe */
                            this.categoriaService
                              .obtenerMarcaPorNombre2(this.form.value.marcaP)
                              .subscribe((marcaExistente) => {
                                if (marcaExistente.success == 1) {
                                  this.spinner.hide();
                                  //agregar producto

                                  const formularioP = {
                                    idProducto: respuestaSub.id_producto,
                                    // detalleUnidadMedida: "pza",
                                    precioCompra: this.form.value.precioCompra,
                                    detalleCompra:
                                      this.form.value.detalleCompra,
                                    idMarcaProducto:
                                      marcaExistente.marca.id_marcas,
                                    descripcion: this.form.value.descripcion,
                                    codigoBarra: this.form.value.codigoBarra,
                                    // ItemNumber: this.form.value.ItemNumber,
                                    activo: this.form.value.activo,
                                    // sat: this.form.value.sat,
                                    // ieps: this.form.value.ieps,
                                    // iva: this.form.value.iva,
                                    // factura: this.form.value.factura,
                                    // STYLE_ITEM_ID:
                                    //   this.form.value.STYLE_ITEM_ID,
                                    // precioCaja: this.form.value.precioCaja,
                                    cantidadMayoreo:
                                      this.form.value.cantidadMayoreo,
                                      //idUsuario: this.auth.idUser.getValue(),
                                  };

                                  this.productoService
                                    .actualizarProducto2(formularioP)
                                    .subscribe({
                                      next: (respuesta) => {
                                        if (respuesta.success) {
                                          this.spinner.hide();
                                          this.dialog
                                            .open(MensajeEmergentesComponent, {
                                              data: `Producto actualizado exitosamente`,
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
                                            positionClass: "toast-bottom-left",
                                          }
                                        );
                                      },
                                    });
                                } else {
                                  const formMarca = {
                                    marcaP: this.form.value.marcaP,
                                    idGimnasio: 0,
                                    servicio: 0
                                  };
                                  this.categoriaService
                                    .agregarMarca2(formMarca)
                                    .subscribe((respuestaMarca) => {
                                      const formularioP = {
                                        idProducto: respuestaSub.id_producto,
                                        // detalleUnidadMedida: "pza",
                                        precioCompra:
                                          this.form.value.precioCompra,
                                        detalleCompra:
                                          this.form.value.detalleCompra,
                                        idMarcaProducto:
                                          respuestaMarca.data.id_marcas,
                                        descripcion:
                                          this.form.value.descripcion,
                                        codigoBarra:
                                          this.form.value.codigoBarra,
                                        // ItemNumber: this.form.value.ItemNumber,
                                        activo: this.form.value.activo,
                                        // sat: this.form.value.sat,
                                        // ieps: this.form.value.ieps,
                                        // iva: this.form.value.iva,
                                        // factura: this.form.value.factura,
                                        // STYLE_ITEM_ID:
                                        //   this.form.value.STYLE_ITEM_ID,
                                        // precioCaja: this.form.value.precioCaja,
                                        cantidadMayoreo:
                                          this.form.value.cantidadMayoreo,
                                          //idUsuario: this.auth.idUser.getValue(),
                                      };

                                      this.productoService
                                        .actualizarProducto2(formularioP)
                                        .subscribe({
                                          next: (respuesta) => {
                                            if (respuesta.success) {
                                              this.spinner.hide();
                                              this.dialog
                                                .open(
                                                  MensajeEmergentesComponent,
                                                  {
                                                    data: `Producto actualizado exitosamente`,
                                                  }
                                                )
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
                } else {
                  // Si la categoría no existe, se agrega
                  this.categoriaService
                    .agregarCategoria2(this.form.value)
                    .subscribe((respuesta) => {
                      if (respuesta.success === 1) {

                      ///********** Verifica si la subcategoria ya existe */
                      this.categoriaService
                        .obtenerSubCategoriaPorNombre2(
                          this.form.value.nomsubcate,
                          respuesta.id_categoria
                        )
                        .subscribe((subCategoriaExistente) => {
                          if (subCategoriaExistente.success == 1) {
                            this.categoriaService
                              .obtenerMarcaPorNombre2(this.form.value.marcaP)
                              .subscribe((marcaExistente) => {
                                if (marcaExistente.success == 1) {
                                  //agregar producto

                                  const formularioP = {
                                    idProducto:
                                      subCategoriaExistente.producto
                                        .id_producto,
                                    // detalleUnidadMedida: "pza",
                                    precioCompra: this.form.value.precioCompra,
                                    detalleCompra:
                                      this.form.value.detalleCompra,
                                    idMarcaProducto:
                                      marcaExistente.marca.id_marcas,
                                    descripcion: this.form.value.descripcion,
                                    codigoBarra: this.form.value.codigoBarra,
                                    // ItemNumber: this.form.value.ItemNumber,
                                    activo: this.form.value.activo,
                                    // sat: this.form.value.sat,
                                    // ieps: this.form.value.ieps,
                                    // iva: this.form.value.iva,
                                    // factura: this.form.value.factura,
                                    // STYLE_ITEM_ID:
                                    //   this.form.value.STYLE_ITEM_ID,
                                    // precioCaja: this.form.value.precioCaja,
                                    cantidadMayoreo:
                                      this.form.value.cantidadMayoreo,
                                      //idUsuario: this.auth.idUser.getValue(),
                                  };

                                  this.productoService
                                    .actualizarProducto2(formularioP)
                                    .subscribe({
                                      next: (respuesta) => {
                                        if (respuesta.success) {
                                          this.spinner.hide();
                                          this.dialog
                                            .open(MensajeEmergentesComponent, {
                                              data: `Producto actualizado exitosamente`,
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
                                            positionClass: "toast-bottom-left",
                                          }
                                        );
                                      },
                                    });
                                } else {
                                  const formMarca = {
                                    marcaP: this.form.value.marcaP,
                                    idGimnasio: 0,
                                    servicio: 0
                                  };
                                  this.categoriaService
                                    .agregarMarca2(formMarca)
                                    .subscribe((respuestaMarca) => {
                                      const formularioP = {
                                        idProducto:
                                          subCategoriaExistente.producto
                                            .id_producto,
                                        // detalleUnidadMedida: "pza",
                                        precioCompra:
                                          this.form.value.precioCompra,
                                        detalleCompra:
                                          this.form.value.detalleCompra,
                                        idMarcaProducto:
                                          respuestaMarca.data.id_marcas,
                                        descripcion:
                                          this.form.value.descripcion,
                                        codigoBarra:
                                          this.form.value.codigoBarra,
                                        // ItemNumber: this.form.value.ItemNumber,
                                        activo: this.form.value.activo,
                                        // sat: this.form.value.sat,
                                        // ieps: this.form.value.ieps,
                                        // iva: this.form.value.iva,
                                        // factura: this.form.value.factura,
                                        // STYLE_ITEM_ID:
                                        //   this.form.value.STYLE_ITEM_ID,
                                        // precioCaja: this.form.value.precioCaja,
                                        cantidadMayoreo:
                                          this.form.value.cantidadMayoreo,
                                          //idUsuario: this.auth.idUser.getValue(),
                                      };

                                      this.productoService
                                        .actualizarProducto2(formularioP)
                                        .subscribe({
                                          next: (respuesta) => {
                                            if (respuesta.success) {
                                              this.spinner.hide();
                                              this.dialog
                                                .open(
                                                  MensajeEmergentesComponent,
                                                  {
                                                    data: `Producto actualizado exitosamente`,
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
                          } else {
                            // Si la subcategoría no existe, agregarla
                            const formSub = {
                              idcatte: respuesta.id_categoria,
                              nomsubcate: this.form.value.nomsubcate,
                              duracion: 0,
                              membresia: 0
                            };

                            this.categoriaService
                              .agregarSubCategoria2(formSub)
                              .subscribe((respuestaSub) => {
                                ///********** Verifica si la marca ya existe */
                                this.categoriaService
                                  .obtenerMarcaPorNombre2(this.form.value.marcaP)
                                  .subscribe((marcaExistente) => {
                                    if (marcaExistente.success == 1) {
                                      const formularioP = {
                                        idProducto: respuestaSub.id_producto,
                                        // detalleUnidadMedida: "pza",
                                        precioCompra:
                                          this.form.value.precioCompra,
                                        detalleCompra:
                                          this.form.value.detalleCompra,
                                        idMarcaProducto:
                                          marcaExistente.marca
                                            .id_marcas,
                                        descripcion:
                                          this.form.value.descripcion,
                                        codigoBarra:
                                          this.form.value.codigoBarra,
                                        // ItemNumber: this.form.value.ItemNumber,
                                        activo: this.form.value.activo,
                                        // sat: this.form.value.sat,
                                        // ieps: this.form.value.ieps,
                                        // iva: this.form.value.iva,
                                        // factura: this.form.value.factura,
                                        // STYLE_ITEM_ID:
                                        //   this.form.value.STYLE_ITEM_ID,
                                        // precioCaja: this.form.value.precioCaja,
                                        cantidadMayoreo:
                                          this.form.value.cantidadMayoreo,
                                         // idUsuario: this.auth.idUser.getValue(),
                                      };
                                      this.productoService
                                        .actualizarProducto2(formularioP)
                                        .subscribe({
                                          next: (respuesta) => {
                                            if (respuesta.success) {
                                              this.spinner.hide();
                                              this.dialog
                                                .open(
                                                  MensajeEmergentesComponent,
                                                  {
                                                    data: `Producto actualizado exitosamente`,
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
                                    } else {
                                      const formMarca = {
                                        marcaP: this.form.value.marcaP,
                                        idGimnasio: 0,
                                        servicio: 0
                                      };
                                      this.categoriaService
                                        .agregarMarca2(formMarca)
                                        .subscribe((respuestaMarca) => {
                                          const formularioP = {
                                            idProducto:
                                              respuestaSub.id_producto,
                                            // detalleUnidadMedida: "pza",
                                            precioCompra:
                                              this.form.value.precioCompra,
                                            detalleCompra:
                                              this.form.value.detalleCompra,
                                            idMarcaProducto:
                                              respuestaMarca.data.id_marcas,
                                            descripcion:
                                              this.form.value.descripcion,
                                            codigoBarra:
                                              this.form.value.codigoBarra,
                                            // ItemNumber:
                                            //   this.form.value.ItemNumber,
                                            activo: this.form.value.activo,
                                            // sat: this.form.value.sat,
                                            // ieps: this.form.value.ieps,
                                            // iva: this.form.value.iva,
                                            // factura: this.form.value.factura,
                                            // STYLE_ITEM_ID:
                                            //   this.form.value.STYLE_ITEM_ID,
                                            // precioCaja:
                                            //   this.form.value.precioCaja,
                                            cantidadMayoreo:
                                              this.form.value.cantidadMayoreo,
                                              //idUsuario: this.auth.idUser.getValue(),
                                          };

                                          this.productoService
                                            .actualizarProducto2(formularioP)
                                            .subscribe({
                                              next: (respuesta) => {
                                                if (respuesta.success) {
                                                  this.spinner.hide();
                                                  this.dialog
                                                    .open(
                                                      MensajeEmergentesComponent,
                                                      {
                                                        data: `Producto actualizado exitosamente`,
                                                      }
                                                    )
                                                    .afterClosed()
                                                    .subscribe(
                                                      (
                                                        cerrarDialogo: Boolean
                                                      ) => {
                                                        if (cerrarDialogo) {
                                                          this.productoSubject.next();
                                                          this.dialogo.close(
                                                            true
                                                          );
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
                      } else {
                        console.log('Error al agregar la categoría:', respuesta.message);
                      }
                    });
                }
              });
          }
        });
    } else {
      this.message = "Por favor, complete todos los campos requeridos.";
      this.marcarCamposInvalidos(this.form);
    }
  }

  registrarP() {
    if (this.form.valid) {
      this.spinner.show();
    const codigo = this.form.get("codigoBarra")?.value;
    this.productoService
      .verProductoCodigoBarras2(codigo)
      .subscribe((respuesta: any) => {
        if (respuesta.success == 0) {
          this.categoriaService
          .obtenerCategoriaPorNombre2(this.form.value.nombreCategoriaP)
          .subscribe((categoriaExistente) => {
            if (categoriaExistente.success == 1) {
              ///********** Verifica si la subcategoria ya existe */
              this.categoriaService
                .obtenerSubCategoriaPorNombre2(
                  this.form.value.nomsubcate,
                  categoriaExistente.categoria.id_categoria
                )
                .subscribe((subCategoriaExistente) => {
                  if (subCategoriaExistente.success == 1) {
                    ///********** Verifica si la marca ya existe */
                    this.categoriaService
                      .obtenerMarcaPorNombre2(this.form.value.marcaP)
                      .subscribe((marcaExistente) => {
                        if (marcaExistente.success == 1) {
                          const formularioP = {
                            idProducto:
                              subCategoriaExistente.producto.id_producto,
                            detalleUnidadMedida: "pza",
                            precioCompra: this.form.value.precioCompra,
                            detalleCompra: this.form.value.detalleCompra,
                            id_marcaV: marcaExistente.marca.id_marcas,
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
                            //idUsuario: this.auth.idUser.getValue(),
                          };

                          this.productoService
                            .creaProductoMemb(formularioP)
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
                            idGimnasio: 0,
                            servicio: 0
                          };
                          this.categoriaService
                            .agregarMarca2(formMarca)
                            .subscribe((respuestaMarca) => {
                              const formularioP = {
                                idProducto:
                                  subCategoriaExistente.producto.id_producto,
                                detalleUnidadMedida: "pza",
                                precioCompra: this.form.value.precioCompra,
                                detalleCompra: this.form.value.detalleCompra,
                                id_marcaV: respuestaMarca.data.id_marcas,
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
                                //idUsuario: this.auth.idUser.getValue(),
                              };

                              this.productoService
                                .creaProductoMemb(formularioP)
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
                      .agregarSubCategoria2(formSub)
                      .subscribe((respuestaSub) => {
                        ///********** Verifica si la marca ya existe */
                        this.categoriaService
                          .obtenerMarcaPorNombre2(this.form.value.marcaP)
                          .subscribe((marcaExistente) => {
                            if (marcaExistente.success == 1) {
                              this.spinner.hide();
                              //agregar producto

                              const formularioP = {
                                idProducto: respuestaSub.id_producto,
                                detalleUnidadMedida: "pza",
                                precioCompra: this.form.value.precioCompra,
                                detalleCompra: this.form.value.detalleCompra,
                                id_marcaV:
                                  marcaExistente.marca.id_marcas,
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
                                //idUsuario: this.auth.idUser.getValue(),
                              };

                              this.productoService
                                .creaProductoMemb(formularioP)
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
                                idGimnasio: 0,
                                servicio: 0
                              };
                              this.categoriaService
                                .agregarMarca2(formMarca)
                                .subscribe((respuestaMarca) => {
                                  const formularioP = {
                                    idProducto: respuestaSub.id_producto,
                                    detalleUnidadMedida: "pza",
                                    precioCompra: this.form.value.precioCompra,
                                    detalleCompra: this.form.value.detalleCompra,
                                    id_marcaV: respuestaMarca.data.id_marcas,
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
                                      //idUsuario: this.auth.idUser.getValue(),
                                  };

                                  this.productoService
                                    .creaProductoMemb(formularioP)
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
                .agregarCategoria2(this.form.value)
                .subscribe((respuesta) => {
                  if (respuesta.success === 1) {

                  ///********** Verifica si la subcategoria ya existe */
                  this.categoriaService
                    .obtenerSubCategoriaPorNombre2(
                      this.form.value.nomsubcate,
                      respuesta.id_categoria
                    )
                    .subscribe((subCategoriaExistente) => {
                      if (subCategoriaExistente.success == 1) {
                        this.categoriaService
                          .obtenerMarcaPorNombre2(this.form.value.marcaP)
                          .subscribe((marcaExistente) => {
                            if (marcaExistente.success == 1) {
                              //agregar producto

                              const formularioP = {
                                idProducto:
                                  subCategoriaExistente.producto.id_producto,
                                detalleUnidadMedida: "pza",
                                precioCompra: this.form.value.precioCompra,
                                detalleCompra: this.form.value.detalleCompra,
                                id_marcaV:
                                  marcaExistente.marca.id_marcas,
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
                                //idUsuario: this.auth.idUser.getValue(),
                              };

                              this.productoService
                                .creaProductoMemb(formularioP)
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
                                idGimnasio: 0,
                                servicio: 0
                              };
                              this.categoriaService
                                .agregarMarca2(formMarca)
                                .subscribe((respuestaMarca) => {
                                  const formularioP = {
                                    idProducto:
                                      subCategoriaExistente.producto.id_producto,
                                    detalleUnidadMedida: "pza",
                                    precioCompra: this.form.value.precioCompra,
                                    detalleCompra: this.form.value.detalleCompra,
                                    id_marcaV: respuestaMarca.data.id_marcas,
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
                                      //idUsuario: this.auth.idUser.getValue(),
                                  };

                                  this.productoService
                                    .creaProductoMemb(formularioP)
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
                          .agregarSubCategoria2(formSub)
                          .subscribe((respuestaSub) => {
                            ///********** Verifica si la marca ya existe */
                            this.categoriaService
                              .obtenerMarcaPorNombre2(this.form.value.marcaP)
                              .subscribe((marcaExistente) => {
                                if (marcaExistente.success == 1) {
                                  const formularioP = {
                                    idProducto: respuestaSub.id_producto,
                                    detalleUnidadMedida: "pza",
                                    precioCompra: this.form.value.precioCompra,
                                    detalleCompra: this.form.value.detalleCompra,
                                    id_marcaV:
                                      marcaExistente.marca.id_marcas,
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
                                      //idUsuario: this.auth.idUser.getValue(),
                                  };
                                  this.productoService
                                    .creaProductoMemb(formularioP)
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
                                    idGimnasio: 0,
                                    servicio: 0
                                  };
                                  this.categoriaService
                                    .agregarMarca2(formMarca)
                                    .subscribe((respuestaMarca) => {
                                      const formularioP = {
                                        idProducto: respuestaSub.id_producto,
                                        detalleUnidadMedida: "pza",
                                        precioCompra:
                                          this.form.value.precioCompra,
                                        detalleCompra:
                                          this.form.value.detalleCompra,
                                        id_marcaV: respuestaMarca.data.id_marcas,
                                        descripcion: this.form.value.descripcion,
                                        codigoBarra: this.form.value.codigoBarra,
                                        ItemNumber: this.form.value.ItemNumber,
                                        activo: this.form.value.activo,
                                        sat: this.form.value.sat,
                                        ieps: this.form.value.ieps,
                                        iva: this.form.value.iva,
                                        factura: this.form.value.factura,
                                        STYLE_ITEM_ID:
                                          this.form.value.STYLE_ITEM_ID,
                                        precioCaja: this.form.value.precioCaja,
                                        cantidadMayoreo:
                                          this.form.value.cantidadMayoreo,
                                          //idUsuario: this.auth.idUser.getValue(),
                                      };

                                      this.productoService
                                        .creaProductoMemb(formularioP)
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
                  } else {
                    console.log('Error al agregar la categoría:', respuesta.message);
                  }
                });
            }
          });
      }else{
        this.toastr.error('El codigo de barras ya existe.', 'Error', {
          positionClass: 'toast-bottom-left',
        });
        this.spinner.hide();
      }
      });

    } else {
      this.message = "Por favor, complete todos los campos requeridos.";
      this.marcarCamposInvalidos(this.form);
    }
  }
}
