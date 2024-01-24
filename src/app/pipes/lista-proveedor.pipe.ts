import { Pipe, PipeTransform } from '@angular/core';
import { ProductoVenta } from '../models/productoVenta';

@Pipe({
  name: 'listarProductos'
})
export class ListarProductosPipe implements PipeTransform {

  transform(producto: ProductoVenta[] | undefined, page: number = 0, search: string = ''): ProductoVenta[] {
    if (!producto) {
      return [];
    }
  

    if (search.length === 0) {
      return producto.slice(page, page + 5);
    }

  
  const filteredPokemons = producto.filter( Producto => Producto.codigo_de_barra.toLowerCase().includes( search.toLowerCase()) );
  return filteredPokemons.slice(page, page + 5);
  }

}
