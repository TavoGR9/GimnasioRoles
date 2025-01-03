import { membresia } from './membresia';
// promocion.model.ts
export interface Membresia {
  codigoBarras: string;
  idProbob: number,
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
  //cantidad: number;
  existencias: number;
  idGym: number;
  //idProbob: number;
  membresias: Membresia[];
  plataforma: string;
  //precio: number;
  preciopv: number;
}
