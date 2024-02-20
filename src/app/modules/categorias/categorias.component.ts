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
    'idCategoria',
    'nombre',
    'descripcion',
    'estatus',
    'fechaCreacion'
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
    this.categoriaService.consultarCategoriaGym(this.idGym).subscribe({
      next: (resultData) => {
        this.categorias = resultData;
        this.dataSource = new MatTableDataSource(this.categorias);
        this.dataSource.paginator = this.paginator;
        this.cargarCategorias();
      }
    });
  }


  cargarCategorias() {
  
    this.categoriaService.consultarCategoriaGym(this.idGym).subscribe({
      next: (resultData) => {
        this.categorias = resultData;
        this.dataSource = new MatTableDataSource(this.categorias);
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


  editarCategoria(idCategoria: string): void {
    const dialogRef = this.dialog.open(EditarCategoriaComponent, {
      width: '60%',
      height: '90%',
      data: { idCategoria: idCategoria },
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
