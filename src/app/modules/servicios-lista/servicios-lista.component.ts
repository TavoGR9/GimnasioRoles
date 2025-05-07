import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
// import { serviciosService } from "../../service/servicios.service";
import { AuthService } from "../../service/auth.service";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
// import { ToastrService } from 'ngx-toastr';

//REEMPLAZAR POR MARCAS
import { CategoriaService } from "../../service/categoria.service";
import { CrearMarcaComponent } from "../crear-marca/crear-marca.component";
import { EditarMarcaComponent } from "../editar-marca/editar-marca.component";

import { distinctUntilChanged } from 'rxjs/operators';


@Component({
  selector: "app-servicios-lista",
  templateUrl: "./servicios-lista.component.html",
  styleUrls: ["./servicios-lista.component.css"],
})
export class ServiciosListaComponent implements OnInit{

  idGym: number = 0;
  // seleccionado: number = 0;
  message: string = "";
  currentUser: string = "";
  // confirmButton: boolean = false;
  displayedColumns: string[] = [
    "title",
    "details",
    "actions",
    //"eliminar",
  ];
  dialogRef: any;
  isLoading: boolean = true;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  habilitarBoton: boolean = false;

  //REEMPLAZAR POR MARCAS
  marcas : any[] = [];
  dataSourceDos: any;

  constructor(
    public dialog: MatDialog,
    private auth: AuthService,
    // private ServiciosService: serviciosService,
    // private toastr: ToastrService,
    //REEMPLAZAR POR MARCAS
    private categoriaService: CategoriaService
  ) {}

  ngOnInit(): void {
    //COMPRUEBA SI ESTA EN LINEA
    this.auth.comprobar().subscribe((respuesta)=>{
      this.habilitarBoton = respuesta.status;
    });

    //OBTIENE EL USUARIO ACTUAL
    this.currentUser = this.auth.getCurrentUser();
    if (this.currentUser) {
      this.getSSdata(JSON.stringify(this.currentUser));
    }

    //ESCUCHA CAMBIOS DEL idGym Y, SI CAMBIA, RECARGA LOS DATOS DE LAS MARCAS
    this.auth.idGym
    .pipe(distinctUntilChanged())
    .subscribe((data) => {
      this.idGym = data;
      this.listaTablaMarca();
    });
  }

  //REFRESCA LOS DATOS EN LA TABLA Y LE ASOCIA EL PAGINADOR
  loadData() {
    setTimeout(() => {
      // this.listaTablaMarca();
      this.dataSourceDos = new MatTableDataSource(this.marcas);
      this.dataSourceDos.paginator = this.paginator;
      this.isLoading = false;
    }, 1000);
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
      error: (error) => {
        console.log(error);
      },
    });
  }

  //FILTRO DE BUSQUEDA
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceDos.filter = filterValue.trim().toLowerCase();
  }

  //OBTIENE LAS MARCAS Y SE MUESTRAN EN LA TABLA
  listaTablaMarca() {
    this.categoriaService.obtenerMarcasServiciosIdGym2(this.idGym).subscribe((res) => {

      if (res.Productos) {
        this.marcas = res.Productos.filter((marca: any) => marca.servicio !== null && marca.servicio !== 0 && marca.fk_idGimnasio == this.idGym);
        this.dataSourceDos = new MatTableDataSource(this.marcas);
      } else {
        this.marcas = [];
        this.dataSourceDos = new MatTableDataSource(this.marcas);
      }
      this.dataSourceDos.paginator = this.paginator;
      this.loadData();
      //this.isLoading = false;
    }, (error) => {
      this.marcas = [];
      this.dataSourceDos = new MatTableDataSource(this.marcas);
      this.loadData();
      //this.isLoading = false;
    });
  }


  //ABRE EL COMPONENTE PARA CREAR UNA NUEVA MARCA
  openDialogMar(): void {
    // this.seleccionado = 1;
    // this.ServiciosService.seleccionado.next(this.seleccionado);
    this.dialogRef = this.dialog.open(CrearMarcaComponent, {
      width: "70%",
      disableClose: true,
    });

    this.dialogRef.afterClosed().subscribe((result: any) => {
      this.listaTablaMarca();
    });
  }

  //ABRE EL COMPONENTE PARA EDITAR UNA MARCA A TRAVES DEL idMarca
  editarMarcaSer(idMarca: number) {
    const dialogRef = this.dialog.open(EditarMarcaComponent, {
      width: "70%",
      disableClose: true,
      data: { idMarca: idMarca}
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.listaTablaMarca();
    });

  }

  // borrarMarca(id_marcas: any) {
  //   this.dialog.open(MensajeEliminarComponent,{
  //     data: `¿Desea eliminar este servicio?`,
  //   })
  //   .afterClosed()
  //   .subscribe((confirmado: boolean) => {
  //     if (confirmado) {
  //       this.categoriaService.deleteMarcaServ(id_marcas).subscribe(
  //         (respuesta) => {
  //           this.listaTablaMarca();
  //           this.toastr.success('Registro eliminado exitosamente', 'Exitó', {
  //             positionClass: 'toast-bottom-left',
  //           });
  //         }
  //       );
  //     }
  //   });
  // }

}
