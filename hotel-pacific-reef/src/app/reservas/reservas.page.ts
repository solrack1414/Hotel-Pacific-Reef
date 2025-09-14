import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.page.html',
  styleUrls: ['./reservas.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule  // necesario para *ngFor
  ]
})
export class ReservasPage {
  reservas = [
    { nombre: 'Juan Pérez', fecha: '2025-09-14' },
    { nombre: 'María López', fecha: '2025-09-15' }
  ];
}