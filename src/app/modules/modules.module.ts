import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModulesRoutingModule } from './modules-routing.module';
import { HomeComponent } from './home/home.component';
import { ColaboradoresComponent } from './colaboradores/colaboradores.component';
import { EditarColaboradorComponent } from './editar-colaborador/editar-colaborador.component';
import { AltaColaboradoresComponent } from './alta-colaboradores/alta-colaboradores.component';
import { SucursalListaComponent } from './sucursal-lista/sucursal-lista.component';
import { SucursalAltaComponent } from './sucursal-alta/sucursal-alta.component';
import { SucursalEditarComponent } from './sucursal-editar/sucursal-editar.component';
import { ListaCategoriaComponent } from './lista-categoria/lista-categoria.component';
import { AltaCategoriaComponent } from './alta-categoria/alta-categoria.component';
import { EditarCategoriaComponent } from './editar-categoria/editar-categoria.component';
import { ListaProductoComponent } from './lista-producto/lista-producto.component';
import { AltaProductoComponent } from './alta-producto/alta-producto.component';
import { EditarProductoComponent } from './editar-producto/editar-producto.component';
import { NotificacionesComponent } from './notificaciones/notificaciones.component';
import { ProductManagementComponent } from './product-management/product-management.component';
import { CrearProductoComponent } from './crear-producto/crear-producto.component';


@NgModule({
  declarations: [
    HomeComponent,
    ColaboradoresComponent,
    EditarColaboradorComponent,
    AltaColaboradoresComponent,
    SucursalListaComponent,
    SucursalAltaComponent,
    SucursalEditarComponent,
    ListaCategoriaComponent,
    AltaCategoriaComponent,
    EditarCategoriaComponent,
    ListaProductoComponent,
    AltaProductoComponent,
    EditarProductoComponent,
    NotificacionesComponent,
    ProductManagementComponent,
    CrearProductoComponent
  ],
  imports: [
    CommonModule,
    ModulesRoutingModule
  ]
})
export class ModulesModule { }
