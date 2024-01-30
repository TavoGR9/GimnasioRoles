import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table'; //para controlar los datos del api y ponerlos en una tabla
import { MatPaginator } from '@angular/material/paginator'; //para paginacion en la tabla
import { CategoriaService } from 'src/app/service/categoria.service';
import { Categorias } from 'src/app/models/categorias';
//import { MensajeEliminarComponent } from '../mensaje-eliminar/mensaje-eliminar.component';
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from 'src/app/service/auth.service';
import { AltaCategoriaComponent } from '../alta-categoria/alta-categoria.component';
import { EditarCategoriaComponent } from '../editar-categoria/editar-categoria.component';
import { MensajeEliminarComponent } from '../mensaje-eliminar/mensaje-eliminar.component';
@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css'],
})
export class CategoriasComponent implements OnInit {
  //titulos de columnas de la tabla
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

  constructor(
  private categoriaService: CategoriaService, 
  private auth: AuthService,
  public dialog: MatDialog) {}

  ngOnInit(): void {
  //  this.categoriaService.consultarCategoriaGym(this.auth.idGym.getValue()).subscribe({
    this.categoriaService.consultarCategoriaGym(1).subscribe({
      next: (resultData) => {
        console.log(resultData);
        this.categorias = resultData;
        this.dataSource = new MatTableDataSource(this.categorias);
        this.dataSource.paginator = this.paginator;
      }
    })
  }

  editarCategoria(idCategoria: string): void {
    const dialogRef = this.dialog.open(EditarCategoriaComponent, {
      width: '60%',
      height: '90%',
      data: { idCategoria: idCategoria },
    });
  }

  /**
   * metodo para filtrar la informacion que escribe el usaurio
   */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  
  toggleCheckbox(id: number, estatus: number) {
    const estadoOriginal = estatus;
    console.log('Estatus actual:', estadoOriginal);
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
    console.log(estado.estatus, "nuevo");
    this.categoriaService.updateMembresiaStatus(idMem, estado).subscribe(
      (respuesta) => {
        this.categoriaActiva = estado.estatus == 1;
      },
      (error) => {
      }
    );
  }

  altaCategoria(): void {
    const dialogRef = this.dialog.open(AltaCategoriaComponent, {
      width: '70%',
      height: '90%',
    });
  }
}
