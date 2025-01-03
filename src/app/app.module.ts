import { NgModule, isDevMode } from '@angular/core';
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
import { RouterModule } from '@angular/router';
import { AddPasswordComponent } from './components/add-password/reset-password.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Paginator } from './service/Paginator';


@NgModule({
  declarations: [
    AppComponent,
    ForgotPasswordComponent,
    LoginComponent,
    NotFoundComponent,
    ResetPasswordComponent,
    AddPasswordComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    FontAwesomeModule,
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
    ModulesModule,
    RouterModule,
    MatPaginatorModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    {
      provide: MatPaginatorIntl,
      useClass: Paginator
    }
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
