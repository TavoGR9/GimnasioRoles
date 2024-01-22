import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { MembresiasAgregarComponent } from './membresias-agregar/membresias-agregar.component';
import { MembresiasComponent } from './membresias-lista/membresias.component';
import { MembresiasEditarComponent } from './membresias-editar/membresias-editar.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { VerConfiguracionComponent } from './ver-configuracion/ver-configuracion.component';
import { EntradasComponent } from './entradas/entradas.component';
import { CategoriasComponent } from './categorias/categorias.component';
import { EditarCategoriaComponent } from './editar-categoria/editar-categoria.component';
import { AltaCategoriaComponent } from './alta-categoria/alta-categoria.component';
import { CrearProductoComponent } from './crearProducto/crearProducto.component';
import { ProductosComponent } from './productos/productos.component';
import { EditarProductoComponent } from './editar-producto/editar-producto.component';


const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'misMembresias', component: MembresiasComponent},
      { path: 'agregarMembresias', component: MembresiasAgregarComponent},
      { path: 'editarMembresias/:id', component: MembresiasEditarComponent},
      { path: 'verConfiguracion', component: VerConfiguracionComponent},
      { path: 'configuracion', component: ConfiguracionComponent},
      { path: 'entradas', component: EntradasComponent },
      { path: 'categorias', component: CategoriasComponent },
      { path: 'alta-categoria', component:AltaCategoriaComponent},
      { path: 'editar-categoria/:id', component:EditarCategoriaComponent},
      { path: 'crearProducto', component:CrearProductoComponent},
      { path: 'productos', component: ProductosComponent },
      { path: 'editar-producto/:id', component:EditarProductoComponent},
     // { path: 'inventario', component: InventarioComponent },
     // { path: 'verConfiguracion', component: VerConfiguracionComponent},
    ],
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModulesRoutingModule { }
