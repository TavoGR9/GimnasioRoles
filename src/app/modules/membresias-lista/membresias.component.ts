import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { plan } from "../../models/plan";
import { MensajeEliminarComponent } from "../mensaje-eliminar/mensaje-eliminar.component";
import { AuthService } from "../../service/auth.service";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { DialogSelectMembershipComponent } from "../dialog-select-membership/dialog-select-membership.component";
import { MembresiaService } from "../../service/membresia.service";

// Reemplazar por productos
import { ListaProductos } from "../../models/listaProductos";
import { ProductoService } from "../../service/producto.service";
import { EditarProductoComponent } from "../editar-producto/editar-producto.component";
import { AgregarProductoMembresiaComponent } from "../agregar-producto-membresia/agregar-producto-membresia.component";
@Component({
  selector: "app-membresias",
  templateUrl: "./membresias.component.html",
  styleUrls: ["./membresias.component.css"],
})
export class MembresiasComponent implements OnInit {
  membresiaActiva: boolean = true; // Inicializa según el estado de la membresía
  membresias: plan[] = [];
  plan: plan[] = [];
  message: string = "";
  public sucursales: any;
  public page: number = 0;
  public search: string = "";
  dataSource: any;
  currentUser: string = "";
  services: any[] = [];
  idGym: number = 0;
  isLoading: boolean = true;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Reemplazar por productos
  productos: any[] = [];
  listProductData: ListaProductos[] = [];
  dataSourceDos: any;
  productoActiva: boolean = true;

  constructor(
    private membresiaService: MembresiaService,
    private auth: AuthService,
    public dialog: MatDialog,
    //Reemplazar por productos
    public productoService: ProductoService,
  ) {}

  displayedColumns: string[] = [
    "title",
    // "details",
    "servicio",
    "price",
    // "duration",
    "actions",
  ];
  habilitarBoton: boolean = false;

  ngOnInit(): void {
    // this.membresiaService.comprobar();
    // this.gimnasioService.comprobar();

    //COMPRUEBA SI ESTA EN LINEA
    this.auth.comprobar().subscribe((respuesta)=>{
      this.habilitarBoton = respuesta.status;
    });

    //OBTIENE EL USUARIO ACTUAL
    this.currentUser = this.auth.getCurrentUser();
    if (this.currentUser) {
      this.getSSdata(JSON.stringify(this.currentUser));
    }

    //LLAMAMOS A LA LISTA DE MEMBRESIAS SI HAY UN idGym VALIDO
    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
      // this.listaTabla();
      this.listaTablaProdMem();
    });
  }

  //CONSULTA LOS DATOS DEL USUARIO LOGUEADO
  getSSdata(data: any) {
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
        this.auth.role.next(resultData.rolUser);
        this.auth.idUser.next(resultData.clave);
        this.auth.idGym.next(resultData.idGym);
        this.auth.nombreGym.next(resultData.direccion);
        this.auth.email.next(resultData.email);
        this.auth.encryptedMail.next(resultData.encryptedMail);
      },
      error: (error) => { console.log(error);
      },
    });
  }

  //SE LE ASOCIA EL PAGINADOR A LA TABLA
  loadData() {
    setTimeout(() => {
      this.dataSourceDos.paginator = this.paginator;
      this.isLoading = false;
    }, 1000);
  }

  //FILTRO DE BUSQUEDA
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceDos.filter = filterValue.trim().toLowerCase();
  }

  // toggleCheckbox(idMem: number, status: number) {
  //   //const estadoOriginal = status;
  //   const dialogRef = this.dialog.open(MensajeEliminarComponent, {
  //     data: `¿Desea cambiar el estatus de la categoría?`,
  //   });

  //   dialogRef.afterClosed().subscribe((confirmado: boolean) => {
  //     if (confirmado) {
  //       const nuevoEstado = status == 1 ? { status: 0 } : { status: 1 };
  //       this.actualizarEstatusMembresia(idMem, nuevoEstado);
  //     } else {
  //     }
  //   });
  // }

  // actualizarEstatusMembresia(idMem: number, estado: { status: number }) {
  //   this.membresiaService.updateMembresiaStatus(idMem, estado).subscribe(
  //     (respuesta) => {
  //       this.membresiaActiva = estado.status == 1;
  //     },
  //     (error) => {
  //       console.error("Error al actualizar la membresía:", error);
  //     }
  //   );
  // }

  // openDialog(): void {
  //   this.membresiaService.optionShow.next(1);
  //   this.membresiaService.optionShow.subscribe((option) => {});
  //   const dialogRef = this.dialog.open(DialogSelectMembershipComponent, {
  //     width: "70%",
  //     disableClose: true,
  //     data: { name: "¿Para quién es esta membresía?" },
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     this.membresiaService.consultarPlanIdMem(this.idGym).subscribe(
  //       (respuesta) => {
  //         if (respuesta) {
  //           this.plan = respuesta;
  //           this.dataSource = new MatTableDataSource(this.plan);
  //           this.dataSource.paginator = this.paginator;
  //         } else {
  //         }
  //       },
  //       (error) => {
  //         console.error('Error al obtener los datos del servicio:', error);
  //       }
  //     );
  //   });
  // }

  // openDialogService(idMem: number, tipo_membresia: number) {
  //   this.membresiaService.optionShow.next(2);
  //   this.membresiaService.optionShow.subscribe((option) => {});
  //   this.membresiaService.setDataToupdate(idMem, tipo_membresia);
  //   const dialogRef = this.dialog.open(DialogSelectMembershipComponent, {
  //     width: "70%",
  //     disableClose: true,
  //     data: { name: "Servicios de la membresia" },
  //   });
  // }

  // openDialogEdit(idMem: number, tipo_membresia: number) {
  //   this.membresiaService.optionShow.next(3);
  //   this.membresiaService.optionShow.subscribe((option) => {});
  //   this.membresiaService.setDataToupdate(idMem, tipo_membresia);
  //   const dialogRef = this.dialog.open(DialogSelectMembershipComponent, {
  //     width: "70%",
  //     disableClose: true,
  //     data: { name: "Editar membresia", id: idMem },
  //   });
  //   dialogRef.afterClosed().subscribe((result) => {
  //     this.membresiaService.consultarPlanIdMem(this.idGym).subscribe((respuesta) => {
  //       this.plan = respuesta;
  //       this.dataSource = new MatTableDataSource(this.plan);
  //       this.dataSource.paginator = this.paginator; // Asigna el paginador a tu dataSource
  //     });
  //   });
  // }

  // openDialogAddServices() {
  //   this.membresiaService.optionShow.next(4);
  //   this.membresiaService.optionShow.subscribe((option) => {
  //     if (option == 4) {
  //       const dialogRef = this.dialog.open(DialogSelectMembershipComponent, {
  //         width: "70%",
  //         data: { name: "Agregar servicios" },
  //       });
  //     }
  //   });
  // }


  //OBTIENE LAS MEMBRESIAS Y SE MUESTRAN EN LA TABLA
  listaTablaProdMem(){
    this.productoService.obternerInventario2(this.idGym).subscribe((resultData) => {
      //console.log('LISTA DE TODOS LOS PRODUCTOS: ', resultData);

      //this.productos = resultData
      this.productos = resultData.filter((producto: any) => producto.membresia === '1' && producto.id_bodega == this.idGym);
      this.dataSourceDos = new MatTableDataSource(this.productos);
      // console.log('Lista de productos: ', this.productos);
      // console.log('Datos de la lista de productos: ', this.dataSourceDos);
      // console.log("ID de Gimnasio:", this.idGym);

      this.loadData();
    });
  }


  sortField: string = '';
  sortDirection: string = 'asc';

  // sortData(column: string): void {
  //   const data = this.dataSource.data;
  //   if (this.sortField === column) {
  //     this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  //   } else {
  //     this.sortField = column;
  //     this.sortDirection = 'asc';
  //   }
  //   data.sort((a: any, b:any) => {
  //     const isAsc = this.sortDirection === 'asc';
  //     switch (column) {
  //       case 'nombre': return this.compare(a.nombreProducto, b.nombreProducto, isAsc);
  //       // Añade más casos según las columnas que tengas
  //       default: return 0;
  //     }
  //   });

  //   this.dataSource.data = data;
  // }

  // compare(a: string | number | Date, b: string | number | Date, isAsc: boolean): number {
  //   if (typeof a === 'string' && typeof b === 'string') {
  //     // Utiliza localeCompare para comparar cadenas de texto
  //     return a.localeCompare(b, undefined, { sensitivity: 'base' }) * (isAsc ? 1 : -1);
  //   }
  //   // Para otros tipos, utiliza comparación estándar
  //   return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  // }

  //OBTIENE SI EL ROL DEL USUARIO ES ADMINISTRADOR O RECEPCIONISTA
  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  isRecep(): boolean {
    return this.auth.isRecepcion();
  }

  //ABRE EL COMPONENTE PARA EDITAR UNA MEMBRESIA
  openDialogEditProd(idProducto: number): void {
    const dialogRef = this.dialog.open(EditarProductoComponent, {
      width: "70%",
      disableClose: true,
      data: { idProducto: idProducto },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.listaTablaProdMem();
    });
  }

  //ABRE EL COMPONENTE PARA CREAR UNA NUEVA MEMBRESIA
  openDialogProd(): void {
    const dialogRef = this.dialog.open(AgregarProductoMembresiaComponent, {
      width: "70%",
      disableClose: true,
      data: { name: "¿Para quién es esta membresía?" },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.listaTablaProdMem();
    });

  }

}
