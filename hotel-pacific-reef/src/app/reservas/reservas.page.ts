import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthDbService } from '../services/auth-db.service';

type RoomType = 'basic' | 'medium' | 'premium';

type Habitacion = {
  id: number;
  tipo: RoomType;
  nombre: string;
  precioNoche: number;
  camas: string;
  capacidad: number;
  amenities: string[];
  imgs: string[];
  descripcion: string;
};

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterLink],
  templateUrl: './reservas.page.html',
  styleUrls: ['./reservas.page.scss'],
})
export class ReservasPage implements OnInit {
  currentEmail: string | null = null;


  minDate = '';   
  maxDate = '';     
  llegada: string | null = null; 
  salida: string | null = null;  
  noches = 0;
  errorMsg = '';


  tipoSeleccionado: '' | RoomType = '';
  habitaciones: Habitacion[] = [
    {
      id: 1,
      tipo: 'basic',
      nombre: 'Básica Vista Jardín',
      precioNoche: 45000,
      camas: '1 cama Queen',
      capacidad: 2,
      amenities: ['TV', 'Wi-Fi', 'Baño privado'],
      descripcion:
        'Opción cómoda y funcional con vista al jardín. Ideal para viajeros que buscan buen precio.',
      imgs: [
        'https://a0.muscache.com/im/pictures/prohost-api/Hosting-899191643476107001/original/ecb764ea-4dd1-4ff8-aa83-b9666ab9aece.jpeg?im_w=1200',
        'https://a0.muscache.com/im/pictures/prohost-api/Hosting-899191643476107001/original/d661d19f-1130-4fc0-9869-abb1ff95e718.jpeg?im_w=1440',
        'https://a0.muscache.com/im/pictures/prohost-api/Hosting-899191643476107001/original/20b268aa-20bd-4595-b5a6-d2d711a265eb.jpeg?im_w=1440',
      ],
    },
    {
      id: 2,
      tipo: 'medium',
      nombre: 'Medium Vista Mar Parcial',
      precioNoche: 78000,
      camas: '1 cama King',
      capacidad: 3,
      amenities: ['TV 50”', 'A/C', 'Mini bar', 'Caja fuerte'],
      descripcion:
        'Espacio superior con acabados mejorados y vista parcial al mar. Excelente relación valor/precio.',
      imgs: [
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1200&auto=format&fit=crop',
      ],
    },
    {
      id: 3,
      tipo: 'premium',
      nombre: 'Premium Vista Mar Completa',
      precioNoche: 125000,
      camas: '1 cama King + Sofá cama',
      capacidad: 4,
      amenities: ['Balcón privado', 'A/C', 'Cafetera cápsulas', 'Batas & pantuflas'],
      descripcion:
        'Nuestra mejor categoría: balcón privado frente al océano, terminaciones de lujo y mayor metraje.',
      imgs: [
        'https://a0.muscache.com/im/pictures/prohost-api/Hosting-1060806767856162567/original/8cd2822c-4c58-4b21-82f3-3edf9d462e15.jpeg?im_w=1200',
        'https://a0.muscache.com/im/pictures/prohost-api/Hosting-1060806767856162567/original/e4fa56f5-49ea-4cf7-b0cf-ea7bc6e63857.jpeg?im_w=1440',
        'https://a0.muscache.com/im/pictures/prohost-api/Hosting-1060806767856162567/original/26ed7121-c566-4318-828c-d3ff8001c43c.jpeg?im_w=1440',
      ],
    },
  ];

  filtradas: Habitacion[] = [];

  constructor(
    private authDb: AuthDbService,
    private toast: ToastController,
    private nav: NavController
  ) {}

  async ngOnInit() {
    await this.authDb.init();
    this.currentEmail = this.authDb.getSessionEmail();
    if (!this.currentEmail) {
      this.nav.navigateRoot('/login');
      return;
    }


    const hoy = new Date();
    this.minDate = this.toISO(this.addDays(hoy, 5));
    this.maxDate = this.toISO(this.addDays(hoy, 365));

    this.filtrar();
  }

  logout(ev?: Event) {
    ev?.preventDefault();
    this.authDb.logout();
    this.nav.navigateRoot('/login');
  }


  onFechaChange() {
    this.errorMsg = '';
    this.noches = 0;

    if (this.llegada && this.salida) {
      if (this.llegada >= this.salida) {
        this.errorMsg = 'La salida debe ser posterior a la llegada.';
        return;
      }
      if (this.llegada < this.minDate) {
        this.errorMsg = 'La llegada debe tener al menos 5 días de anticipación.';
        return;
      }

      this.noches = this.diffDays(this.llegada, this.salida);
      if (this.noches <= 0) {
        this.errorMsg = 'La estadía debe ser de al menos 1 noche.';
      }
    }
  }

  filtrar() {
    const t = this.tipoSeleccionado;
    this.filtradas = t ? this.habitaciones.filter(h => h.tipo === t) : this.habitaciones.slice();
  }

  async reservar(h: Habitacion) {
    if (!this.llegada || !this.salida || this.noches <= 0) {
      return this.msg('Selecciona llegada y salida válidas.');
    }
    const email = this.currentEmail!;
    const total = h.precioNoche * this.noches;

    this.authDb.addReservation({
      email,
      habitacionId: h.id,
      nombreHabitacion: h.nombre,
      tipo: h.tipo,
      llegada: this.llegada,
      salida: this.salida,
      noches: this.noches,
      precioNoche: h.precioNoche,
      total
    });

    this.msg('Reserva guardada ✅', 'success');
  }

  private toISO(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  private addDays(base: Date, days: number) {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d;
  }
  private diffDays(isoStart: string, isoEnd: string) {
    const s = new Date(isoStart + 'T00:00:00');
    const e = new Date(isoEnd + 'T00:00:00');
    const MS = 1000 * 60 * 60 * 24;
    return Math.round((e.getTime() - s.getTime()) / MS);
  }
  currency(v: number) {
    return v.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  }

  private async msg(text: string, color: 'danger' | 'success' | 'medium' = 'danger') {
    const t = await this.toast.create({ message: text, duration: 2200, color, position: 'bottom' });
    await t.present();
  }
}
