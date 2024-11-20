import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Plan } from "../../models/plan";
import { serviciosService } from "../../service/servicios.service";
import { MensajeEliminarComponent } from "../mensaje-eliminar/mensaje-eliminar.component";
import { GimnasioService } from "../../service/gimnasio.service";
import { AuthService } from "../../service/auth.service";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { ServiceDialogComponent } from "../service-dialog/service-dialog.component";
import { MembresiaService } from "../../service/membresia.service";
import { ToastrService } from 'ngx-toastr';

// REEMPLAZAR POR MARCAS
import { ListaMarcas } from "../../models/marcas";
import { CategoriaService } from "../../service/categoria.service";
import { CrearMarcaComponent } from "../crear-marca/crear-marca.component";

@Component({
  selector: "app-servicios-lista",
  templateUrl: "./servicios-lista.component.html",
  styleUrls: ["./servicios-lista.component.css"],
})
export class ServiciosListaComponent implements OnInit{

  services: any[] = [];
  dataSource: any;
  idGym: number = 0;
  seleccionado: number = 0;
  message: string = "";
  currentUser: string = "";
  confirmButton: boolean = false;
  displayedColumns: string[] = [
    "title",
    "details",
    // "price",
    // "actions",
    // "eliminar",
  ];
  dialogRef: any;
  isLoading: boolean = true;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  habilitarBoton: boolean = false;

  //REEMPLAZAR POR PRODUCTOS
  marcas : any[] = [];
  listMarcaData: ListaMarcas[] = [];
  dataSourceDos: any;

  constructor(
    public dialog: MatDialog,
    private auth: AuthService,
    private ServiciosService: serviciosService,
    private gimnasioService: GimnasioService,
    private membresiaService: MembresiaService,
    private toastr: ToastrService,
    //REEMPLAZAR POR MARCAS
    private categoriaService: CategoriaService
  ) {}

  ngOnInit(): void {
    this.auth.comprobar().subscribe((respuesta)=>{
      this.habilitarBoton = respuesta.status;
    });

    this.currentUser = this.auth.getCurrentUser();
    if (this.currentUser) {
      this.getSSdata(JSON.stringify(this.currentUser));
    }
    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
      // this.listaTabla();
      this.listaTablaMarca();
    });
  }

  loadData() {
    setTimeout(() => {
      this.isLoading = false;
      this.dataSourceDos.paginator = this.paginator;
    }, 1000);
  }

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

  listaTabla() {
    this.gimnasioService.getServicesForId(this.idGym).subscribe((res) => {
        this.services = res;
        if (Array.isArray(this.services)) {
          this.dataSource = new MatTableDataSource(this.services);
          this.loadData();
        } else {
          setTimeout(() => {
            this.isLoading = false;
          }, 1000);
        }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceDos.filter = filterValue.trim().toLowerCase();
  }

  openDialog(): void {
    this.seleccionado = 1;
    this.ServiciosService.seleccionado.next(this.seleccionado);
    this.dialogRef = this.dialog.open(ServiceDialogComponent, {
      width: "70%",
      disableClose: true,
    });

   this.dialogRef.afterClosed().subscribe((result: any) => {
      this.listaTabla();
    });
  }

  editarServicio(idServicio: number) {
    this.seleccionado = 2;
    this.ServiciosService.idService.next(idServicio);
    this.ServiciosService.seleccionado.next(this.seleccionado);
    const dialogRef = this.dialog.open(ServiceDialogComponent, {
      width: "70%",
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.listaTabla();
    });
  }

  borrarSucursal(idGimnasio: any) {
    this.dialog.open(MensajeEliminarComponent,{
      data: `¿Desea eliminar este servicio?`,
    })
    .afterClosed()
    .subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.ServiciosService.deleteService(idGimnasio).subscribe(
          (respuesta) => {
            this.listaTabla();
            this.toastr.success('Registro eliminado exitosamente', 'Exitó', {
              positionClass: 'toast-bottom-left',
            });
          }
        );
      }
    });
  }


  //REEMPLAZAR POR MARCAS

//   listaTablaMarca() {
//     this.categoriaService.obtenerMarcasSer().subscribe((res) => {
//         // Filtrar solo las marcas donde "servicio" es igual a 1 y convertir "marca" a minúsculas
//         this.marcas = res
//             .filter((marcas: any) => marcas.servicio === 1) // Filtrar por servicio = 1
//             .map((marcas: any) => ({
//                 ...marcas,
//                 marca: marcas.marca.toLowerCase() // Convertir el nombre de la marca a minúsculas
//             }));

//         // Asignar las marcas transformadas y filtradas a dataSource
//         this.dataSourceDos = new MatTableDataSource(this.marcas);
//         console.log('Datos de la lista de las marcas: ', this.dataSourceDos);

//         this.loadData();
//     });
// }


  listaTablaMarca() {
    this.categoriaService.obtenerMarcasSer().subscribe((res) => {
          //
          this.marcas = res
            .filter((marcas: any) => marcas.servicio !== null && marcas.servicio !== 0)
            .map((marcas: any) => ({
            ...marcas,
        }));


          // Asignar las marcas transformadas a dataSource
          this.dataSourceDos = new MatTableDataSource(this.marcas);
          console.log('Datos de la lista de las marcas: ', this.dataSourceDos);

          this.loadData();
    });
}

openDialogMar(): void {
  this.seleccionado = 1;
  this.ServiciosService.seleccionado.next(this.seleccionado);
  this.dialogRef = this.dialog.open(CrearMarcaComponent, {
    width: "70%",
    disableClose: true,
  });

 this.dialogRef.afterClosed().subscribe((result: any) => {
    this.listaTablaMarca();
  });
}


}
