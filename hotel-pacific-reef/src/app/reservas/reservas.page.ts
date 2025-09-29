import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, NavController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthDbService, Habitacion, RoomType } from '../services/auth-db.service';
import { TranslationService } from '../services/translation.service'; // Importar el servicio de traducción
import { TranslatePipe } from '../pipes/translate.pipe'; // Importar el pipe

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterLink, TranslatePipe], // Agregar TranslatePipe
  templateUrl: './reservas.page.html',
  styleUrls: ['./reservas.page.scss'],
})
export class ReservasPage implements OnInit {
  // sesión
  currentEmail: string | null = null;

  // fechas
  minDate = '';
  maxDate = '';
  llegada: string | null = null;  // YYYY-MM-DD
  salida: string | null = null;   // YYYY-MM-DD
  noches = 0;
  errorMsg = '';

  // reglas de horario
  private readonly CHECKIN_HOUR = 14;   // 14:00
  private readonly CHECKOUT_HOUR = 12;  // 12:00

  // filtros
  tipoSeleccionado: '' | RoomType = '';
  soloDisponibles = true;

  // data
  habitaciones: Habitacion[] = [];
  filtradas: Habitacion[] = [];

  // galería por tarjeta
  private fallbackImg = 'https://dummyimage.com/1200x700/eee/aaa&text=Sin+foto';
  selectedIndex: Record<number, number> = {};

  // lightbox
  lightboxOpen = false;
  lightboxImgs: string[] = [];
  lightboxIndex = 0;
  zoomed = false;

  constructor(
    private authDb: AuthDbService,
    private toast: ToastController,
    private nav: NavController,
    private loading: LoadingController,
    private translationService: TranslationService
  ) {}

  async ngOnInit() {
    await this.authDb.init();
    this.currentEmail = this.authDb.getSessionEmail();
    if (!this.currentEmail) {
      this.nav.navigateRoot('/login');
      return;
    }

    // fechas: min 5 días desde hoy, max 365 días

    const hoy = new Date();
    this.minDate = this.toISO(this.addDays(hoy, 5));
    this.maxDate = this.toISO(this.addDays(hoy, 365));

    this.habitaciones = this.authDb.listRooms();
    this.filtrar();
  }

  /* ======= Sesión ======= */
  logout(ev?: Event) {
    ev?.preventDefault();
    this.authDb.logout();
    this.nav.navigateRoot('/login');
  }

  /* ======= Fechas / Filtros ======= */
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


    // Calculate nights correctly
    const start = new Date(this.llegada);
    const end = new Date(this.salida);
    const timeDiff = end.getTime() - start.getTime();
    this.noches = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (this.noches <= 0) this.errorMsg = 'La estadía debe ser de al menos 1 noche.';
  }
}

async reservar(h: Habitacion) {
  if (!this.llegada || !this.salida || this.noches <= 0) return this.msg('Selecciona fechas válidas');
  const overlay = await this.loading.create({ message: 'Preparando pago…' });
  await overlay.present();

  // Lleva datos a portal-pago
  await overlay.dismiss();
  this.nav.navigateForward('/portal-pago', {
    state: {
      roomId: h.id,
      llegada: this.llegada,
      salida: this.salida,
      noches: this.noches
    }
  });
}

  // ===== Helpers fechas =====
  private asCheckIn(isoDate: string)  { return `${isoDate}T14:00:00`; }
  private asCheckOut(isoDate: string) { return `${isoDate}T12:00:00`; }

  /** Noches = diferencia de días entre fechas (sin horas) */
  private diffNights(startISO: string, endISO: string) {
    const s = new Date(startISO + 'T00:00:00');
    const e = new Date(endISO   + 'T00:00:00');
    const MS = 1000 * 60 * 60 * 24;
    return Math.max(0, Math.round((e.getTime() - s.getTime()) / MS));
  }

  /** Noches = ceil( (salida 12:00 - llegada 14:00) / 24h ) */
  private calcNoches(isoStart: string, isoEnd: string): number {
    const inDate  = this.composeLocal(isoStart, this.CHECKIN_HOUR, 0);
    const outDate = this.composeLocal(isoEnd,   this.CHECKOUT_HOUR, 0);
    const diffMs = outDate.getTime() - inDate.getTime();
    const dayMs = 1000 * 60 * 60 * 24;
    // si el usuario eligió días consecutivos: 22h -> ceil = 1 noche
    return Math.max(0, Math.ceil(diffMs / dayMs));
  }

  /** Construye Date local a partir de YYYY-MM-DD y hora:minuto */
  private composeLocal(iso: string, hour: number, minute: number): Date {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, (m - 1), d, hour, minute, 0);
  }

filtrar() {
  let list = this.habitaciones.slice();

  if (this.tipoSeleccionado) {
    list = list.filter(h => h.tipo === this.tipoSeleccionado);
  }
  if (this.soloDisponibles && this.llegada && this.salida) {
    list = list.filter(h => this.authDb.isRangeAvailable(h.id, this.llegada!, this.salida!));
  }

  this.filtradas = list;
}

  /* ======= Reserva ======= */


  /* ======= Galería (tarjeta) ======= */
  getIndex(h: Habitacion): number {
    const i = this.selectedIndex[h.id];
    return typeof i === 'number' ? i : 0;
  }

  getCover(h: Habitacion): string {
    const imgs = h.imgs || [];
    const i = this.getIndex(h);
    return imgs.length ? imgs[i] : this.fallbackImg;
  }

  showImg(h: Habitacion, i: number): void {
    this.selectedIndex[h.id] = i;
  }

  /* ======= Lightbox ======= */
  openLightbox(h: Habitacion, startIndex = 0): void {
    this.lightboxImgs = (h.imgs && h.imgs.length) ? h.imgs : [this.fallbackImg];
    this.lightboxIndex = Math.min(Math.max(startIndex, 0), this.lightboxImgs.length - 1);
    this.zoomed = false;
    this.lightboxOpen = true;
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
    this.zoomed = false;
  }

  next(): void {
    if (!this.lightboxImgs?.length) return;
    this.lightboxIndex = (this.lightboxIndex + 1) % this.lightboxImgs.length;
    this.zoomed = false;
  }

  prev(): void {
    if (!this.lightboxImgs?.length) return;
    this.lightboxIndex = (this.lightboxIndex - 1 + this.lightboxImgs.length) % this.lightboxImgs.length;
    this.zoomed = false;
  }

  toggleZoom(): void {
    this.zoomed = !this.zoomed;
  }

  /* ======= Helpers ======= */
  private toISO(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  private addDays(base: Date, days: number) {
    const d = new Date(base); d.setDate(d.getDate() + days); return d;
  }

  currency(v: number) {
    return v.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  }
  private async msg(text: string, color: 'danger' | 'success' | 'medium' = 'danger') {
    (await this.toast.create({ message: text, duration: 2200, color, position: 'bottom' })).present();
  }
}
