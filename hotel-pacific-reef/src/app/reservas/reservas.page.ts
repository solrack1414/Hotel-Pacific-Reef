import { Component } from '@angular/core';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.page.html',
  styleUrls: ['./reservas.page.scss'],
  standalone: true
})
export class ReservasPage {
  reservas = [
    { nombre: 'Juan Pérez', fecha: '2025-09-14' },
    { nombre: 'María López', fecha: '2025-09-15' }
  ];
}
