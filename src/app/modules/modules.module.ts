import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModulesRoutingModule } from './modules-routing.module';
import { HomeComponent } from './home/home.component';
import { ReportsComponent } from './reports/reports.component';
import { MembresiasComponent } from './membresias-lista/membresias.component';
import { MensajeEmergentesComponent } from './mensaje-emergentes/mensaje-emergentes.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { EntradasComponent } from './entradas/entradas.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { VerConfiguracionComponent } from './ver-configuracion/ver-configuracion.component';
import { HorariosComponent } from './horarios/horarios.component';
import { ProductosComponent } from './productos/productos.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule, _MatSlideToggleRequiredValidatorModule} from '@angular/material/slide-toggle';
//Modulos fontawesome
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaypal } from '@fortawesome/free-brands-svg-icons';
import { faCheckCircle, faCircleUser, faCreditCard } from '@fortawesome/free-regular-svg-icons';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditarColaboradorComponent } from './editar-colaborador/editar-colaborador.component';
import { AltaColaboradoresComponent } from './alta-colaboradores/alta-colaboradores.component';
import { SucursalListaComponent } from './sucursal-lista/sucursal-lista.component';
import { SucursalAltaComponent } from './sucursal-alta/sucursal-alta.component';
import { SucursalEditarComponent } from './sucursal-editar/sucursal-editar.component';
import { EditarProductoComponent } from './editar-producto/editar-producto.component';
import { ColaboradoresComponent } from './colaboradores/colaboradores.component';
import { HorariosVistaComponent } from './horarios-vista/horarios-vista.component';
import { MensajeEliminarComponent } from './mensaje-eliminar/mensaje-eliminar.component';
import { ListarCategoriaPipe } from '../pipes/listar-categoria.pipe';
import { ListarEmpleadosPipe } from '../pipes/listar-empleados.pipe';
import { ListarSucursalesPipe } from '../pipes/listar-sucursales.pipe';
import { ListarProductoPipe } from '../pipes/listar-producto.pipe';
import { ListaProveedorPipe } from '../pipes/listar-proveedor.pipe';
import { NotificacionesComponent } from './notificaciones/notificaciones.component';
import {ToastModule} from 'primeng/toast';
import {FileUploadModule} from 'primeng/fileupload';
import { HeaderComponent } from './header/header.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RecepMaterialModule } from './recepMaterial';
import { CrearProductoComponent } from './crearProducto/crearProducto.component';
import { EmergenteCargarFotoComponent } from './emergente-cargar-foto/emergente-cargar-foto.component';
import { EmergenteHistorialProductosComponent } from './emergente-historial-productos/emergente-historial-productos.component';
import { EmergenteInfoClienteComponent } from './emergente-info-cliente/emergente-info-cliente.component';
import { FormPagoEmergenteComponent } from './form-pago-emergente/form-pago-emergente.component';
import { InventariosComponent } from './inventarios/inventarios.component';
import { ListaMembresiasPagoEfecComponent } from './lista-membresias-pago-efec/lista-membresias-pago-efec.component';
import { MensajeListaComponent } from './ListaClientes/mensaje-cargando.component';
import { MensajeEmergenteComponent } from './mensaje-emergente/mensaje-emergente.component';
import { RegistroComponent } from './registro/registro.component';
import { VentasComponent } from './ventas/ventas.component';
import { VerCorteComponent } from './ver-corte/ver-corte.component';
import { WebcamModule } from 'ngx-webcam';
import { FiltroNombreProductoPipe } from 'src/app/pipes/filtro-concepto.pipe';
import { FiltroFechaPipe } from 'src/app//pipes/filtro-fecha.pipe';
import { FilterByDatePipe } from 'src/app/pipes/filtroFechas.pipe';
import { ListarProductosPipe } from 'src/app/pipes/lista-proveedor.pipe';
import { ProductosVendidosComponent } from './productos-vendidos/productos-vendidos.component';
import { MensajeDesactivarComponent } from './mensaje-desactivar/mensaje-desactivar.component';
import { RouterModule } from '@angular/router';
import { DialogSelectMembershipComponent } from './dialog-select-membership/dialog-select-membership.component';
import { ServiciosListaComponent } from './servicios-lista/servicios-lista.component';
import { ServiceDialogComponent } from './service-dialog/service-dialog.component';
import { EmergenteAperturaPuertoSerialComponent } from './emergente-apertura-puerto-serial/emergente-apertura-puerto-serial.component';
import { planComponent } from './plan-lista/plan.component';
import { planAgregarComponent } from './plan-agregar/plan-agregar.component';
import { planEditarComponent } from './plan-editar/plan-editar.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
//modulo de spinner
import { NgxSpinnerModule } from "ngx-spinner";
import { ArchivosComponent } from './archivos/archivos.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NgChartsModule } from 'ng2-charts';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AgregarPersonalComponent } from './agregar-personal/agregar-personal.component';


@NgModule({
  declarations: [
    HomeComponent,
    ReportsComponent,
    ColaboradoresComponent,
    EditarColaboradorComponent,
    AltaColaboradoresComponent,
    SucursalListaComponent,
    SucursalAltaComponent,
    SucursalEditarComponent,
    EditarProductoComponent,
    CrearProductoComponent,
    HorariosVistaComponent,
    MensajeEliminarComponent,
    NotificacionesComponent,
    ListarCategoriaPipe,
    ListarEmpleadosPipe,
    ListarSucursalesPipe,
    ListarProductoPipe,
    ListaProveedorPipe,
    MembresiasComponent,
    MensajeEmergentesComponent,
    ConfiguracionComponent,
    EntradasComponent,
    HeaderComponent,
    AdminDashboardComponent,
    VerConfiguracionComponent,
    HorariosComponent,
    ProductosComponent,
    EmergenteCargarFotoComponent,
    EmergenteHistorialProductosComponent,
    EmergenteInfoClienteComponent,
    FormPagoEmergenteComponent,
    InventariosComponent,
    ListaMembresiasPagoEfecComponent,
    MensajeListaComponent,
    MensajeEmergenteComponent,
    RegistroComponent,
    VentasComponent,
    VerCorteComponent,
    FiltroNombreProductoPipe,
    FiltroFechaPipe,
    FilterByDatePipe,
    ListarProductosPipe,
    ProductosVendidosComponent,
    MensajeDesactivarComponent,
    DialogSelectMembershipComponent,
    ServiciosListaComponent,
    ServiceDialogComponent,
    EmergenteAperturaPuertoSerialComponent,
    planComponent,
    planAgregarComponent,
    planEditarComponent,
    ArchivosComponent,
    SidebarComponent,
    AgregarPersonalComponent,
    //InventarioComponent
  ],
  imports: [
    RouterModule,
    CommonModule,
    ModulesRoutingModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    FormsModule,
    MatToolbarModule, //barra de navegacion
    MatDialogModule, // dialogos emergentes
    MatSlideToggleModule,
    _MatSlideToggleRequiredValidatorModule,
    MatRadioModule,//radio botones
    MatButtonToggleModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatButtonModule,
    MatTabsModule, // tabs de material (pestañas)
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatDividerModule,
    MatListModule,
    FlexLayoutModule,
    ToastModule,
    FileUploadModule,
    RecepMaterialModule,
    WebcamModule,
    MatAutocompleteModule,
    MatSidenavModule,
    NgxSpinnerModule.forRoot({ type:'ball-pulse-sync'}),
    NgChartsModule,
    MatProgressSpinnerModule
  ]
})
export class ModulesModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(
      faCircleUser,
      faCreditCard,
      faPaypal,
      faCheckCircle,
      faPowerOff
    );
  }
 }
