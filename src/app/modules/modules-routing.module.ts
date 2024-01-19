import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { MembresiasAgregarComponent } from './membresias-agregar/membresias-agregar.component';
import { MembresiasComponent } from './membresias-lista/membresias.component';
import { MembresiasEditarComponent } from './membresias-editar/membresias-editar.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'misMembresias', component: MembresiasComponent},
      { path: 'agregarMembresias', component: MembresiasAgregarComponent},
      { path: 'editarMembresias/:id', component: MembresiasEditarComponent},
     // { path: 'verConfiguracion', component: VerConfiguracionComponent},
    ],
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModulesRoutingModule { }
