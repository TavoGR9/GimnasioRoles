import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { VentasComponent } from '../ventas/ventas.component';
import { MatDialog } from "@angular/material/dialog";
import { EntradasComponent } from '../entradas/entradas.component';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  constructor(private auth: AuthService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {}
  
  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  ventas(): void {
    const dialogRef = this.dialog.open(VentasComponent, {
      width: '80%',
      height: '90%',
      
    });
  }

  entradas(): void {
    const dialogRef = this.dialog.open(EntradasComponent, {
      width: '75%',
      height: '90%',
      
    });
  }

   
}
