import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonDatetime,
  IonButton,
  IonList,
  IonBadge
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle,
    IonContent, IonItem, IonLabel,
    IonDatetime, IonButton, IonList, IonBadge
  ]
})
export class HomePage {
  desde = '';
  hasta = '';

  habitaciones = [
    { tipo: 'Single', precio: 50000, descripcion: 'Habitación para una persona, vista jardín' },
    { tipo: 'Doble', precio: 80000, descripcion: 'Habitación para dos personas, vista mar' },
    { tipo: 'Suite', precio: 150000, descripcion: 'Suite de lujo con terraza privada' },
  ];

  buscar() {
    console.log('Buscando desde', this.desde, 'hasta', this.hasta);
  }

  reservar(h: any) {
    alert(`Reserva confirmada: ${h.tipo}, anticipo 30% = $${h.precio * 0.3}`);
  }
}
