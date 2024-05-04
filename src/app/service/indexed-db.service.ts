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
  private AgregarEmpleadoDataTable: Dexie.Table<any, string>;

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
      AgregarEmpleado: '++id,key,data',

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
    this.AgregarEmpleadoDataTable = this.table('AgregarEmpleado');
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
  //return console.log("Eliminados");
}


}
