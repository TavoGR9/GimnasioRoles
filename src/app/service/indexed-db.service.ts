// indexed-db.service.ts

import { Injectable } from '@angular/core';
import Dexie from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService extends Dexie {
  private receptionistsTable: Dexie.Table<any, number>;
  private userDataTable: Dexie.Table<any, string>;
  private ServiceDataTable: Dexie.Table<any, string>;
  private MembresiaDataTable: Dexie.Table<any, string>;
  private PlanDataTable: Dexie.Table<any, string>;
  private ProductosDataTable: Dexie.Table<any, string>;
  private consultarHomeTable: Dexie.Table<any, string>;
  private AnalyticsDataTable: Dexie.Table<any, string>;
  private RecientesVentasDataTable: Dexie.Table<any, string>;
  private VentasDataTable: Dexie.Table<any, string>;
  private EntradasDataTable: Dexie.Table<any, string>;
  private ProductosVendidosDataTable: Dexie.Table<any, string>;
  private ObtenerActivosDataTable: Dexie.Table<any, string>;
  private InventarioDataTable: Dexie.Table<any, string>;
  private SucursalesDataTable: Dexie.Table<any, string>;

  private Reporte1DataTable: Dexie.Table<any, string>;
  private Reporte2DataTable: Dexie.Table<any, string>;
  private Reporte3DataTable: Dexie.Table<any, string>;

  private AgregarEmpleadoDataTable: Dexie.Table<any, string>;
  /////////////////////////////////
  private AgregarServicioDataTable: Dexie.Table<any, string>;
  private AgregarMembresiaDataTable: Dexie.Table<any, string>;
  private AgregarPlanDataTable: Dexie.Table<any, string>;
  private AgregarRegistroDataTable: Dexie.Table<any, string>;
  private AgregarMemIdDataTable: Dexie.Table<any, string>;
  private AgregarProductoDataTable: Dexie.Table<any, string>;
  private AgregarCategoriaDataTable: Dexie.Table<any, string>;
  private AgregarSubCategoriaDataTable: Dexie.Table<any, string>;
  private AgregarMarcaDataTable: Dexie.Table<any, string>;

  constructor() {
    super('OlimpusGym');
    this.version(1).stores({
      //receptionists: '++id, data',
      receptionists: '++id,key,data',
      userData: '++id,key,data',
      service: '++id,key,data',
      membresia: '++id,key,data',
      Plan: '++id,key,data',
      Productos: '++id,key,data',
      consultarHome: '++id,key,data',
      Analytics: '++id,key,data',
      RecientesVentas: '++id,key,data',
      Ventas: '++id,key,data',
      Entradas: '++id,key,data',
      ProductosVendidos: '++id,key,data',
      ObtenerActivos: '++id,key,data',
      Inventario: '++id,key,data',
      Sucursales: '++id,key,data',

      Reporte1DataTable: '++id,key,data',
      Reporte2DataTable: '++id,key,data',
      Reporte3DataTable: '++id,key,data',

      AgregarEmpleado: '++id,key,data',
      /////////////////////
      AgregarServicio: '++id,key,data',
      AgregarMembresia: '++id,key,data',
      AgregarPlan: '++id,key,data',
      AgregarRegistro: '++id,key,data',
      AgregarMemId: '++id,key,data',
      AgregarProductoId: '++id,key,data',
      AgregarCategoria: '++id,key,data',
      AgregarSubCategoria: '++id,key,data',
      AgregarMarca: '++id,key,data',

    });
    this.receptionistsTable = this.table('receptionists');
    this.userDataTable = this.table('userData');  //Obtener la tabla de DatosStorage Para cargar las pantallas
    this.ServiceDataTable = this.table('service');
    this.MembresiaDataTable = this.table('membresia');
    this.PlanDataTable = this.table('Plan');
    this.ProductosDataTable = this.table('Productos');
    this.consultarHomeTable = this.table('consultarHome');
    this.AnalyticsDataTable = this.table('Analytics');
    this.RecientesVentasDataTable = this.table('RecientesVentas');
    this.VentasDataTable = this.table('Ventas');
    this.EntradasDataTable = this.table("Entradas");
    this.ProductosVendidosDataTable = this.table("ProductosVendidos");
    this.ObtenerActivosDataTable = this.table ("ObtenerActivos");
    this.InventarioDataTable = this.table ('Inventario');
    this.SucursalesDataTable = this.table ('Sucursales');

    this.Reporte1DataTable = this.table ("Reporte1DataTable");
    this.Reporte2DataTable = this.table ('Reporte2DataTable');
    this.Reporte3DataTable = this.table ('Reporte3DataTable');

    this.AgregarEmpleadoDataTable = this.table('AgregarEmpleado');
    /////////////////////
    this.AgregarServicioDataTable = this.table('AgregarServicio');
    this.AgregarMembresiaDataTable = this.table('AgregarMembresia');
    this.AgregarPlanDataTable = this.table('AgregarPlan');
    this.AgregarRegistroDataTable = this.table('AgregarRegistro');
    this.AgregarMemIdDataTable = this.table('AgregarMemId');
    this.AgregarProductoDataTable = this.table('AgregarProductoId');
    this.AgregarCategoriaDataTable = this.table('AgregarCategoria');
    this.AgregarSubCategoriaDataTable = this.table('AgregarSubCategoria');
    this.AgregarMarcaDataTable = this.table('AgregarMarca');
  }

  async saveData(key: string, data: any) {
    await this.receptionistsTable.put({ key, data });
  }

  async getData(key: string) {
    return await this.table('receptionists')
        .where('key')
        .equals(key)
        .toArray();

  }

  async saveUserData(key: string, data: any) {
    await this.userDataTable.put({ key, data });
  }

  async getUserData(key: string) {
    return await this.table('userData')
        .where('key')
        .equals(key)
        .toArray();
  }

  async saveServiceData(key: string, data: any) {
    await this.ServiceDataTable.put({ key, data });
  }

  async getServiceData(key: string) {
    return await this.table('service')
    .where('key')
    .equals(key)
    .toArray();
  }

  async saveSucursalesData(key: string, data: any) {
    await this.SucursalesDataTable.put({ key, data });
  }

  async getSucursalesData(key: string) {
    return await this.table('Sucursales')
    .where('key')
    .equals(key)
    .toArray();
  }

//
  async saveReporte1Data(key: string, data: any) {
    await this.Reporte1DataTable.put({ key, data });
  }

  async getReporte1Data(key: string) {
    return await this.table('Reporte1DataTable')
    .where('key')
    .equals(key)
    .toArray();
  }

  ////
  async saveReporte2Data(key: string, data: any) {
    await this.Reporte2DataTable.put({ key, data });
  }

  async getReporte2Data(key: string) {
    return await this.table('Reporte2DataTable')
    .where('key')
    .equals(key)
    .toArray();
  }
  //
  async saveReporte3Data(key: string, data: any) {
    await this.Reporte3DataTable.put({ key, data });
  }

  async getReporte3Data(key: string) {
    return await this.table('Reporte3DataTable')
    .where('key')
    .equals(key)
    .toArray();
  }
  //

  async saveMembresiaData(key: string, data: any) {
    await this.MembresiaDataTable.put({ key, data });
  }

  async getMembresiaData(key: string) {
    return await this.table('membresia')
        .where('key')
        .equals(key)
        .toArray();
  }

  async savePlanData(key: string, data: any) {
    await this.PlanDataTable.put({ key, data });
  }

  async getPlanData(key: string) {
    return await this.table('Plan')
        .where('key')
        .equals(key)
        .toArray();
}

async saveProductosData(key: string, data: any) {
  await this.ProductosDataTable.put({ key, data });
}

async getProductosData(key: string) {
  return await this.table('Productos')
      .where('key')
      .equals(key)
      .toArray();
}

async saveHomeData(key: string, data: any) {
  await this.consultarHomeTable.put({ key, data });
}

async getHomeData(key: string) {
  return await this.table('consultarHome')
      .where('key')
      .equals(key)
      .toArray();
}

async saveAnalyticsData(key: string, data: any) {
  await this.AnalyticsDataTable.put({ key, data });
}

async getAnalyticsData(key: string) {
  return await this.table('Analytics')
      .where('key')
      .equals(key)
      .toArray();
}

async saveRecientesVentasData(key: string, data: any) {
  await this.RecientesVentasDataTable.put({ key, data });
}

async getRecientesVentasData(key: string) {
  return await this.table('RecientesVentas')
      .where('key')
      .equals(key)
      .toArray();
}

async saveVentasData(key: string, data: any) {
  await this.VentasDataTable.put({ key, data });
}

async getVentasData(key: string) {
  return await this.table('Ventas')
      .where('key')
      .equals(key)
      .toArray();
}

async saveEntradasData(key: string, data: any) {
  await this.EntradasDataTable.put({ key, data });
}

async getEntradasData(key: string) {
  return await this.table('Entradas')
      .where('key')
      .equals(key)
      .toArray();
}

async saveProductosVendidosData(key: string, data: any) {
  await this.ProductosVendidosDataTable.put({ key, data });
}

async getProductosVendidosData(key: string) {
  return await this.table('ProductosVendidos')
      .where('key')
      .equals(key)
      .toArray();
}

async saveObtenerActivosData(key: string, data: any) {
  await this.ObtenerActivosDataTable.put({ key, data });
}

async getObtenerActivosData(key: string) {
  return await this.table('ObtenerActivos')
      .where('key')
      .equals(key)
      .toArray();
}

async saveInventarioData(key: string, data: any) {
  await this.InventarioDataTable.put({ key, data });
}

async getInventarioData(key: string) {
  return await this.table('Inventario')
      .where('key')
      .equals(key)
      .toArray();
}

/////////////////////////////////////////////////////////////

async saveAgregarEmpleadoData(key: string, data: any) {
  await this.AgregarEmpleadoDataTable.put({ key, data });
}

async getAgregarEmpleadoData(key: string) {
  return await this.table('AgregarEmpleado')
      .where('key')
      .equals(key)
      .toArray();
}

async VaciarAgregarEmpleadoData(){
  await this.AgregarEmpleadoDataTable.clear();
}

//servicio

async saveAgregarServicioData(key: string, data: any) {
  await this.AgregarServicioDataTable.put({ key, data });
}

async getAgregarServicioData(key: string) {
  return await this.table('AgregarServicio')
      .where('key')
      .equals(key)
      .toArray();
}

async VaciarAgregarServicioData(){
  await this.AgregarServicioDataTable.clear();
  //return console.log("Eliminados");
}

//membresia
async saveAgregarMembresiaData(key: string, data: any) {
  await this.AgregarMembresiaDataTable.put({ key, data });
}

async getAgregarMembresiaData(key: string) {
  return await this.table('AgregarMembresia')
      .where('key')
      .equals(key)
      .toArray();
}

async VaciarAgregarMembresiaData(){
  await this.AgregarMembresiaDataTable.clear();
  //return console.log("Eliminados");
}


//plan
async saveAgregarPlanData(key: string, data: any) {
  await this.AgregarPlanDataTable.put({ key, data });
}

async getAgregarPlanData(key: string) {
  return await this.table('AgregarPlan')
      .where('key')
      .equals(key)
      .toArray();
}

async VaciarAgregarPlanData(){
  await this.AgregarPlanDataTable.clear();
  //return console.log("Eliminados");
}


//registro
async saveAgregarRegistroData(key: string, data: any) {
  await this.AgregarRegistroDataTable.put({ key, data });
}

async getAgregarRegistroData(key: string) {
  return await this.table('AgregarRegistro')
      .where('key')
      .equals(key)
      .toArray();
}

async VaciarAgregarRegistroData(){
  await this.AgregarRegistroDataTable.clear();
  //return console.log("Eliminados");
}

//membresiasID
async saveMembresiaIdData(key: string, data: any) {
  await this.AgregarMemIdDataTable.put({ key, data });
}

async getMembresiaIdData(key: string) {
  return await this.table('AgregarMemId')
  .where('key')
  .equals(key)
  .toArray();
}


//registro producto
async saveAgregarProductoData(key: string, data: any) {
  await this.AgregarProductoDataTable.put({ key, data });
}

async getAgregarProductoData(key: string) {
  return await this.table('AgregarProductoId')
      .where('key')
      .equals(key)
      .toArray();
}

async VaciarAgregarProductoData(){
  await this.AgregarProductoDataTable.clear();
  //return console.log("Eliminados");
}


//registro categoria
async saveAgregarCategoriaData(key: string, data: any) {
  await this.AgregarCategoriaDataTable.put({ key, data });
}

async getAgregarCategoriaData(key: string) {
  return await this.table('AgregarCategoria')
      .where('key')
      .equals(key)
      .toArray();
}

async VaciarAgregarCategoriaData(){
  await this.AgregarCategoriaDataTable.clear();
  //return console.log("Eliminados");
}

//registro subCategoria
async saveAgregarsubCategoriaData(key: string, data: any) {
  await this.AgregarSubCategoriaDataTable.put({ key, data });
}

async getAgregarsubCategoriaData(key: string) {
  return await this.table('AgregarSubCategoria')
      .where('key')
      .equals(key)
      .toArray();
}

async VaciarAgregarsubCategoriaData(){
  await this.AgregarSubCategoriaDataTable.clear();
  //return console.log("Eliminados");
}

//registro marca
async saveAgregarMarcaData(key: string, data: any) {
  await this.AgregarMarcaDataTable.put({ key, data });
}

async getAgregarMarcaData(key: string) {
  return await this.table('AgregarMarca')
      .where('key')
      .equals(key)
      .toArray();
}

async VaciarAgregarMarcaData(){
  await this.AgregarMarcaDataTable.clear();
  //return console.log("Eliminados");
}

}
