import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator'; 
import { CategoriaService } from '../../service/categoria.service';
import { Categorias } from 'src/app/models/categorias';
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from 'src/app/service/auth.service';
import { AltaCategoriaComponent } from '../alta-categoria/alta-categoria.component';
import { EditarCategoriaComponent } from '../editar-categoria/editar-categoria.component';
import { MensajeEliminarComponent } from '../mensaje-eliminar/mensaje-eliminar.component';
import { ChangeDetectorRef } from '@angular/core'
@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css'],
})
export class CategoriasComponent implements OnInit {

  currentUser: string = '';
  displayedColumns: string[] = [
    //'idCategoria',
    'Nombre',
    'Descripción',
    'Status',
    'Fecha Creación',
    'Acciones',
    'Activar'
  ];

  public categorias: any;
  categoryData: Categorias[] = [];
  dataSource: any;
  categoriaActiva: boolean = true;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  idGym: number = 0;

  constructor(
  private categoriaService: CategoriaService, 
  private auth: AuthService,
  private cdr: ChangeDetectorRef,
  public dialog: MatDialog) {}

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }
    
    this.auth.idGym.subscribe((data) => {
      this.idGym = data;
      this.listaTabla();
      this.cargarCategorias();
      this.actualizarTabla();
    });  
  }

  listaTabla(){
    this.categoriaService.consultarCategoriaGym(this.idGym).subscribe( resultData => {
      //next: (resultData) => {
        console.log("la lista es: ", resultData);
        if (Array.isArray(resultData) && resultData.length > 0 && resultData[0].msg === 'No hay registros') {
          this.categoryData = [];
          this.dataSource = new MatTableDataSource(this.categoryData);
          this.dataSource.paginator = this.paginator;
          console.log('No hay categorias.');
          //this.toastr.info('No hay clientes activos en este rango de fechas.', 'Info!!!');
        } else if (resultData) {
          this.categoryData = resultData;
          this.dataSource = new MatTableDataSource(this.categoryData);
          this.dataSource.paginator = this.paginator;
          this.cargarCategorias();
        }  
      }, error => {
        console.error('Error en la solicitud:', error);
        // Manejo de errores adicional si es necesario
        this.categoryData = [];
        this.dataSource = new MatTableDataSource(this.categoryData);
        this.dataSource.paginator = this.paginator;
        console.log('Ocurrio un error.');
        //this.toastr.error('Ocurrio un error.', 'Error!!!');
      },
      () => {
        console.log('La solicitud se completó.');
      }
    );
  }


  cargarCategorias() {
  
    this.categoriaService.consultarCategoriaGym(this.idGym).subscribe({
      next: (resultData) => {
        this.categorias = resultData;
        this.dataSource = new MatTableDataSource(this.categorias);     //categorias esta como tipo any, al hacer un registro puede que haya error (tratar cambiarlo por this.categoryData)
        this.dataSource.paginator = this.paginator;
        console.log(resultData, "resultData");
      }
    });
  }
  
  actualizarTabla() {
    if (!this.dataSource) {
      // Asegúrate de que this.dataSource esté definido antes de actualizar
      this.cargarCategorias();
    } else {
      this.categoriaService.consultarCategoriaGym(this.idGym).subscribe({
        next: (resultData) => {
          this.categorias = resultData;
          this.dataSource.data = this.categorias;
        }
      });
    }
  }

  altaCategoria(): void {
    const dialogRef = this.dialog.open(AltaCategoriaComponent, {
      width: '60%',
      height: '90%',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(() => {
      this.actualizarTabla();
    });
  }


  editarCategoria(categoria: any): void {
    const dialogRef = this.dialog.open(EditarCategoriaComponent, {
      width: '60%',
      height: '90%',
      data: { idCategoria: categoria.idCategoria },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(() => {
      this.actualizarTabla();
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  
  toggleCheckbox(id: number, estatus: number) {
    const estadoOriginal = estatus;
    const dialogRef = this.dialog.open(MensajeEliminarComponent, {
      data: `¿Desea cambiar el estatus de la categoría?`, 
    });
    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        // Invierte el estado actual de la categoría
        const nuevoEstado = estatus == 1 ? { estatus: 0 } : { estatus: 1 };
        // Actualiza el estado solo si el usuario confirma en el diálogo
        this.actualizarEstatus(id, nuevoEstado);
      } else {
      }
    });
  }
  
  actualizarEstatus(idMem: number, estado: { estatus: number }) {
    this.categoriaService.updateMembresiaStatus(idMem, estado).subscribe(
      (respuesta) => {
        this.categoriaActiva = estado.estatus == 1;
      },
      (error) => {
      }
    );
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
  
}
