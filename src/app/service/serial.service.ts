import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SerialService {
  async connectAndSendData(): Promise<void> {
    if ('serial' in navigator) {
      try {
        const port = await (navigator as any).serial.requestPort();
        await port.open({ baudRate: 9600 }); // Cambiar 'baudrate' a 'baudRate'
        const writer = port.writable.getWriter();
        await writer.write(new TextEncoder().encode('Hola Mundo'));
        await writer.releaseLock();
        await port.close();
      } catch (err) {
        console.error('Error:', err);
      }
    } else {
      console.error('El API Web Serial no es compatible con este navegador.');
    }
  }
}
