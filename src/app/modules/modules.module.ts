import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModulesRoutingModule } from './modules-routing.module';
import { HomeComponent } from './home/home.component';
import { ReportsComponent } from './reports/reports.component';

//Modulos Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';import { ColaboradoresComponent } from './colaboradores/colaboradores.component';
import { EditarColaboradorComponent } from './editar-colaborador/editar-colaborador.component';
import { AltaColaboradoresComponent } from './alta-colaboradores/alta-colaboradores.component';
import { SucursalListaComponent } from './sucursal-lista/sucursal-lista.component';
import { SucursalAltaComponent } from './sucursal-alta/sucursal-alta.component';
import { SucursalEditarComponent } from './sucursal-editar/sucursal-editar.component';
import { ListaCategoriaComponent } from './lista-categoria/lista-categoria.component';
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
    ReportsComponent,
    ColaboradoresComponent,
    EditarColaboradorComponent,
    AltaColaboradoresComponent,
    SucursalListaComponent,
    SucursalAltaComponent,
    SucursalEditarComponent,
    ListaCategoriaComponent,
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
    MatListModule   
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
