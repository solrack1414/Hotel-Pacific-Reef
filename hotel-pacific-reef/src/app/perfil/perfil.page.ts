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


  ionViewWillEnter() {
    this.email = this.authDb.getSessionEmail();
    if (!this.email) {
      this.nav.navigateRoot('/login');
      return;
    }
    this.load();
  }

  private load() {
    if (!this.email) return;
      const raw = this.authDb.isAdmin(this.email)
    ? this.authDb.listReservations()
    : this.authDb.listReservationsByEmail(this.email);


    

      // Sanea reservas antiguas que no tienen noches/total
    this.reservas = raw.map(r => {
      const llegadaBase = (r.llegada || '').slice(0, 10); // YYYY-MM-DD
      const salidaBase  = (r.salida  || '').slice(0, 10);
      const noches = r.noches ?? this.diffNights(llegadaBase, salidaBase);
      const total  = r.total  ?? (noches * r.precioNoche);
      return { ...r, noches, total };
    });
  }

  private diffNights(startISO: string, endISO: string) {
    if (!startISO || !endISO) return 0;
    const s = new Date(startISO + 'T00:00:00');
    const e = new Date(endISO   + 'T00:00:00');
    const MS = 1000 * 60 * 60 * 24;
    return Math.max(0, Math.round((e.getTime() - s.getTime()) / MS));
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
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.authDb.removeReservation(r.id);
            this.load();
          }
        },
      ]
    });
    await a.present();
  }

  trackById = (_: number, r: Reserva) => r.id;
}
