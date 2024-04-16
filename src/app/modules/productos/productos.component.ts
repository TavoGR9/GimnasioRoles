import { Component, OnInit, ViewChild } from '@angular/core';
import { ListaProductos } from '../../models/listaProductos';
import { ProductoService } from '../../service/producto.service';
import { MatTableDataSource } from '@angular/material/table'; 
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from '../../service/auth.service';
import { CrearProductoComponent } from '../crearProducto/crearProducto.component';
import { EditarProductoComponent } from '../editar-producto/editar-producto.component';
import { CategoriaService } from "../../service/categoria.service";
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

  public productos: any;
  currentUser: string = '';
  listProductData: ListaProductos[] = [];
  idGym: number = 0;
  dataSource: any;
  productoActiva: boolean = true;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private productoService: ProductoService,
    private auth: AuthService,
    public dialog: MatDialog,
    private categoriaService: CategoriaService
  ) { 
  }

  ngOnInit(): void {
    this.productoService.comprobar();
    this.auth.comprobar();
    this.categoriaService.comprobar();
  
    setTimeout(() => {
      this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }
      this.auth.idGym.subscribe((data) => {
        this.idGym = data;
        this.listaTabla();
      }); 
    }, 3000);   
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
    this.productoService.consultarProductoId(this.idGym).subscribe({
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
    })
  }

  crearProducto(): void {
    const dialogRef = this.dialog.open(CrearProductoComponent, {
      width: '65%',
      height: '90%',
      disableClose: true,   
    });
    dialogRef.afterClosed().subscribe(() => {
      this.productoService.consultarProductoId(this.idGym).subscribe({
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
          console.error('Error al cargar categorías:', error);
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
      this.productoService.consultarProductoId(this.idGym).subscribe({
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
      })
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
 
  /*  toggleCheckbox(id: number, estatus: number) {
    // Guarda el estado actual en una variable temporal
  console.log("id",id);
    const estadoOriginal = estatus;
    console.log('Estatus actual:', estadoOriginal);
  
    const dialogRef = this.dialog.open(MensajeEliminarComponent, {
      data: `¿Desea cambiar el estatus de la categoría?`, 
    });
  
    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        // Invierte el estado actual de la categoría
        const nuevoEstado = estatus == 1 ? { estatus: 0 } : { estatus: 1 };
        console.log('Nuevo estado:', nuevoEstado);
  
        // Actualiza el estado solo si el usuario confirma en el diálogo
        this.actualizarEstatus(id, nuevoEstado);
        
      } else {
        // Si el usuario cancela, vuelve al estado original
        console.log('Acción cancelada, volviendo al estado original:', estadoOriginal);
        // Puedes decidir si deseas revertir visualmente la interfaz aquí
      }
    });
  }
  actualizarEstatus(id: number, estado: { estatus: number }) {
    console.log(estado.estatus, "nuevo");
    this.productoService.updateProductoStatus(id, estado).subscribe(
      (respuesta) => {
        console.log('Membresía actualizada con éxito:', respuesta);
        this.productoActiva = estado.estatus == 1;
      },
      (error) => {
        console.error('Error al actualizar la membresía:', error);
        // Maneja el error de alguna manera si es necesario.
      }
    );
  }*/
}
