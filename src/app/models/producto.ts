export interface Producto {
    id:number;
    codigo_de_barra: string;
    categoria: string;
    nombre:string;
    tamaño: string;
    descripcion: string;
    precio: number;
    cantidad:number;// es la cantidad de producto que va a salir en la venta
    estatus:string;
    Categoria_idCategoria:string;
    idProducto:string;
  }
  