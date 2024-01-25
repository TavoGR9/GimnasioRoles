export class User {
    //represnta una tabla usuarios
    id!: number;
    activo!: number;
    email!: string;
    pass!: string;
  }
  
  export class dataLogin {
    //Respuesta de login
    id!: string;
    rolUser!: string;
    email!: string;
    idGym!: string;
    nombreGym!: string;
  }

  export class listaSucursal {
    id!: string;
    sucursal!: string;
  }