import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../service/producto.service';
import { CategoriaService } from 'src/app/service/categoria.service';
import { CrearProductoLineaComponent } from '../crearProductoLinea/crearProducto.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { EditarProductoLineaComponent } from '../editar-productoLinea/editar-producto.component';

@Component({
  selector: 'app-lista-producto',
  templateUrl: './lista-producto.component.html',
  styleUrls: ['./lista-producto.component.css']
})
export class ListaProductoLineaComponent implements OnInit {
  public productos: any;
  public page: number = 0;
  public search: string = '';
  constructor(private productoService: ProductoService, private categoriaService: CategoriaService,
    public dialog: MatDialog){}

  ngOnInit():void{
    this.productoService.obternerProductoenLinea().subscribe({
      next: (resultData) => {
        this.productos = resultData;
      }
    })
  }
  
  getCategoria(idCategoria: number) {
    this.categoriaService.consultarCategoria(idCategoria).subscribe((categoria) => {
      return categoria.nombre; // Retorna el nombre de la categoría
    });
  }  

  getCategoria1(idCategoria: string): number {
    return parseInt(idCategoria, 10); // Convertir el string a número
  }
  
  getTamano(producto: any): string {
    return producto && producto.tamaño ? producto.tamaño : ''; // Verifica si la propiedad existe y la devuelve, o devuelve una cadena vacía si no existe
  }

  nextPage() {
    this.page += 5;
  }

  prevPage() {
    if ( this.page > 0 )
      this.page -= 5;
  }

  onSearchPokemon( search: string ) {
    this.page = 0;
    this.search = search.toLowerCase();
  }


  AbrirDialogo(): void {
    const dialogRef = this.dialog.open(CrearProductoLineaComponent, {
      width: '60%',
      height: '90%',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(() => {
     
    });
  }

  abrirDialogoEditar(id: any){
    console.log(id, "este es el id que llega");
    const dialogRef = this.dialog.open(EditarProductoLineaComponent, {
      width: '60%',
      height: '90%',
      disableClose: true,
      data: {idProducto: id},
    });

  }
}
