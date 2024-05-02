// indexed-db.service.ts

import { Injectable } from '@angular/core';
import Dexie from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService extends Dexie {
  private receptionistsTable: Dexie.Table<any, number>;
  private userDataTable: Dexie.Table<any, string>;

  constructor() {
    super('OlimpusGym');
    this.version(1).stores({
      //receptionists: '++id, data',
      receptionists: '++id,key,data',
      userData: '++id,key,data' // Assuming 'data' as the property name to store data
    });
    this.receptionistsTable = this.table('receptionists');
    this.userDataTable = this.table('userData');
  }

  async saveData(key: string, data: any) {
    await this.receptionistsTable.put({ key, data });
  }

  async getData(key: string) {
    return await this.receptionistsTable.get({ key });

  }

  async saveUserData(key: string, data: any) {
    await this.userDataTable.put({ key, data });
  }

  async getUserData(key: string) {
    return await this.userDataTable.get({ key });
  }
}
