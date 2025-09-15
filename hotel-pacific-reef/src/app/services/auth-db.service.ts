import { Injectable } from '@angular/core';

/* ========= Tipos ========= */
export type UserRow = {
  email: string;           // PK
  password_hash: string;
  created_at: string;      // ISO
};

export type RoomType = 'basic' | 'medium' | 'premium';

export type Reserva = {
  id: number;
  email: string;           // dueño (normalizado a lower)
  habitacionId: number;
  nombreHabitacion: string;
  tipo: RoomType;
  llegada: string;         // YYYY-MM-DD
  salida: string;          // YYYY-MM-DD
  noches: number;
  precioNoche: number;
  total: number;
  createdAt: string;       // ISO, cuándo se creó la reserva
};

/* ========= Servicio ========= */
@Injectable({ providedIn: 'root' })
export class AuthDbService {
  /* Claves de storage */
  private readonly LS_USERS = 'users_db_v1';
  private readonly LS_SESSION = 'session_email';
  private readonly LS_RESERVAS = 'reservas_hotel_v1';

  /** Inicializa “BD” web. Llama esto una vez (p.ej. en Login/Perfil/Reservas ngOnInit). */
  async init(): Promise<void> {
    if (!localStorage.getItem(this.LS_USERS)) localStorage.setItem(this.LS_USERS, JSON.stringify([]));
    if (!localStorage.getItem(this.LS_RESERVAS)) localStorage.setItem(this.LS_RESERVAS, JSON.stringify([]));
  }

  /* ======== USERS / AUTH ======== */

  /** Hash SHA-256 -> hex */
  async hash(text: string): Promise<string> {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async register(email: string, password: string): Promise<void> {
    email = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Correo inválido.');
    if ((password ?? '').length < 6) throw new Error('La contraseña debe tener 6+ caracteres.');

    const list: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    if (list.find(u => u.email === email)) throw new Error('El correo ya está registrado.');

    list.push({
      email,
      password_hash: await this.hash(password),
      created_at: new Date().toISOString()
    });
    localStorage.setItem(this.LS_USERS, JSON.stringify(list));
  }

  async login(email: string, password: string): Promise<boolean> {
    email = email.trim().toLowerCase();
    const passHash = await this.hash(password);
    const list: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    const row = list.find(u => u.email === email);
    const ok = !!row && row.password_hash === passHash;
    if (ok) localStorage.setItem(this.LS_SESSION, email);
    return ok;
  }

  logout(): void {
    localStorage.removeItem(this.LS_SESSION);
  }

  getSessionEmail(): string | null {
    return localStorage.getItem(this.LS_SESSION);
  }

  async changePassword(email: string, currentPass: string, newPass: string): Promise<void> {
    email = email.trim().toLowerCase();
    if ((newPass ?? '').length < 6) throw new Error('La nueva contraseña debe tener 6+ caracteres.');
    const ok = await this.login(email, currentPass);
    if (!ok) throw new Error('La contraseña actual no es correcta.');
    const list: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    const idx = list.findIndex(u => u.email === email);
    if (idx === -1) throw new Error('Cuenta no encontrada.');
    list[idx].password_hash = await this.hash(newPass);
    localStorage.setItem(this.LS_USERS, JSON.stringify(list));
  }

  async deleteAccount(email: string): Promise<void> {
    email = email.trim().toLowerCase();
    const list: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    localStorage.setItem(this.LS_USERS, JSON.stringify(list.filter(u => u.email !== email)));
    // borra también reservas del usuario
    this.clearReservationsFor(email);
    if (this.getSessionEmail() === email) this.logout();
  }

  /* ======== RESERVAS ======== */

  /** Lista todas las reservas del usuario (ordenadas por fecha de creación desc). */
  listReservationsByEmail(email: string): Reserva[] {
    const all: Reserva[] = JSON.parse(localStorage.getItem(this.LS_RESERVAS) || '[]');
    const key = email.trim().toLowerCase();
    return all
      .filter(r => r.email === key)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /** Agrega una reserva y devuelve la creada (con id). */
  addReservation(data: Omit<Reserva, 'id' | 'createdAt' | 'email'> & { email: string }): Reserva {
    const all: Reserva[] = JSON.parse(localStorage.getItem(this.LS_RESERVAS) || '[]');
    const id = (all.reduce((mx, r) => Math.max(mx, r.id), 0) || 0) + 1;
    const createdAt = new Date().toISOString();
    const email = data.email.trim().toLowerCase();

    const reserva: Reserva = {
      id,
      createdAt,
      email,
      habitacionId: data.habitacionId,
      nombreHabitacion: data.nombreHabitacion,
      tipo: data.tipo,
      llegada: data.llegada,
      salida: data.salida,
      noches: data.noches,
      precioNoche: data.precioNoche,
      total: data.total
    };
    all.unshift(reserva);
    localStorage.setItem(this.LS_RESERVAS, JSON.stringify(all));
    return reserva;
  }

  /** Elimina una reserva por id. */
  removeReservation(id: number): void {
    const all: Reserva[] = JSON.parse(localStorage.getItem(this.LS_RESERVAS) || '[]');
    localStorage.setItem(this.LS_RESERVAS, JSON.stringify(all.filter(r => r.id !== id)));
  }

  /** Limpia todas las reservas de un usuario. */
  clearReservationsFor(email: string): void {
    const all: Reserva[] = JSON.parse(localStorage.getItem(this.LS_RESERVAS) || '[]');
    const key = email.trim().toLowerCase();
    localStorage.setItem(this.LS_RESERVAS, JSON.stringify(all.filter(r => r.email !== key)));
  }
}
