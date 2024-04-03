import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { MembresiasComponent } from './membresias-lista/membresias.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { ReportsComponent } from './reports/reports.component';
import { VerConfiguracionComponent } from './ver-configuracion/ver-configuracion.component';
import { EntradasComponent } from './entradas/entradas.component';
import { CrearProductoComponent } from './crearProducto/crearProducto.component';
import { ProductosComponent } from './productos/productos.component';
import { EditarProductoComponent } from './editar-producto/editar-producto.component';
import { ListaMembresiasPagoEfecComponent } from './lista-membresias-pago-efec/lista-membresias-pago-efec.component';
import { InventariosComponent } from './inventarios/inventarios.component';
import { RegistroComponent } from './registro/registro.component';
import { VentasComponent } from './ventas/ventas.component';
import { VerCorteComponent } from './ver-corte/ver-corte.component';
import { ProductosVendidosComponent } from './productos-vendidos/productos-vendidos.component';
import { SucursalListaComponent } from './sucursal-lista/sucursal-lista.component';
import { SucursalEditarComponent } from './sucursal-editar/sucursal-editar.component';
import { SucursalAltaComponent } from './sucursal-alta/sucursal-alta.component';
import { NotificacionesComponent } from './notificaciones/notificaciones.component';
import { RoleGuard } from '../guards/role.guard';
import { ColaboradoresComponent } from './colaboradores/colaboradores.component';
import { ServiciosListaComponent } from './servicios-lista/servicios-lista.component';
import { AltaColaboradoresComponent } from './alta-colaboradores/alta-colaboradores.component';
import { EditarColaboradorComponent } from './editar-colaborador/editar-colaborador.component';
import { planAgregarComponent } from './plan-agregar/plan-agregar.component';
import { planComponent } from './plan-lista/plan.component';
import { planEditarComponent } from './plan-editar/plan-editar.component';
import { ArchivosComponent } from './archivos/archivos.component';
import { EmergenteAperturaPuertoSerialComponent } from './emergente-apertura-puerto-serial/emergente-apertura-puerto-serial.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: '',
        canActivate: [RoleGuard], 
        data: { expectedRole: 'SuperAdmin'},
        children: [
          { path: 'listaSucursales', component:SucursalListaComponent},
          { path: 'alta-sucursal', component:SucursalAltaComponent},
          { path: 'editar-sucursal', component:SucursalEditarComponent},
          { path: 'estadisticas', component: ReportsComponent},
          { path: 'archivos', component: ArchivosComponent},
        ]
      },
      {
        path: '',
        canActivate: [RoleGuard], 
        data: { expectedRole: 'Administrador'},
        children: [
          { path: 'misMembresias', component: MembresiasComponent },
          { path: 'entradas', component: EntradasComponent },
          { path: 'crearProducto', component:CrearProductoComponent},
          { path: 'productos', component: ProductosComponent },
          { path: 'editar-producto/:id', component:EditarProductoComponent},
          { path: 'productosVendidos', component: ProductosVendidosComponent},
          { path: 'notificacion', component:NotificacionesComponent},
          { path: 'reportes', component: ReportsComponent },
          { path: 'verConfiguracion', component: VerConfiguracionComponent},
          { path: 'configuracion', component: ConfiguracionComponent},
          { path: 'inventarios', component: InventariosComponent},
          { path: 'colaboradores', component: ColaboradoresComponent},
          { path: 'misServicios', component: ServiciosListaComponent},
          { path: 'alta-colaborador', component:AltaColaboradoresComponent},
          { path: 'editar-colaborador', component:EditarColaboradorComponent}, 
          { path: 'agregar-plan', component:planAgregarComponent}, 
          { path: 'plan', component:planComponent}, 
          { path: 'editar-plan', component:planEditarComponent},
          { path: 'Ventas', component: VentasComponent},
        ]
      },
      {
        path: '',
        canActivate: [RoleGuard], 
        data: { expectedRole: 'Recepcionista'},
        children: [
          { path: 'listaMembresias', component: ListaMembresiasPagoEfecComponent},
          { path: 'inventarios', component: InventariosComponent},
          { path: 'registrar', component: RegistroComponent},
          { path: 'Ventas', component: VentasComponent},
          { path: 'verCorte', component: VerCorteComponent},
          { path: 'AperturaManual', component: EmergenteAperturaPuertoSerialComponent},
        ]
      },
    ],
    },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModulesRoutingModule { }
