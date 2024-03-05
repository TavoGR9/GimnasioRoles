import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProductoService } from 'src/app/service/producto.service';
import { listarClientesService } from "src/app/service/listarClientes.service";
import { DetalleVentaService } from 'src/app/service/detalle-venta.service';
//import { detalleVenta } from "../models/detalleVenta";
import { ClienteService } from 'src/app/service/cliente.service';
interface Cliente {
  ID_Cliente: number;
  nombre: string;
 apPaterno: string;
  apMaterno: string;
}

@Component({
  selector: 'app-mensaje-cargando',
  templateUrl: './mensaje-cargando.component.html',
  styleUrls: ['./mensaje-cargando.component.css']
})
export class MensajeListaComponent implements OnInit {
  detalle: any;
  constructor(
    public dialogo: MatDialogRef<MensajeListaComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string,
    private productoService: ProductoService,
    private ListarClientesService:listarClientesService,
    private DetalleVenta: DetalleVentaService,
    private clienteService: ClienteService,
  ) {}

  ngOnInit(): void {
    this.DetalleVenta.obternerVentaDetalle().subscribe({
      next: (resultData) => {
        this.detalle= resultData;
      }
    }) 

    this.obtenerClientesLista();
  }

  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  selectedClient: number | null = null;


  obtenerClientesLista() {
    this.ListarClientesService.obternerCliente().subscribe(
      (data: any) => {
        this.clientes = data as Cliente[]; // Asigna datos si coinciden con la estructura de Cliente[]
        this.clientesFiltrados = this.clientes; // O inicializa con data
      },
      (error: any) => {
        // Manejo de errores si es necesario
      }
    );
  }
  
  filtrarClientes(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value.toLowerCase();
    // Filtra los clientes basándote en el valor de búsqueda
    if (searchValue) {
      this.clientesFiltrados = this.clientes.filter(cliente =>
        `${cliente.nombre} ${cliente.apPaterno} ${cliente.apMaterno}`.toLowerCase().includes(searchValue)
      );
    } else {
      // Si no hay valor de búsqueda, muestra todos los clientes
      this.clientesFiltrados = this.clientes;
    }
  }

  seleccionarCliente(idCliente: number) {
    this.selectedClient = idCliente;
  }

  enviarDatosAlOtroComponente() {
    const dataToSend = {  idCliente: this.selectedClient };
    this.clienteService.sendData(dataToSend);
    this.dialogo.close();
  }

}
