import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

//Componentes
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { LoginComponent } from './components/login/login.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

//Modulos
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastrModule } from 'ngx-toastr';
import { ModulesModule } from './modules/modules.module';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { FiltroNombreProductoPipe } from './pipes/filtro-concepto.pipe';
import { FiltroFechaPipe } from './pipes/filtro-fecha.pipe';
import { FilterByDatePipe } from './pipes/filtroFechas.pipe';
import { ListarProductosPipe } from './pipes/lista-proveedor.pipe';

@NgModule({
  declarations: [
    AppComponent,
    ForgotPasswordComponent,
    LoginComponent,
    NotFoundComponent,
    ResetPasswordComponent,
    FiltroNombreProductoPipe,
    FiltroFechaPipe,
    FilterByDatePipe,
    ListarProductosPipe,
  ],
  imports: [
    ModulesModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({positionClass:'toast-bottom-left'}),
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    NgIf,
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
