import { Component, OnInit, ViewChild } from '@angular/core';
import { ListaProductos } from 'src/app/models/listaProductos';
import { ProductoService } from 'src/app/service/producto.service';
import { MatTableDataSource } from '@angular/material/table'; 
import { MatPaginator } from '@angular/material/paginator'; //para paginacion en la tabla
//import { MensajeEliminarComponent } from '../mensaje-eliminar/mensaje-eliminar.component';
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from 'src/app/service/auth.service';
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
    'codigo_de_barra',
    'nombre',
    'descripcion',
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
  ) {
    
  }

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }
  
    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
      this.listaTabla();
      this.actualizarTabla();
      this.cargarProductos();
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
    this.productoService.consultarProductoId(this.idGym).subscribe({
      next: (resultData: any) => {
        if (Array.isArray(resultData) || (resultData && resultData.success === 0)) {
        this.productos = Array.isArray(resultData) ? resultData : [];
        this.dataSource = new MatTableDataSource(this.productos);
        if (this.paginator) {
        this.dataSource.paginator = this.paginator;
        this.cargarProductos();
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

  private cargarProductos() {
    this.productoService.consultarProductoId(this.idGym).subscribe({
      next: (resultData: any) => {

        if (Array.isArray(resultData) || (resultData && resultData.success === 0)) {

        this.productos = Array.isArray(resultData) ? resultData : [];
        this.dataSource = new MatTableDataSource(this.productos);
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
          this.cargarProductos();
          }
        } else {
          console.error('El resultado de consultarCategoriaGym no es un array o tiene success !== 0:', resultData);
        }
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  private actualizarTabla() {
    if (!this.dataSource) {
      // Asegúrate de que this.dataSource esté definido antes de actualizar
      this.cargarProductos();
    } else {
      this.productoService.consultarProductoId(this.idGym).subscribe({
        next: (resultData) => {
          this.productos = resultData;
          this.dataSource.data = this.productos;
        },
        error: (error) => {
          console.error('Error al actualizar categorías:', error);
        }
      });
    }
  }

  crearProducto(): void {
    const dialogRef = this.dialog.open(CrearProductoComponent, {
      width: '65%',
      height: '90%',
      disableClose: true,   
    });
    dialogRef.afterClosed().subscribe(() => {
      this.actualizarTabla();
    });
  }

  editarProducto(idProducto: number): void {
    const dialogRef = this.dialog.open(EditarProductoComponent, {
      width: '65%',
      height: '90%', 
      disableClose: true,  
      data: { idProducto: idProducto }
    });
  
    dialogRef.afterClosed().subscribe(() => {
      this.actualizarTabla();
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
