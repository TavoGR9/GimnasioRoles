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
  }