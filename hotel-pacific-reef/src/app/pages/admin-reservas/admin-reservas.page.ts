import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthDbService, Reserva } from '../../services/auth-db.service';

@Component({
  selector: 'app-admin-reservas',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterLink],
  templateUrl: './admin-reservas.page.html',
  styleUrls: ['./admin-reservas.page.scss']
})
export class AdminReservasPage implements OnInit {
  reservas: Reserva[] = [];
  view: Reserva[] = [];
  q = '';                
  mes = '';            
  mesesDisponibles: string[] = []; 
  authDb: any;

  constructor(
    private db: AuthDbService,
    private alert: AlertController,
    private toast: ToastController
  ) {}

  async ngOnInit() {
    await this.db.init();
    this.load();
  }

  load() {
    this.reservas = this.db.listReservations();
    const set = new Set<string>();
    for (const r of this.reservas) {
      const m = (r.llegada || r.createdAt).slice(0, 7); 
      set.add(m);
    }
    this.mesesDisponibles = [...set].sort((a,b)=> a.localeCompare(b));
    this.applyFilters();
  }

  applyFilters() {
    const q = (this.q || '').toLowerCase().trim();
    const mes = (this.mes || '').trim();
    this.view = this.reservas.filter(r => {
      const okQ = !q || r.email.toLowerCase().includes(q) || r.nombreHabitacion.toLowerCase().includes(q);
      const okMes = !mes || ((r.llegada || r.createdAt).slice(0, 7) === mes);
      return okQ && okMes;
    });
  }


  del(r: Reserva) {
    this.db.removeReservation(r.id);
    this.ok('Reserva eliminada');
    this.load();
  }
  ok(arg0: string) {
    throw new Error('Method not implemented.');
  }

  totalView(): number {
    return this.view.reduce((acc, r) => acc + (r.total ?? (r.noches * r.precioNoche)), 0);
  }

    totalOf(r: Reserva): number {
    // Si la reserva ya tiene total (>0), úsalo; si no, recalcúlalo
    const noches = this.effectiveNights(r);
    const base = noches * (r.precioNoche || 0);
    return (typeof r.total === 'number' && r.total > 0) ? r.total : base;
  }

  /* ========== Acciones ========== */
  async confirmDelete(r: Reserva) {
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
        }
      ]
    });
    await a.present();
  }
  /* ========== Helpers ========== */
  currency(v: number) {
    return (v ?? 0).toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    });
  }
    effectiveNights(r: Reserva): number {
    // Usa r.noches si es válido; si no, calcula por fechas (check-in 14:00, check-out 12:00 no afecta)
    if (typeof r.noches === 'number' && r.noches > 0) return r.noches;
    return this.diffNights(r.llegada, r.salida);
  }

  private diffNights(isoStart?: string, isoEnd?: string): number {
    if (!isoStart || !isoEnd) return 0;
    const s = new Date(isoStart.slice(0,10) + 'T00:00:00');
    const e = new Date(isoEnd.slice(0,10) + 'T00:00:00');
    const MS = 1000 * 60 * 60 * 24;
    return Math.max(0, Math.round((e.getTime() - s.getTime()) / MS));
  }
    // check-in 14:00 y check-out 12:00 no cambian el conteo de noches
  }


  
