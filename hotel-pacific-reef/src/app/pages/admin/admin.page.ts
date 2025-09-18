import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink],
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss']
})
export class AdminPage {
  cards = [
    { title: 'Usuarios',    icon: 'people-outline', route: '/admin/usuarios', desc: 'Gestionar usuarios registrados' },
    { title: 'Reservas',    icon: 'calendar-outline', route: '/admin/reservas', desc: 'Ver y administrar reservas' },
    { title: 'Habitaciones',icon: 'bed-outline', route: '/admin/habitaciones', desc: 'Editar fotos, precio y disponibilidad' },
    { title: 'Reportes',    icon: 'stats-chart-outline', route: '/admin/reportes', desc: 'Totales por mes y top habitaciones' },
  ];
}