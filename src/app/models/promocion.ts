
export interface Membresia {
  codigoBarras: string;
  idProbob: number;
  existencia: number;
  marca: string;
  nombreBodega: string;
  nombreCategoria: string;
  nombreProducto: string;
  precio: number;
}

export interface Promocion {
  idChoProm: number;
  estatus: string;
  nombrePromocion: string;
  FechaInicio: Date;
  FechaFin: Date;
  PrecioPaquete: number;
  existencias: number;
  idGym: number;
  membresias: Membresia | Membresia[]; // Permite tanto un objeto como un arreglo de membresías
  plataforma: string;
  preciopv: number;
}
