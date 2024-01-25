import { Pipe, PipeTransform } from '@angular/core';
import { Producto } from 'src/app/models/producto';

@Pipe({
  name: 'listarProducto'
})
export class ListarProductoPipe implements PipeTransform {

  transform(productos: Producto[] | undefined ,page: number = 0, search: string = ''): Producto[] {
    if (!productos) {
      return [];
    }

    if ( search.length === 0 )
    return productos.slice(page, page + 5);
  
  const filteredPokemons = productos.filter( producto => producto.nombre.toLowerCase().includes(search.toLowerCase()) );
  return filteredPokemons.slice(page, page + 5);
  }


}
