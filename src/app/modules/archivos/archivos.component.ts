import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-archivos',
  templateUrl: './archivos.component.html',
  styleUrls: ['./archivos.component.css']
})
export class ArchivosComponent {
  archivosSeleccionados: File[] = [];
  @ViewChild('archivoInput') archivoInput!: ElementRef;

  constructor() { }

  seleccionarArchivo() {
    this.archivoInput.nativeElement.click();
  }

  onArchivoSeleccionado(event: any): void {
    const archivos: FileList = event.target.files;
    // Agregar cada archivo al arreglo
    for (let i = 0; i < archivos.length; i++) {
      this.archivosSeleccionados.push(archivos[i]);
    }
  }

  guardarArchivos(): void {
    const formData = new FormData();
    this.archivosSeleccionados.forEach(archivo => {
      formData.append('archivos', archivo);
    });

    console.log('arreglo de archivos',this.archivosSeleccionados);
    this.archivosSeleccionados = [];
  }
}
