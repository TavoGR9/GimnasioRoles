
import { Component, OnInit, Inject, ChangeDetectionStrategy} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api'; /**siempre debes importarlo */
//import { ToastrService } from 'ngx-toastr';
//import { ColaboradorService } from 'src/app/service/colaborador.service';
import { ProductoService } from '../../service/producto.service';

import { MatDialog } from "@angular/material/dialog";
import { MensajeEmergentesComponent } from "../mensaje-emergentes/mensaje-emergentes.component";
import { CategoriaService } from 'src/app/service/categoria.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/service/auth.service';
import { NgxSpinnerService } from "ngx-spinner";
import { Observable, Subject } from "rxjs";
import { ToastrService } from "ngx-toastr";
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, formulario: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = formulario && formulario.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-editar-producto',
  templateUrl: './editar-producto.component.html',
  styleUrls: ['./editar-producto.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe, MessageService],
})
export class EditarProductoComponent implements OnInit{
  form: FormGroup;
  gimnasio: any;
  message: string = '';
  producto: any;
  idCategoria: number = 0;
  listaCategorias: any;
  idProducto: any;
  fechaCreacion: string;
  private idGym: number = 0;
  currentUser: string = '';
  categorias: any[] = [];
  sabores: string[] = [];
  marcas: string[] = [];
  subcategorias: string[] = [];
  filteredSabores: string[] = [];
  filteredCategorias: string[] = [];
  filteredSubCategorias: string[] = [];
  filteredMarcas: string[] = [];
  private productoSubject = new Subject<void>();

  constructor( public dialogo: MatDialogRef<EditarProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb:FormBuilder,
    private toastr: ToastrService,
    private activeRoute: ActivatedRoute, 
    private productoService:ProductoService,
    private datePipe: DatePipe,
    private router:Router,
    private spinner: NgxSpinnerService,
    private auth:AuthService,
    public dialog: MatDialog,
    
    private categoriaService: CategoriaService,){

    this.idProducto = data.idProducto;
    //llamar al servicio datos empleado - pasando el parametro capturado por url
    this.productoService.consultarProductosJ(this.idProducto).subscribe(
     
      respuesta=>{
        this.form.setValue({
         // nombre:respuesta [0]['nombreProducto'],
          codigoBarra:respuesta [0]['codigoBarras'],
         // idCategoria:respuesta [0]['nombreCategoria'],
         // Gimnasio_idGimnasio:respuesta [0]['Gimnasio_idGimnasio'],         
          nomsubcate:respuesta [0]['subCategoria'],
          nombreCategoriaP:respuesta [0]['nombreCategoria'],
          descripcion:respuesta [0]['nombreProducto'],
          marcaP:respuesta [0]['marca'],
          detalleCompra:respuesta [0]['detalleCompra'],
          detalleUnidadMedida:respuesta [0]['marca'],
        });
      }
      
    );

    this.fechaCreacion = this.obtenerFechaActual();
   
    this.form = this.fb.group({
      detalleUnidadMedida: ["pza", Validators.required],
      //precioCompra: [""],
      detalleCompra: [""],
      marcaP: [""],
      //activo: [1],
      //ItemNumber: [0],
      codigoBarra: [""],
      //ieps: [0],
      //iva: [0],
      //sat: [0],
     nombreCategoriaP: [""],
      nomsubcate: [""],
      //factura: [0],
      //STYLE_ITEM_ID: ["0"],
      //precioCaja: ["0"],
      //cantidadMayoreo: ["0"],
      descripcion: [""],
    });
  }


  validarNumeroDecimal(event: any) {
    const input = event.target.value;
    // Patrón para aceptar números decimales
    const pattern = /^\d+(\.\d{0,2})?$/;
    
    if (!pattern.test(input)) {
      // Si el valor no coincide con el patrón, se elimina el último carácter
      this.form.get('cantidadUnidades')?.setValue(input.slice(0, -1));
    }
  }
  //insanciar objeto para manejar el tipo de error en las validaciones
  matcher = new MyErrorStateMatcher();

  //mandar a llamar el sevicio correspondiente al llenado del combo sucursal
  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }
    
    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
      this.listaTabla();
    });  
  }

  listaTabla(){
   /* this.categoriaService.consultarListaCategoria(this.idGym).subscribe({
      next: (respuesta) => {
        this.listaCategorias = respuesta;
      },
      error: (error) => {
        //console.log(error);
      },
    });*/
  };
  
  getSSdata(data: any){
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
          this.auth.role.next(resultData.rolUser);
          this.auth.userId.next(resultData.id);
          this.auth.idGym.next(resultData.idGym);
          this.auth.nombreGym.next(resultData.nombreGym);
          this.auth.email.next(resultData.email);
          this.auth.encryptedMail.next(resultData.encryptedMail);
      }, error: (error) => { console.log(error); }
    });
  }

  obtenerFechaActual(): string {
    const fechaActual = new Date();
    return this.datePipe.transform(fechaActual, 'yyyy-MM-dd HH:mm:ss') || '';
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

  actualizar(){

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
                          id_probod :this.idProducto,
                          idProducto:subCategoriaExistente.producto.id_producto,
                          detalleCompra: this.form.value.detalleCompra,
                          idMarcaProducto: marcaExistente.marcasproducto.id_marcas,
                          descripcion: this.form.value.descripcion,
                          codigoBarras: this.form.value.codigoBarra,
                        };
                        this.productoService
                          .actualizarProducto(formularioP)
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
                              id_probod :this.idProducto,
                              idProducto: subCategoriaExistente.producto.id_producto,
                              detalleCompra: this.form.value.detalleCompra,
                              idMarcaProducto: respuestaMarca.id_marcas,
                              descripcion: this.form.value.descripcion,
                              codigoBarras: this.form.value.codigoBarra,
                            };

                            this.productoService
                              .actualizarProducto(formularioP)
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
                              id_probod :this.idProducto,
                              idProducto:respuestaSub.id_producto,
                              detalleCompra: this.form.value.detalleCompra,
                              idMarcaProducto:marcaExistente.marcasproducto.id_marcas,
                              descripcion: this.form.value.descripcion,
                              codigoBarras: this.form.value.codigoBarra,    
                            };

                            this.productoService
                              .actualizarProducto(formularioP)
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
                            };
                            this.categoriaService
                              .agregarMarca(formMarca)
                              .subscribe((respuestaMarca) => {
                               
                                const formularioP = {
                                  id_probod :this.idProducto,
                                  idProducto:respuestaSub.id_producto,
                                  detalleCompra: this.form.value.detalleCompra,
                                  idMarcaProducto:respuestaMarca.id_marcas,
                                  descripcion: this.form.value.descripcion,
                                  codigoBarras: this.form.value.codigoBarra,                                 
                                };

                                this.productoService
                                  .actualizarProducto(formularioP)
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

                                //agregar producto

                                this.spinner.hide();
                               /* const dialogRefConfirm = this.dialog.open(
                                  MensajeEmergentesComponent,
                                  {
                                    data: `Se agregó exitosamente`,
                                  }
                                );
                                dialogRefConfirm
                                  .afterClosed()
                                  .subscribe((result) => {});*/
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
                              id_probod :this.idProducto,
                              idProducto:subCategoriaExistente.producto.id_producto,
                              detalleCompra: this.form.value.detalleCompra,
                              idMarcaProducto:marcaExistente.marcasproducto.id_marcas,
                              descripcion: this.form.value.descripcion,
                              codigoBarras: this.form.value.codigoBarra,
                            };

                            this.productoService
                              .actualizarProducto(formularioP)
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
                            };
                            this.categoriaService
                              .agregarMarca(formMarca)
                              .subscribe((respuestaMarca) => {
                                //agregar producto

                                const formularioP = {
                                  id_probod :this.idProducto,
                                  idProducto:subCategoriaExistente.producto.id_producto,
                                  detalleCompra: this.form.value.detalleCompra,
                                  idMarcaProducto:respuestaMarca.id_marcas,
                                  descripcion: this.form.value.descripcion,
                                  codigoBarras: this.form.value.codigoBarra,  
                                };

                                this.productoService
                                  .actualizarProducto(formularioP)
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
                                /*const dialogRefConfirm = this.dialog.open(
                                  MensajeEmergentesComponent,
                                  {
                                    data: `Se agregó exitosamente`,
                                  }
                                );
                                dialogRefConfirm
                                  .afterClosed()
                                  .subscribe((result) => {});*/
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
                                  id_probod :this.idProducto,
                                  idProducto:respuestaSub.id_producto,
                                  detalleCompra: this.form.value.detalleCompra,
                                  idMarcaProducto:marcaExistente.marcasproducto.id_marcas,
                                  descripcion: this.form.value.descripcion,
                                  codigoBarras: this.form.value.codigoBarra,
                                };

                                this.productoService
                                  .actualizarProducto(formularioP)
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

                                //agregar producto
                              } else {
                                const formMarca = {
                                  marcaP: this.form.value.marcaP,
                                };

                                this.categoriaService
                                  .agregarMarca(formMarca)
                                  .subscribe((respuestaMarca) => { 

                                    const formularioP = {
                                      id_probod :this.idProducto,
                                      idProducto:respuestaSub.id_producto,
                                      detalleCompra:this.form.value.detalleCompra,
                                      idMarcaProducto:respuestaMarca.id_marcas,
                                      descripcion: this.form.value.descripcion,
                                      codigoBarras: this.form.value.codigoBarra,
                                    };

                                    this.productoService
                                      .actualizarProducto(formularioP)
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
                                    //agregar producto

                                    this.spinner.hide();
                                   /* const dialogRefConfirm = this.dialog.open(
                                      MensajeEmergentesComponent,
                                      {
                                        data: `Se agregó exitosamente`,
                                      }
                                    );
                                    dialogRefConfirm
                                      .afterClosed()
                                      .subscribe((result) => {});*/
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

infoCategoria(event: number) {
  this.idCategoria = event;
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

}
