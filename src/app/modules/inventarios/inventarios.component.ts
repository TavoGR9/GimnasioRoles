import { ChangeDetectionStrategy,Component,OnInit,ViewChild} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ProductoService } from '../../service/producto.service';
import { EmergenteHistorialProductosComponent } from '../emergente-historial-productos/emergente-historial-productos.component';
import { MatDialog} from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../service/auth.service';
import { inventarioService } from '../../service/inventario.service';

@Component({
  selector: 'inventarios',
  templateUrl: './inventarios.component.html',
  styleUrls: ['./inventarios.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventariosComponent implements OnInit {
  displayedColumns: string[] = [
    'Código De Barras',
    'Categoría',
    'Nombre',
    'Cantidad Disponible'
  ];

  listInventarioData: any[] = [];
  dataSource: any; 
  idGym: number = 0;
  currentUser: string = '';
  isLoading: boolean = true; 

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(
    private productoService: ProductoService, 
    private auth: AuthService,
    public dialog: MatDialog,
    private InventarioService: inventarioService,
    private toastr: ToastrService) {}

  ngOnInit(): void {
    this.productoService.comprobar();
    this.InventarioService.comprobar();
    this.auth.comprobar();
    this.currentUser = this.auth.getCurrentUser();
    setTimeout(() => {
      if(this.currentUser){
        this.getSSdata(JSON.stringify(this.currentUser));
      }
      this.auth.idGym.subscribe((data) => {
        this.idGym = data;
        this.listaTablas();
      }); 
    }, 3000); 

    this.loadData();
  }

  loadData() {
    setTimeout(() => {
      // Una vez que los datos se han cargado, establece isLoading en false
      this.isLoading = false;
    }, 3000); // Este valor representa el tiempo de carga simulado en milisegundos
  }

  listaTablas(){
    this.productoService.obternerInventario(this.idGym).subscribe((respuesta) => {
      this.listInventarioData = respuesta;
      this.dataSource= new MatTableDataSource(this.listInventarioData);
      this.dataSource.paginator = this.paginator;
    });
  }

  getSSdata(data: any){
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
          this.auth.role.next(resultData.rolUser);
          this.auth.userId.next(resultData.id);
          this.auth.idGym.next(resultData.idGym);
          this.auth.nombreGym.next(resultData.nombreGym);
          this.auth.email.next(resultData.email);
          this.auth.encryptedMail.next(resultData.encryptedMail);
      }, error: (error) => { console.log(error); }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  abrirHistorial(): void {
    this.dialog.open(EmergenteHistorialProductosComponent, {
      maxWidth: '100%',
      width: 'auto',
    })
    .afterClosed()
    .subscribe((cerrarDialogo: Boolean) => {
      if (cerrarDialogo) {
        
      } else {
        
      }
    });
  }

  getClaseCantidadDisponible(prod: any): string[] {
    const clases: string[] = [];
    if (prod && prod.cantidad_disponible !== undefined) {
       clases.push(prod.cantidad_disponible < 5 ? 'cantidad-disponible-bajo' : 'cantidad-disponible-suficiente');
    }
    return clases;
 }
}
