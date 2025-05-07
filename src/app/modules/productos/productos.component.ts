
import { Component, OnInit, ViewChild } from '@angular/core';
import { ListaProductos } from '../../models/listaProductos';
import { ProductoService } from '../../service/producto.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from '../../service/auth.service';
import { CrearProductoComponent } from '../crearProducto/crearProducto.component';
import { EditarProductoComponent } from '../editar-producto/editar-producto.component';
import { serviciosService } from "../../service/servicios.service";
import { MensajeEliminarComponent } from "../mensaje-eliminar/mensaje-eliminar.component";
@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css'],
})
export class ProductosComponent implements OnInit {
  //titulos de columnas de la tabla
  displayedColumns: string[] = [
    'codigoBarras',
    'nombre',
    'estatus',
    'categoria',
  ];

  productos: any[] = [];
  currentUser: string = '';
  listProductData: ListaProductos[] = [];
  idGym: number = 0;
  dataSource: any;
  productoActiva: boolean = true;
  isLoading: boolean = true;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  habilitarBoton: boolean = false;

  constructor(
    private productoService: ProductoService,
    private auth: AuthService,
    public dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    // this.productoService.comprobar();
    //COMPRUEBA SI ESTA EN LINEA
    this.auth.comprobar().subscribe((respuesta)=>{
      this.habilitarBoton = respuesta.status;
    });

    // this.categoriaService.comprobar();
    //OBTIENE EL USUARIO ACTUAL
    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }

    //LLAMAMOS A LA LISTA DE PRODUCTOS SI HAY UN idGym VALIDO
    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
      this.listaTabla();
    });
  }

  //CONSULTA LOS DATOS DEL USUARIO LOGUEADO
  getSSdata(data: any){
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
          this.auth.role.next(resultData.rolUser);
          this.auth.idUser.next(resultData.clave);
          this.auth.idGym.next(resultData.idGym);
          this.auth.nombreGym.next(resultData.direccion);
          this.auth.email.next(resultData.email);
          this.auth.encryptedMail.next(resultData.encryptedMail);
      }, error: (error) => { console.log(error); }
    });
  }

  //OBTIENE LOS PRODUCTOS DE LA BODEGA Y SE MUESTRAN EN LA TABLA
  listaTabla(){
    this.productoService.obternerInventario(this.idGym).subscribe((resultData) => {
      // console.log("TODAS LAS EXISTENCIAS: ", resultData);

      // this.productos = resultData.filter((producto: any) =>
      //   producto.existencia !== null &&
      //   producto.existencia !== '0' &&
      //   producto.membresia !== '1' &&
      //   producto.activo == 1
      // );

      // Ordenar los productos alfabéticamente según presentacionProducto
      // this.productos.sort((a, b) => a.presentacionProducto.localeCompare(b.presentacionProducto));

      this.dataSource = new MatTableDataSource(resultData);
      // console.log("TABLA CON FILTRO: ", this.dataSource);

      this.loadData();
    });
  }

  sortField: string = '';
  sortDirection: string = 'asc';

  //ORDENAR POR COLUMNAS (Actualmente, sólo se ordena por nombreProducto)
  sortData(column: string): void {
    const data = this.dataSource.data;
    if (this.sortField === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = column;
      this.sortDirection = 'asc';
    }
    data.sort((a: any, b:any) => {
      const isAsc = this.sortDirection === 'asc';
      switch (column) {
        case 'nombre': return this.compare(a.nombreProducto, b.nombreProducto, isAsc);
        // Añade más casos según las columnas que tengas
        default: return 0;
      }
    });

    this.dataSource.data = data;
  }

  //AUXILIAR PARA ORDENAR DATOS TIPO STRING O NUMERO
  compare(a: string | number | Date, b: string | number | Date, isAsc: boolean): number {
    if (typeof a === 'string' && typeof b === 'string') {
      // Utiliza localeCompare para comparar cadenas de texto
      return a.localeCompare(b, undefined, { sensitivity: 'base' }) * (isAsc ? 1 : -1);
    }
    // Para otros tipos, utiliza comparación estándar
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

    //SE LE ASOCIA EL PAGINADOR A LA TABLA
  loadData() {
    setTimeout(() => {
      this.isLoading = false;
      this.dataSource.paginator = this.paginator;
    }, 1000);
  }

  //ABRE EL COMPONENTE PARA CREAR UN NUEVO PRODUCTO
  crearProducto(): void {
    const dialogRef = this.dialog.open(CrearProductoComponent, {
      width: '70%',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(() => {
      this.listaTabla();
    })
  }

  //ABRE EL COMPONENTE PARA EDITAR UN PRODUCTO A TRAVES DEL idProducto
  editarProducto(idProducto: number): void {
    const dialogRef = this.dialog.open(EditarProductoComponent, {
      data: { idProducto: idProducto },
      width: '70%',
      disableClose: true,
    });
    // console.log('idProbob: ', idProducto);

    dialogRef.afterClosed().subscribe(() => {
      this.listaTabla();
    });
  }

  //FILTRO DE BUSQUEDA
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  //DETERMINA EL ROL DEL USUARIO PARA MOSTRAR U OCULTAR ACCIONES DEPENDIENDO EL ROL (editar/eliminar)
  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  isRecep(): boolean {
    return this.auth.isRecepcion();
  }

  //ABRE EL COMPONENTE PARA ELIMINAR UN PRODUCTO. Y SE ELIMINA
  deleteProducto(id: any) {
    // console.log('IDProbob: ', id);
    this.dialog.open(MensajeEliminarComponent,{
      data: `¿Desea eliminar este producto?`,
    })
    .afterClosed()
    .subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.productoService.deleteProd(id).subscribe(
          (respuesta) => {
            // console.log('respuesta: ', respuesta);
            this.listaTabla();
          },
          (error) => {
            console.error('Error en la solicitud: ', error);
          }
        );
      } else {
      }
    });
  }

}
