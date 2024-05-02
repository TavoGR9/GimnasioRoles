import { Component, OnInit, ViewChild } from '@angular/core';
import { ListaProductos } from '../../models/listaProductos';
import { ProductoService } from '../../service/producto.service';
import { MatTableDataSource } from '@angular/material/table'; 
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from '../../service/auth.service';
import { CrearProductoComponent } from '../crearProducto/crearProducto.component';
import { EditarProductoComponent } from '../editar-producto/editar-producto.component';
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

  constructor(
    private productoService: ProductoService,
    private auth: AuthService,
    public dialog: MatDialog,
  ) { 
  }

  ngOnInit(): void {
    // this.productoService.comprobar();
    // this.auth.comprobar();
    // this.categoriaService.comprobar(); 
    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }
    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
      this.listaTabla();
    }); 
  }

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

  listaTabla(){
    this.productoService.consultarAllProducto(this.idGym).subscribe((resultData) => {
      this.productos = resultData
      this.dataSource = new MatTableDataSource(this.productos);
      this.loadData(); 
    });
  }

  loadData() {
    setTimeout(() => {
      this.isLoading = false;
      this.dataSource.paginator = this.paginator;
    }, 1000);
  }

  crearProducto(): void {
    const dialogRef = this.dialog.open(CrearProductoComponent, {
      width: '65%',
      height: '90%',
      disableClose: true,   
    });
    dialogRef.afterClosed().subscribe(() => {
      this.productoService.consultarAllProducto(this.idGym).subscribe({
        next: (resultData: any) => {
          if (Array.isArray(resultData) || (resultData && resultData.success === 0)) {
          this.productos = Array.isArray(resultData) ? resultData : [];
          this.dataSource = new MatTableDataSource(this.productos);
          if (this.paginator) {
          this.dataSource.paginator = this.paginator;
          }
        } else {
          console.error('El resultado de consultarCategoriaGym no es un array o tiene success !== 0:', resultData);
        }
        },
        error: (error) => {
          console.error('Error al consultar categorías:', error);
        }
      });
    })
  }

  editarProducto(idProducto: number): void {
    const dialogRef = this.dialog.open(EditarProductoComponent, {
      data: { idProducto: idProducto },
      width: '65%',
      height: '90%', 
      disableClose: true,  
    });
    dialogRef.afterClosed().subscribe(() => {
      this.productoService.consultarAllProducto(this.idGym).subscribe({
        next: (resultData: any) => {
          if (Array.isArray(resultData) || (resultData && resultData.success === 0)) {
          this.productos = Array.isArray(resultData) ? resultData : [];
          this.dataSource = new MatTableDataSource(this.productos);
          if (this.paginator) {
          this.dataSource.paginator = this.paginator;
          }
        } else {
          console.error('El resultado de consultarCategoriaGym no es un array o tiene success !== 0:', resultData);
        }
        },
        error: (error) => {
          console.error('Error al consultar categorías:', error);
        }
      });
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
 
  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  isRecep(): boolean {
    return this.auth.isRecepcion();
  }
}
