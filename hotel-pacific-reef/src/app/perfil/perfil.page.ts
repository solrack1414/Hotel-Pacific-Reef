import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, AlertController } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { AuthDbService, Reserva } from '../services/auth-db.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink],
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss']
})
export class PerfilPage implements OnInit {
  email: string | null = null;
  reservas: Reserva[] = [];

  constructor(
    private authDb: AuthDbService,
    private nav: NavController,
    private alert: AlertController
  ) {}

  async ngOnInit() {
    await this.authDb.init();
    this.email = this.authDb.getSessionEmail();
    if (!this.email) {
      this.nav.navigateRoot('/login');
      return;
    }
    this.load();
  }

  load() {
    if (!this.email) return;
    this.reservas = this.authDb.listReservationsByEmail(this.email);
  }

  currency(v: number) {
    return v.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  }

  logout(ev?: Event) {
    ev?.preventDefault();
    this.authDb.logout();
    this.nav.navigateRoot('/login');
  }

  async borrarReserva(r: Reserva) {
    const a = await this.alert.create({
      header: 'Eliminar reserva',
      message: `¿Eliminar la reserva #${r.id} de "${r.nombreHabitacion}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => {
          this.authDb.removeReservation(r.id);
          this.load();
        }},
      ]
    });
    await a.present();
  }
}
