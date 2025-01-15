import { ChangeDetectionStrategy, Component, OnInit, Inject } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from "@angular/forms";
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
import { EntradasService } from "../../service/entradas.service";

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
  selector: 'app-agregar-producto-membresia',
  templateUrl: './agregar-producto-membresia.component.html',
  styleUrls: ['./agregar-producto-membresia.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe, MessageService],
})
export class AgregarProductoMembresiaComponent implements OnInit {
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

  idProbob: string = '';
  preciosucu: string = '';
  // botonDeshabilitado: boolean = false;

  esServicio: boolean = false;


  constructor(
    public dialogo: MatDialogRef<AgregarProductoMembresiaComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private auth: AuthService,
    private productoService: ProductoService,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private entradas: EntradasService
  ) {
    this.fechaCreacion = this.obtenerFechaActual();
    this.form = this.fb.group({
      detalleUnidadMedida: ["pza"],
      precioCompra: [0],
      detalleCompra: [0],
      marcaP: ["", Validators.required],
      activo: [1],
      ItemNumber: [0],
      codigoBarra: [""],
      ieps: [0],
      iva: [0],
      sat: [0],
      nombreCategoriaP: ["", Validators.required],
      nomsubcate: [{ value: "", disabled: true }, Validators.required],
      factura: [0],
      STYLE_ITEM_ID: ["0"],
      precioCaja: ["0"],
      cantidadMayoreo: ["0"],
      descripcion: ["", Validators.required],
      precciosucu: ["", Validators.required],
      duracion: ["", Validators.required]
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

    // Configura el valor inicial del formulario
    this.form.get('nombreCategoriaP')?.setValue('Servicios');

    // Obtener dinámicamente el ID de la categoría "Servicios"
    this.categoriaService.obtenerCategoria2().subscribe({
      next: (respuesta) => {
        // Busca la categoría con el nombre "Servicios"
        const categoriaServicios = respuesta.find(
          (categoria: any) => categoria.nombreCategoria === 'Servicios'
        );

        if (categoriaServicios) {
          const idCategoriaDefault = categoriaServicios.id_categoria;

          // Guardar el ID en localStorage
          localStorage.setItem('idCategoriaSeleccionada', idCategoriaDefault.toString());

          // Llama a buscarSubCategorias con el ID seleccionado
          this.buscarSubCategorias();
        } else {
          console.error('No se encontró la categoría "Servicios".');
        }
      },
      error: (err) => {
        console.error('Error al obtener las categorías:', err);
      },
    });

    this.buscarCategorias();
    this.buscarMarca();
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

        const categoriasU = new Set(
          respuesta.map(
            (categoria: any) => categoria.nombreCategoria
          )
        );
        this.categorias = Array.from(categoriasU) as string[];
        this.filteredCategorias = this.categorias.filter(
          (categoria) =>
            !saborIngresado ||
            categoria.toLowerCase().includes(saborIngresado.toLowerCase())
        );

        // Si se busca específicamente la categoría "Servicios"
        if (saborIngresado === "Servicios") {
          const categoriaServicios = respuesta.find(
            (categoria: any) => categoria.nombreCategoria === "Servicios"
          );

          if (categoriaServicios) {
            const idCategoriaServicios = categoriaServicios.id_categoria;

            // Guardar el ID en localStorage
            localStorage.setItem("idCategoriaSeleccionada", idCategoriaServicios.toString());

            // Llamar a buscarSubCategorias con el ID seleccionado
            this.buscarSubCategorias();
          } else {
            console.error("No se encontró la categoría 'Servicios'.");
          }
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
      this.categoriaService.obtenerMarcasServiciosIdGym2(this.idGym).subscribe({

      next: (respuesta) => {

        // Filtra las marcas que tienen 'servicio' igual a 1
        const marcasFiltradas = respuesta.Productos.filter(
          (marca: any) => marca.servicio !== null && marca.servicio !==0 && marca.fk_idGimnasio == this.idGym
        );

        console.log('Marcas de este gym: ', marcasFiltradas);


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
    // console.log('codigoBarra: ', codigo);

    this.productoService
      .verProductoCodigoBarras2(codigo)
      .subscribe((respuesta: any) => {
        // console.log('respuesta: ', respuesta);

        if (respuesta.success == 0) {
        } else {
          this.toastr.warning('Este código de barras ya existe.', 'Advertencia');

          this.form.setValue({
            codigoBarra: respuesta[0]["codigoBarras"],
            nomsubcate: respuesta[0]["subCategoria"],
            nombreCategoriaP: respuesta[0]["categoria"],
            descripcion: respuesta[0]["nombreProducto"],
            detalleCompra: respuesta[0]["detalleCompra"],
            marcaP: respuesta[0]["marca"],
            precioCompra: respuesta[0]["precioCompra"],
            detalleUnidadMedida: respuesta[0]["detalleUnidadMedida"],
            precioCaja: respuesta[0]["precioCaja"],
            activo: respuesta[0]["activo"],
            ItemNumber: respuesta[0]["ItemNumber"],
            ieps: respuesta[0]["ieps"],
            iva: respuesta[0]["iva"],
            sat: respuesta[0]["sat"],
            factura: respuesta[0]["factura"],
            STYLE_ITEM_ID: respuesta[0]["STYLE_ITEM_ID"],
            cantidadMayoreo: respuesta[0]["cantidadMayoreo"],
            precciosucu: respuesta[0]["precioSucursal"],
            duracion: respuesta[0]["duracion_dias"]
          });

          // this.botonDeshabilitado = true;

          // Esperar 1 segundo antes de cerrar el modal
          setTimeout(() => {
            this.dialogo.close();
          }, 1000);

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

  generateUniqueCode(): string {
  const timestamp = Date.now().toString(36); // Marca de tiempo en base 36
  const random = Math.random().toString(36).substring(2, 8); // Número aleatorio en base 36
  return `${timestamp}-${random}`;
}

  registrarProd() {
    if (this.form.valid) {
      this.spinner.show();
      ///********** Verifica si la categoria ya existe */
      const codigo = this.form.get("codigoBarra")?.value;
      this.productoService
        .verProductoCodigoBarras2(codigo)
        .subscribe((respuesta: any) => {

          if (respuesta.success == 0) {
            this.categoriaService
              .obtenerCategoriaPorNombre2(this.form.value.nombreCategoriaP)
              .subscribe((categoriaExistente) => {
                const idCategoria = categoriaExistente.categoria.id_categoria;
                if (categoriaExistente.success == 1) {
                  ///********** Verifica si la subcategoria ya existe */
                  this.categoriaService
                    .obtenerSubCategoriaPorNombre2(
                      this.form.value.nomsubcate,
                      idCategoria
                    )
                    .subscribe((subCategoriaExistente) => {
                      if (subCategoriaExistente.success == 1) {
                        ///********** Verifica si la marca ya existe */
                        this.categoriaService
                          .obtenerMarcaPorNombre2(this.form.value.marcaP, this.idGym)
                          .subscribe((marcaExistente) => {
                            if (marcaExistente.success == 1) {
                              const formularioP = {
                                idProducto:
                                  subCategoriaExistente.producto.id_producto,
                                detalleUnidadMedida: "pza",
                                precioCompra: this.form.value.precioCompra,
                                detalleCompra: "Membresia",
                                id_marcaV:
                                  marcaExistente.marca.id_marcas,
                                descripcion: this.form.value.descripcion,
                                codigoBarra: this.generateUniqueCode(),
                                ItemNumber: this.form.value.ItemNumber,
                                activo: this.form.value.activo,
                                sat: this.form.value.sat,
                                ieps: this.form.value.ieps,
                                iva: this.form.value.iva,
                                factura: this.form.value.factura,
                                STYLE_ITEM_ID: this.form.value.STYLE_ITEM_ID,
                                precioCaja: this.form.value.precioCaja,
                                cantidadMayoreo:this.form.value.cantidadMayoreo,
                                //idUsuario: this.auth.idUser.getValue(),
                              };

                              console.log("Datos a enviar: ", formularioP);


                              this.productoService
                                .creaProductoMemb(formularioP)
                                .subscribe({
                                  next: (respuesta) => {
                                    console.log('RESPUESTA: ', respuesta);

                                    //se obtiene el ultimo idProbob
                                    this.idProbob = respuesta.idProbob;
                                    // console.log("IDProbob Obtenido: ", this.idProbob);

                                    // Después de obtener el idProbob, llamamos a enviarRegistros para guardar los demás datos
                                    this.enviarRegistros();

                                    if (respuesta.success) {
                                      this.spinner.hide();
                                      this.dialog
                                        .open(MensajeEmergentesComponent, {
                                          data: `Membresia agregada exitosamente`,
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
                              // console.log('NO EXISTE LA MARCA');
                              const formMarca = {
                                marcaP: this.form.value.marcaP,
                                idGimnasio: this.idGym,
                                servicio: 1
                              };
                              // console.log('VALOR DE LA NUEVA MARCA: ',formMarca);
                              this.categoriaService
                                .agregarMarca2(formMarca)
                                .subscribe((respuestaMarca) => {
                                  // console.log('NUEVA MARCA AGREGADA: ', respuestaMarca);
                                  // console.log('ID DE LA NUEVA MARCA: ', respuestaMarca.data.id_marcas);
                                  const formularioP = {
                                    idProducto:
                                      subCategoriaExistente.producto
                                        .id_producto,
                                    detalleUnidadMedida: "pza",
                                    precioCompra: this.form.value.precioCompra,
                                    detalleCompra: "Membresia",
                                    id_marcaV: respuestaMarca.data.id_marcas,
                                    descripcion: this.form.value.descripcion,
                                    codigoBarra: this.generateUniqueCode(),
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

                                        //se obtiene el ultimo idProbob
                                        this.idProbob = respuesta.idProbob;
                                        // console.log("IDProbob Obtenido: ", this.idProbob);

                                        // Después de obtener el idProbob, llamamos a enviarRegistros para guardar los demás datos
                                        this.enviarRegistros();

                                        if (respuesta.success) {
                                          this.spinner.hide();
                                          this.dialog
                                            .open(MensajeEmergentesComponent, {
                                              data: `Membresia agregada exitosamente`,
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
                          duracion: this.form.value.duracion,
                          membresia: 1
                        };
                        console.log('Datos a enviar de la sub: ', formSub);
                        this.categoriaService
                          .agregarSubCategoria2(formSub)
                          .subscribe((respuestaSub) => {
                            console.log('NUEVA SUBCATEGORIA AGREGADA: ', respuestaSub);

                            ///********** Verifica si la marca ya existe */
                            this.categoriaService
                              .obtenerMarcaPorNombre2(this.form.value.marcaP, this.idGym)
                              .subscribe((marcaExistente) => {
                                console.log('Marca existente: ', marcaExistente);

                                if (marcaExistente.success == 1) {
                                  this.spinner.hide();
                                  //agregar producto

                                  const formularioP = {
                                    idProducto: respuestaSub.id_producto,
                                    detalleUnidadMedida: "pza",
                                    precioCompra: this.form.value.precioCompra,
                                    detalleCompra: "Membresia",
                                    id_marcaV:
                                      marcaExistente.marca.id_marcas,
                                    descripcion: this.form.value.descripcion,
                                    codigoBarra: this.generateUniqueCode(),
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
                                  console.log('form enviado: ', formularioP);


                                  this.productoService
                                    .creaProductoMemb(formularioP)
                                    .subscribe({
                                      next: (respuesta) => {
                                        console.log('respuesta: ', respuesta);
                                        // console.log('RESPUESTA: ', respuesta);

                                        //se obtiene el ultimo idProbob
                                        this.idProbob = respuesta.idProbob;
                                        // console.log("IDProbob Obtenido: ", this.idProbob);

                                        // Después de obtener el idProbob, llamamos a enviarRegistros para guardar los demás datos
                                        this.enviarRegistros();

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
                                        detalleUnidadMedida: "pza",
                                        precioCompra:
                                          this.form.value.precioCompra,
                                        detalleCompra: "Membresia",
                                        id_marcaV: respuestaMarca.data.id_marcas,
                                        descripcion:
                                          this.form.value.descripcion,
                                          codigoBarra: this.generateUniqueCode(),

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
                                      console.log('form enviado: ', formularioP);


                                      this.productoService
                                        .creaProductoMemb(formularioP)
                                        .subscribe({
                                          next: (respuesta) => {
                                            console.log('respuesta: ', respuesta);

                                            // console.log('RESPUESTA: ', respuesta);

                                            //se obtiene el ultimo idProbob
                                            this.idProbob = respuesta.idProbob;
                                            // console.log("IDProbob Obtenido: ", this.idProbob);

                                            // Después de obtener el idProbob, llamamos a enviarRegistros para guardar los demás datos
                                            this.enviarRegistros();

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
                        // console.error("Error: subcategoría no encontrada o success no es 1");
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
                              .obtenerMarcaPorNombre2(this.form.value.marcaP, this.idGym)
                              .subscribe((marcaExistente) => {
                                console.log('marca: ', marcaExistente);

                                if (marcaExistente.success == 1) {
                                  //agregar producto

                                  const formularioP = {
                                    idProducto:
                                      subCategoriaExistente.producto
                                        .id_producto,
                                    detalleUnidadMedida: "pza",
                                    precioCompra: this.form.value.precioCompra,
                                    detalleCompra: "Membresia",
                                    id_marcaV:
                                      marcaExistente.marca.id_marcas,
                                    descripcion: this.form.value.descripcion,
                                    codigoBarra: this.generateUniqueCode(),
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
                                  console.log('Form enviado: ', formularioP);


                                  this.productoService
                                    .creaProductoMemb(formularioP)
                                    .subscribe({
                                      next: (respuesta) => {
                                        console.log('Respuesta: ', respuesta);

                                        // console.log('RESPUESTA: ', respuesta);

                                        //se obtiene el ultimo idProbob
                                        this.idProbob = respuesta.idProbob;
                                        // console.log("IDProbob Obtenido: ", this.idProbob);

                                        // Después de obtener el idProbob, llamamos a enviarRegistros para guardar los demás datos
                                        this.enviarRegistros();

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
                                        detalleUnidadMedida: "pza",
                                        precioCompra:
                                          this.form.value.precioCompra,
                                        detalleCompra: "Membresia",
                                        id_marcaV: respuestaMarca.data.id_marcas,
                                        descripcion:
                                          this.form.value.descripcion,
                                          codigoBarra: this.generateUniqueCode(),

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
                                      console.log('Form enviado: ', formularioP);


                                      this.productoService
                                        .creaProductoMemb(formularioP)
                                        .subscribe({
                                          next: (respuesta) => {
                                            console.log('Respuesta: ', respuesta);

                                            // console.log('RESPUESTA: ', respuesta);

                                            //se obtiene el ultimo idProbob
                                            this.idProbob = respuesta.idProbob;
                                            // console.log("IDProbob Obtenido: ", this.idProbob);

                                            // Después de obtener el idProbob, llamamos a enviarRegistros para guardar los demás datos
                                            this.enviarRegistros();

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
                              duracion: this.form.value.duracion,
                              membresia: 1
                            };
                            console.log('valorr de la nueva subcategoria: ', formSub);


                            this.categoriaService
                              .agregarSubCategoria2(formSub)
                              .subscribe((respuestaSub) => {
                                console.log('no existe categoriaExistente, creando: ', respuestaSub);

                                ///********** Verifica si la marca ya existe */
                                this.categoriaService
                                  .obtenerMarcaPorNombre2(this.form.value.marcaP, this.idGym)
                                  .subscribe((marcaExistente) => {
                                    console.log('MARCA EXISTENTE: ', marcaExistente);

                                    if (marcaExistente.success == 1) {
                                      const formularioP = {
                                        idProducto: respuestaSub.id_producto,
                                        detalleUnidadMedida: "pza",
                                        precioCompra:
                                          this.form.value.precioCompra,
                                        detalleCompra: "Membresia",
                                        id_marcaV:
                                          marcaExistente.marca
                                            .id_marcas,
                                        descripcion:
                                          this.form.value.descripcion,
                                          codigoBarra: this.generateUniqueCode(),

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
                                      console.log('Form enviado: ', formularioP);

                                      this.productoService
                                        .creaProductoMemb(formularioP)
                                        .subscribe({
                                          next: (respuesta) => {
                                            console.log('Respuesta: ', respuesta);

                                            // console.log('RESPUESTA: ', respuesta);

                                            //se obtiene el ultimo idProbob
                                            this.idProbob = respuesta.idProbob;
                                            // console.log("IDProbob Obtenido: ", this.idProbob);

                                            // Después de obtener el idProbob, llamamos a enviarRegistros para guardar los demás datos
                                            this.enviarRegistros();

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
                                            detalleUnidadMedida: "pza",
                                            precioCompra:
                                              this.form.value.precioCompra,
                                            detalleCompra: "Membresia",
                                            id_marcaV: respuestaMarca.data.id_marcas,
                                            descripcion:
                                              this.form.value.descripcion,
                                              codigoBarra: this.generateUniqueCode(),

                                            ItemNumber:
                                              this.form.value.ItemNumber,
                                            activo: this.form.value.activo,
                                            sat: this.form.value.sat,
                                            ieps: this.form.value.ieps,
                                            iva: this.form.value.iva,
                                            factura: this.form.value.factura,
                                            STYLE_ITEM_ID:
                                              this.form.value.STYLE_ITEM_ID,
                                            precioCaja:
                                              this.form.value.precioCaja,
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

                                                // console.log('RESPUESTA: ', respuesta);

                                                //se obtiene el ultimo idProbob
                                                this.idProbob = respuesta.idProbob;
                                                // console.log("IDProbob Obtenido: ", this.idProbob);

                                                // Después de obtener el idProbob, llamamos a enviarRegistros para guardar los demás datos
                                                this.enviarRegistros();

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
                  // console.error("Error: categoría no encontrada o success no es 1");
                }
              });
          } else {
            console.log('CUANDO EXISTE EL CODIGO BARRAS NO UTILIZADO EN MEMBRESIAS');

            // console.log('entra a actualizar');
            this.form.get("nomsubcate")?.enable();
            this.categoriaService
            .obtenerCategoriaPorNombre2(this.form.value.nombreCategoriaP)
            .subscribe((categoriaExistente) => {
              const idCategoria = categoriaExistente.categoria.id_categoria;
              // console.log('success categoria: ', categoriaExistente.success);
              if (categoriaExistente.success == 1) {
                ///********** Verifica si la subcategoria ya existe */
                this.categoriaService
                .obtenerSubCategoriaPorNombre2(
                  this.form.value.nomsubcate,
                  idCategoria
                )
                .subscribe((subCategoriaExistente) => {
                  // console.log('success subcategoria: ', subCategoriaExistente.success);
                  if (subCategoriaExistente.success == 1) {
                    ///********** Verifica si la marca ya existe */
                    this.categoriaService
                    .obtenerMarcaPorNombre2(this.form.value.marcaP, this.idGym)
                    .subscribe((marcaExistente) => {
                      // console.log('success de marca: ', marcaExistente.success);
                      if (marcaExistente.success == 1) {
                        const formularioP = {
                          idProducto:
                            subCategoriaExistente.producto.id_producto,
                          detalleUnidadMedida: "pza",
                          precioCompra: this.form.value.precioCompra,
                          detalleCompra: "Membresia",
                          idMarcaProducto:
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
                          cantidadMayoreo:this.form.value.cantidadMayoreo,
                          //idUsuario: this.auth.idUser.getValue(),
                        };
                        // console.log('se envia: ', formularioP);

                        this.productoService
                          .actualizarProducto2(formularioP)
                          .subscribe({
                            next: (respuesta) => {
                              // console.log('RESPUESTA: ', respuesta);

                              //se obtiene el ultimo idProbob
                              this.idProbob = respuesta.idProbob;
                              // console.log("IDProbob Obtenido: ", this.idProbob);

                              // Después de obtener el idProbob, llamamos a enviarRegistros para guardar los demás datos
                              this.enviarRegistros();

                              if (respuesta.success) {
                                this.spinner.hide();
                                this.dialog
                                  .open(MensajeEmergentesComponent, {
                                    data: `Membresia actualizada exitosamente`,
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
                        // console.log('NO EXISTE LA MARCA');
                        const formMarca = {
                          marcaP: this.form.value.marcaP,
                          idGimnasio: this.idGym,
                          servicio: 1
                        };
                        // console.log('VALOR DE LA NUEVA MARCA: ',formMarca);
                        this.categoriaService
                          .agregarMarca2(formMarca)
                          .subscribe((respuestaMarca) => {
                            // console.log('NUEVA MARCA AGREGADA: ', respuestaMarca);
                            // console.log('ID DE LA NUEVA MARCA: ', respuestaMarca.data.id_marcas);
                            const formularioP = {
                              idProducto:
                                subCategoriaExistente.producto
                                  .id_producto,
                              detalleUnidadMedida: "pza",
                              precioCompra: this.form.value.precioCompra,
                              detalleCompra: "Membresia",
                              idMarcaProducto: respuestaMarca.data.id_marcas,
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
                              .actualizarProducto2(formularioP)
                              .subscribe({
                                next: (respuesta) => {

                                  //se obtiene el ultimo idProbob
                                  this.idProbob = respuesta.idProbob;
                                  // console.log("IDProbob Obtenido: ", this.idProbob);

                                  // Después de obtener el idProbob, llamamos a enviarRegistros para guardar los demás datos
                                  this.enviarRegistros();

                                  if (respuesta.success) {
                                    this.spinner.hide();
                                    this.dialog
                                      .open(MensajeEmergentesComponent, {
                                        data: `Membresia actualizada exitosamente`,
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
                    console.error("Error: subcategoría no encontrada o success no es 1");
                  }
                });
              } else {
                console.error("Error: categoría no encontrada o success no es 1");
              }
            });
          }
        });

    } else {
      this.message = "Por favor, complete todos los campos requeridos.";
      this.marcarCamposInvalidos(this.form);
    }
  }

  enviarRegistros(): void {
    const fechaActual: Date = new Date();
    const dia: string = fechaActual.getDate().toString().padStart(2, '0');
    const mes: string = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const año: string = fechaActual.getFullYear().toString();
    const fechaFormateada: string = `${año}-${mes}-${dia}`;
    // Asegúrate de que el idProbob ya está disponible antes de enviar el registro
    if (this.idProbob) {
      const datosRegistro = [{
        id_Probob: this.idProbob,
        precciosucu: this.form.get('precciosucu')?.value,
        // Puedes agregar otros campos aquí si los necesitas
        exis: 1,
        precioCaja: 0.00,
        preccio: 0.00,
        valor: this.auth.idGym.getValue(),
        fechaE: fechaFormateada,
        accion: "Registro de nuevo producto",
        mail_actualizador: this.auth.idUser.getValue(),
      }];
      // console.log(datosRegistro);


      // Llamamos al servicio para enviar los datos del registro
      this.entradas.agregarEntradaProducto(datosRegistro).subscribe({
        next: (respuesta) => {
        // console.log('LOG DE ENTRADAS: ', respuesta);

        if (respuesta.success === 1) {
          console.log('Datos adicionales guardados exitosamente');
        } else {
          console.error('Error al guardar los datos adicionales');
        }
      },
      });
    } else {
      console.error('No se ha obtenido un idProbob válido');
    }
  }

}
