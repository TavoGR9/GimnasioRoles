export interface listaSucursal {
    data: listaSucursal[];
    id_bodega: number;
    nombreBodega: string;
    direccion: string;
    numeroTelefonico: string;  // Cambiado a string si es necesario mantener números de teléfono con caracteres especiales
    latitud: number;
    longitud: number;
    correo: string;
    pass: string;  // Mantener como string para contraseñas
    horaInicio: number;  // Asumiendo que solo son horas, si necesitas minutos o segundos, podrías ajustar el tipo
    horaFin: number;
    precioExpress: number;
    compraMinima: number;
    estatus: number;  // Si es un valor numérico
    foto: string;
  }
  