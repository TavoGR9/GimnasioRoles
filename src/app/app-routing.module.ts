import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//Guards
import { authGuard } from './guards/auth.guard';
import { hasRoleGuard } from './guards/has-role.guard';
//Componentes
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { AddPasswordComponent } from './components/add-password/reset-password.component';

//Componentes
const routes: Routes = [
  { path: '', redirectTo: './login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'pass', component: AddPasswordComponent},
  {
    path: 'home',
    canActivate: [authGuard, hasRoleGuard],
    data: {
      rol: 'OlympusGym',
    },
    loadChildren: () =>
      import('./modules/modules.module').then((m) => m.ModulesModule),
  },
  { path: '**', component: NotFoundComponent },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
