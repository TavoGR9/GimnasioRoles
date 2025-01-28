import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { msgResult } from '../models/empleado';
import { ConnectivityService } from './connectivity.service';
import { IndexedDBService } from './indexed-db.service';
import { catchError, tap } from 'rxjs/operators';
import { forkJoin,of  } from 'rxjs';
import { filter, map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class PagoMembresiaEfectivoService {

  isConnected: boolean = true;

  //API: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  //API: string = 'http://localhost/serviciosGimnasio/';
  // API: string = 'http://localhost/serviciosGym/';
  API: string = 'http://localhost/gimnasioServicios/'

  // APIv2: string = 'https://olympus.arvispace.com/olimpusGym/conf/';
  // APIv3: string = 'http://localhost/olimpusGym/conf/';
  // API: String = '';

  constructor(private clienteHttp:HttpClient, private connectivityService: ConnectivityService, private indexedDBService: IndexedDBService) { }
  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });


  // comprobar(){
  //   this.connectivityService.checkInternetConnectivity().subscribe((isConnected: boolean) => {
  //     this.isConnected = isConnected;
  //     if (isConnected) {
  //       //console.log("La red WiFi tiene acceso a Internet.");
  //       this.API = this.APIv2;
  //     } else {
  //       //console.log("La red WiFi no tiene acceso a Internet.");
  //       this.API = this.APIv3;
  //     }
  //   });
  // }

  // ticketPagoInfo(id:any):Observable<any>{
  //   return this.clienteHttp.get(this.API+"Usuario.php?infoTicketMembresia="+id);
  // }

  obtenerActivos(id:any):Observable<any>{
    return this.clienteHttp.get(this.API+"getClientes3.php?bodegaId="+id).pipe(
      tap(dataResponse => {

        this.saveDataToIndexedDB2(dataResponse);
      }),
      catchError(error => {
        // console.log('Error en API:', error.message || error);
        // console.log('Código de estado:', error.status);
        // console.log('Cargando datos desde IndexedDB debido a error en API:', error);
        return this.getServiceDatos();

        /*const resultData = { success: '2' }; // Objeto que indica éxito
        return forkJoin([
          this.getServiceDatos().pipe(
            filter(data => data !== null)

          ),
          this.getServiceDatosInsert().pipe(

           filter((data: any) => Array.isArray(data)),
            map((data: any[]) => data.map(item => item.data))
          ),
          of(resultData) // Convierte el objeto en un observable
        ]);*/
      })
    );
  }

  private saveDataToIndexedDB2(data: any) {
    // Guarda los datos en IndexedDB
    this.indexedDBService.saveObtenerActivosData('ObtenerActivos', data);
    // console.log("Datos obtenidos")
  }

  getServiceDatos() {
    return new Observable(observer => {
      this.indexedDBService.getObtenerActivosData('ObtenerActivos').then(data => {
        if (data && data.length > 0) {
          let maxId = -1;
          let lastData: any;
          data.forEach((record: any) => {
            if (record.id > maxId) {
              maxId = record.id;
              lastData = record.data;
            }
          });
          observer.next(lastData); // Emitir el último dato encontrado
        } else {
          observer.next(null); // Emitir null si no hay datos en IndexedDB
        }
        observer.complete();
      }).catch(error => {
        observer.error(error); // Emite un error si no se pueden obtener los datos de IndexedDB
      });
    });
  }


  getServiceDatosInsert() {
    return new Observable(observer => {
        this.indexedDBService.getAgregarRegistroData('AgregarRegistro').then(data => {
            observer.next(data); // Emitir los datos obtenidos de IndexedDB
            observer.complete();
        }).catch(error => {
            observer.error(error); // Emitir un error si no se pueden obtener los datos de IndexedDB
        });
    });
}


  // obtenerClientes(inicioDate: any, finDate: any, idGym: any): Observable<any> {
  //   const params = {
  //     GYMid: idGym,
  //     fechaInicio: inicioDate,
  //     fechaFin: finDate
  //   };
  //   return this.clienteHttp.get(this.API + 'Usuario.php', { params });
  // }

  // obtenerTodosLosClientes(inicioDate: any, finDate: any, idGym: any): Observable<any> {
  //   const params = {
  //     idGimnasio: idGym,
  //     fechaInicio: inicioDate,
  //     fechaFin: finDate
  //   };
  //   return this.clienteHttp.get(this.API + 'Usuario.php', { params });
  // }

  membresiasLista(idSucu: any):Observable<any>{
    const params = {
      id_bodega: idSucu
    };
    return this.clienteHttp.get(this.API+"getProductosGym.php?id_bodega=", { params }).pipe(
      tap(dataResponse => {
        this.saveDataToIndexedDB(dataResponse);
        // console.log('params',params)
      }),
      catchError(error => {
        return this.getDataFromIndexedDB();
      })
    );
  }

  getDataFromIndexedDB() {
    // Intenta obtener los datos de IndexedDB
    return new Observable(observer => {
        this.indexedDBService.getMembresiaIdData('AgregarMemId').then(data => {
            if (data && data.length > 0) {
                let maxId = -1;
                let lastData: any;
                data.forEach((record: any) => {
                  if (record.id > maxId) {
                    maxId = record.id;
                    lastData = record.data;
                  }
                });
                observer.next(lastData); // Emitir el último dato encontrado
              } else {
                observer.next(null); // Emitir null si no hay datos en IndexedDB
              }
              observer.complete();
            }).catch(error => {
              observer.error(error); // Emite un error si no se pueden obtener los datos de IndexedDB
            });
        });
    }


  private saveDataToIndexedDB(data: any) {
    // Guarda los datos en IndexedDB
    this.indexedDBService.saveMembresiaIdData('AgregarMemId', data);
  }

  // membresiasInfo(idMemb: any):Observable<any>{
  //   const params = {
  //     id_mem: idMemb
  //   };
  //   return this.clienteHttp.get(this.API+"Usuario.php?infoMembre=", { params });
  // }

  // actualizacionMemebresia(idCli:any,idMem:any, fecha: any, detMemID: any, precio: any, fechaFormateadaFin: any, created_by: any):Observable<any>{
  //   const params = new HttpParams().set('consultClienteId', idCli).set('consultMemId', idMem).set('fechaActual',fecha).set('detMemID',detMemID).set('precio',precio).set('fechaFormateadaFin',fechaFormateadaFin).set('created_by',created_by);
  //   return this.clienteHttp.get(this.API+"Usuario.php", { params });
  // }

  // histoClienteMemb(id:any):Observable<any>{
  //   const params = {
  //     idCliente: id
  //   };
  //   return this.clienteHttp.get(this.API+"Usuario.php?histoCliente=", { params });
  // }

  // deleteMem(id:any):Observable<any>{
  //   const params = {
  //     idMem: id
  //   };
  //   return this.clienteHttp.get(this.API+"Usuario.php?deleteMembresia=", { params });
  // }

deleteMembresia(id: any): Observable<any> {
  const params = { id_pedido: id };
  return this.clienteHttp.get(this.API + 'deletePedido.php', { params })
    .pipe(
      catchError((error) => {
        console.error('Error al eliminar la membresía:', error.message);
        return throwError(() => new Error('Error al procesar la solicitud'));
      })
    );
}


  // actualizaDatosCliente(data: any): Observable<any> {
  //   return this.clienteHttp.post<msgResult>(this.API + "updateCliente_Gym2.php", data).pipe(
  //     catchError(error => {
  //       // Manejo del error
  //       console.error('Error en la actualización de cliente:', error);
  //       return throwError(() => new Error('Hubo un problema al actualizar los datos del cliente.'));
  //     })
  //   );
  // }

  actualizaDatosCliente2(data: any): Observable<any> {
    const url = `${this.API}test_update.php`; // Asegúrate de que this.API esté correctamente configurado
    return this.clienteHttp.post<msgResult>(url, data, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json', // Ajusta según lo que espere tu backend
      }),
    }).pipe(
      catchError(error => {
        console.error('Error en la actualización de cliente:', error); // Muestra el error completo en consola
        return throwError(() => new Error('Hubo un problema al actualizar los datos del cliente.'));
      })
    );
  }


  // deleteService(datos: any): Observable<any>{
  //   return this.clienteHttp.post(this.API+"Usuario.php?eliminarServicio", datos);
  // }


  // Alternativa con correo
  /*
  deleteServiceUsuario(correo: any): Observable<any> {
    return this.clienteHttp
      .get(this.API + "deleteCliente.php?correo=" + correo)
      .pipe(
        catchError((error) => {
          // Manejo de errores
          console.error("Error al intentar eliminar el usuario:", error);
          return throwError(() => new Error("Error en la API: " + error.message));
        })
      );
  }
*/

  //Alternativa con  clave

  deleteServiceUsuario(clave: any): Observable<any> {
    return this.clienteHttp
      .get(this.API + "deleteCliente_test_alternative.php?clave=" + clave)
      .pipe(
        catchError((error) => {
          // Manejo de errores
          console.error("Error al intentar eliminar el usuario:", error);
          return throwError(() => new Error("Error en la API: " + error.message));
        })
      );
  }


  // Actualización del estado del cliente de su membresia (producto)
  // agregarPedido(datos: any):Observable<any>{
  //   return this.clienteHttp.post(this.API+"UsuarioProds.php?insertarPedidoMem=1", datos);
  // }

  // obtenerPedidosActivos(id:any):Observable<any>{
  //   return this.clienteHttp.get(this.API+"UsuarioProds.php?obtenerVista="+id);
  // }

  // ticketPagoInfoPed(id:any):Observable<any>{
  //   return this.clienteHttp.get(this.API+"UsuarioProds.php?infoTicketMembresia="+id);
  // }

  // agregarPedidoConDetalles(pedido: any, detalles: any[]): Observable<any> {
  //   const datos = {
  //     pedido,
  //     detalles
  //   };
  //   return this.clienteHttp.post(this.API + "UsuarioProds.php?insertarPedidoConDetalles", datos).pipe(
  //     catchError(error => {
  //       console.error('Error al registrar el pedido: ', error);
  //       return throwError(error);
  //     })
  //   );
  // }

  // actualizacionMemebresiaProd(idCli:any,idMem:any, fechaActual: any, detMemID: any, precio: any, fechaFormateadaFin: any, created_by: any):Observable<any>{
  //   const params = new HttpParams().set('consultClienteId', idCli).set('consultMemId', idMem).set('fechaActual',fechaActual).set('detMemID',detMemID).set('precio',precio).set('fechaFormateadaFin',fechaFormateadaFin).set('created_by',created_by);
  //   return this.clienteHttp.get(this.API+"UsuarioProds.php", { params });
  // }

  // agregarPedido(datos: any):Observable<any>{
  //   return this.clienteHttp.post(this.API+"UsuarioProds.php?insertarPedido", datos).pipe(
  //     catchError(error => {
  //       console.error('Error al enviar la solicitud: ', error)
  //       return throwError(error);
  //     })
  //   );
  // }

  checkPromoPaquete(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
console.log("datos emnviado en servico",data);
    return this.clienteHttp.post<any>(this.API+"Pago_Membresias_Efectivo2.php", JSON.stringify(data), { headers });
  }



  // Método para obtener los pedidos de membresías por bodega
  getPedidosMembresias(bodega: any): Observable<any> {
    // Configuramos los parámetros para la solicitud GET
    const params = new HttpParams().set('bodega', bodega.toString());

    // Construimos la URL completa para el archivo PHP
    const url = `${this.API}test_pedidos_membresias.php`;

    return this.clienteHttp.get(url, { params }).pipe(
      catchError((error) => {
        console.error('Error al obtener los pedidos de membresías:', error.message);
        return throwError(() => new Error('Error al procesar la solicitud'));
      })
    );
  }



// Función para agrupar por pedido
agruparPorPedido(clientes: any[]): any[] {
  const agrupadosPorPedido: { [key: string]: any } = {};

  clientes.forEach(cliente => {
    const idPedido = cliente.id_pedido;

    if (!agrupadosPorPedido[idPedido]) {
      agrupadosPorPedido[idPedido] = {
        clave: cliente.clave,
        estafeta: cliente.estafeta,
        telefono: cliente.telefono,
        fotoUrl: cliente.fotoUrl,
        Correo: cliente.Correo,
        nombreCompleto: cliente.nombreCompleto,
        fechaRegistro: cliente.fechaRegistro,
        huella: cliente.huella,
        rol: cliente.rol,
        precioPedido: cliente.precioPedido,
        total: cliente.total,
        membresia: cliente.nombrePromocion ?? `${cliente.marca} - ${cliente.nombreProducto}`,
        correoCliente: cliente.correoCliente,
        id_pedido: cliente.id_pedido,
        fecha_hora_pedido: cliente.fecha_hora_pedido,
        id_bodega: cliente.id_bodega,
        precioCompra: cliente.precioCompra,
        conteoPedidos: cliente.conteoPedidos, // Inicia con el valor del primer producto
        estatus: cliente.estatus, // Inicia con el valor del primer producto
        fecha_inicio: cliente.fecha_inicio,
        fecha_caducidad: cliente.fecha_caducidad, // Inicialmente tomamos la fecha
        idPromocion: cliente.idPromocion,
        nombrePromocion: cliente.nombrePromocion,
        productos: [] // Inicializamos un array vacío para los productos
      };
    }

    // Agregamos la información del producto al array productos correspondiente
    agrupadosPorPedido[idPedido].productos.push({
      id_producto: cliente.id_producto,
      marca: cliente.marca,
      nombreProducto: cliente.nombreProducto,
      idProbob: cliente.idProbob,
      estatus: cliente.estatus,
      fecha_inicio: cliente.fecha_inicio,
      fecha_caducidad: cliente.fecha_caducidad,
      conteoPedidos: cliente.conteoPedidos
    });

    // Cambiar el valor de conteoPedidos si algún producto tiene conteoPedidos = 1
    if (cliente.conteoPedidos === 1) {
      agrupadosPorPedido[idPedido].conteoPedidos = 1;
    }

    // Cambiar el valor de estatus si algún producto tiene estatus = '1'
    if (cliente.estatus === '1') {
      agrupadosPorPedido[idPedido].estatus = '1';
    }

    // Comparar las fechas de caducidad para actualizar el valor más alto
    const fechaCliente = new Date(cliente.fecha_caducidad);
    if (!isNaN(fechaCliente.getTime())) {
      const fechaMaxima = new Date(agrupadosPorPedido[idPedido].fecha_caducidad);
      if (!isNaN(fechaMaxima.getTime()) && fechaCliente > fechaMaxima) {
        agrupadosPorPedido[idPedido].fecha_caducidad = cliente.fecha_caducidad;
      }
    }
  });

  // Convertimos el objeto agrupado en un array
  return Object.values(agrupadosPorPedido);
}




}
