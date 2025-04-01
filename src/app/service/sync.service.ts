import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrlService } from './api-url.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {

  //private localApiUrl = 'http://localhost/serviciosGimnasio/sync.php';
  // private localApiUrl = 'http://localhost/gimnasioServicios/sync.php';
  
  
 // private localApiUrl = 'http://localhost/serviciosGym/sync.php'
 // private remoteApiUrl = 'https://olympus.arvispace.com/olimpusGym/conf/sync.php';
 private localApiUrl: string; // URL de la API local
 private remoteApiUrl: string; // URL de la API remota


  constructor(private http: HttpClient,
              private apiUrlService: ApiUrlService) {
     this.localApiUrl = this.apiUrlService.getBaseUrl() + '/sync.php'; // Obtiene la URL de la API desde el servicio ApiUrlService
     this.remoteApiUrl = this.apiUrlService.getBaseUrl() + 'sync.php'; // Obtiene la URL de la API desde el servicio ApiUrlService
  }
 

  getLocalUsers(): Observable<any> {
    return this.http.get(this.localApiUrl);
  }

  getRemoteUsers(): Observable<any> {
    return this.http.get(this.remoteApiUrl);
  }

  updateLocalUser(user: any): Observable<any> {
    return this.http.post(this.localApiUrl, { usuarios: [user] });
  }

  updateRemoteUser(user: any): Observable<any> {
    return this.http.post(this.remoteApiUrl, { usuarios: [user] });
  }
}
