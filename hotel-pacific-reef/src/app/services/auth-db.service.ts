import { Injectable } from '@angular/core';

/* ========= Tipos ========= */
export type RoomType = 'basic' | 'medium' | 'premium';

export type UserRow = {
  email: string;           
  password_hash: string;
  created_at: string;     
  name?: string;
  role?: 'admin' | 'user'; 
};

export type Reserva = {
  id: number;
  email: string;        
  habitacionId: number;
  nombreHabitacion: string;
  tipo: RoomType;
  llegada: string;   
  salida: string;         
  noches: number;
  precioNoche: number;
  total: number;
  createdAt: string;       
};

export type Habitacion = {
  id: number;
  nombre: string;
  tipo: RoomType;
  precioNoche: number;
  disponible: boolean;
  imgs: string[];
  descripcion?: string;
  capacidad?: number;
  camas?: string;
  amenities?: string[];
};


@Injectable({ providedIn: 'root' })
export class AuthDbService {
  private readonly LS_USERS    = 'users_db_v1';
  private readonly LS_SESSION  = 'session_email';
  private readonly LS_RESERVAS = 'reservas_hotel_v1';
  private readonly LS_ROOMS    = 'rooms_hotel_v1';

  /** base de datos para reservas imagenes */
  async init(): Promise<void> {
    if (!localStorage.getItem(this.LS_USERS))    localStorage.setItem(this.LS_USERS, JSON.stringify([]));
    if (!localStorage.getItem(this.LS_RESERVAS)) localStorage.setItem(this.LS_RESERVAS, JSON.stringify([]));
    if (!localStorage.getItem(this.LS_ROOMS)) {
      const seed: Habitacion[] = [
        { id:1, nombre:'Básica Vista Jardín', tipo:'basic',  precioNoche:45000,  disponible:true, imgs:[
          'https://images.unsplash.com/photo-1559599238-0cf17d6d3530?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1551776235-dde6d4829808?q=80&w=1200&auto=format&fit=crop'
        ]},
        { id:2, nombre:'Medium Vista Mar Parcial', tipo:'medium', precioNoche:78000, disponible:true, imgs:[
          'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1200&auto=format&fit=crop'
        ]},
        { id:3, nombre:'Premium Vista Mar Completa', tipo:'premium', precioNoche:125000, disponible:true, imgs:[
          'https://images.unsplash.com/photo-1505691723518-36a5ac3b2bc5?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1505692952047-1a78307da8f3?q=80&w=1200&auto=format&fit=crop'
        ]}
      ];
      localStorage.setItem(this.LS_ROOMS, JSON.stringify(seed));
    }
    await this.seedAdmin(); 
  }

  /** Crea superusuario */
  private async seedAdmin() {
    const users: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    const adminEmail = 'admin@pacificreef.cl';
    if (!users.find(u => u.email === adminEmail)) {
      users.push({
        email: adminEmail,
        name: 'Super Admin',
        role: 'admin',
        password_hash: await this.hash('admin123'),
        created_at: new Date().toISOString()
      });
      localStorage.setItem(this.LS_USERS, JSON.stringify(users));
    }
  }



  async hash(text: string): Promise<string> {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async register(email: string, password: string, name?: string): Promise<void> {
    email = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Correo inválido.');
    if ((password ?? '').length < 6) throw new Error('La contraseña debe tener + de 6 caracteres.');

    const list: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    if (list.find(u => u.email === email)) throw new Error('El correo ya está registrado.');

    list.push({
      email,
      name,
      role: 'user',
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

  logout(): void { localStorage.removeItem(this.LS_SESSION); }

  getSessionEmail(): string | null {
    return localStorage.getItem(this.LS_SESSION);
  }

  isAdmin(email?: string | null): boolean {
    const target = (email ?? this.getSessionEmail() ?? '').toLowerCase();
    const list: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    return !!list.find(u => u.email === target && u.role === 'admin');
  }

  async changePassword(email: string, currentPass: string, newPass: string): Promise<void> {
    email = email.trim().toLowerCase();
    if ((newPass ?? '').length < 6) throw new Error('La nueva contraseña debe tener + de 6 caracteres.');
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
    this.clearReservationsFor(email);
    if (this.getSessionEmail() === email) this.logout();
  }

  /** Lista todos los usuarios*/
  listUsers(): UserRow[] {
    const list: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    return list.sort((a,b)=> a.email.localeCompare(b.email));
  }

  async updateUser(email: string, data: {name?: string; password?: string; role?: 'admin'|'user'}): Promise<void> {
    const list: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    const i = list.findIndex(u => u.email === email.toLowerCase());
    if (i < 0) throw new Error('Usuario no encontrado');
    if (data.name !== undefined) list[i].name = data.name;
    if (data.role) list[i].role = data.role;
    if (data.password) list[i].password_hash = await this.hash(data.password);
    localStorage.setItem(this.LS_USERS, JSON.stringify(list));
  }

  deleteUser(email: string): void {
    const list: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    localStorage.setItem(this.LS_USERS, JSON.stringify(list.filter(u => u.email !== email.toLowerCase())));
    // borra también reservas
    const all: Reserva[] = JSON.parse(localStorage.getItem(this.LS_RESERVAS) || '[]');
    localStorage.setItem(this.LS_RESERVAS, JSON.stringify(all.filter(r => r.email !== email.toLowerCase())));
  }


  /* todas las reservas  */
  listReservations(): Reserva[] {
    const all: Reserva[] = JSON.parse(localStorage.getItem(this.LS_RESERVAS) || '[]');
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /*reservas por usuario */
  listReservationsByEmail(email: string): Reserva[] {
    const key = email.trim().toLowerCase();
    return this.listReservations().filter(r => r.email === key);
  }


  addReservation(data: Omit<Reserva, 'id' | 'createdAt' | 'email'> & { email: string }): Reserva {
    const all = this.listReservations();
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

  /*Elimina una reserva*/
  removeReservation(id: number): void {
    const all = this.listReservations().filter(r => r.id !== id);
    localStorage.setItem(this.LS_RESERVAS, JSON.stringify(all));
  }

  /*Limpia las reservas*/
  clearReservationsFor(email: string): void {
    const key = email.trim().toLowerCase();
    const all = this.listReservations().filter(r => r.email !== key);
    localStorage.setItem(this.LS_RESERVAS, JSON.stringify(all));
  }




  /*HABITACIONES*/
  listRooms(): Habitacion[] {
    const all: Habitacion[] = JSON.parse(localStorage.getItem(this.LS_ROOMS) || '[]');
    return all.sort((a,b)=>a.id-b.id);
  }

  upsertRoom(room: Habitacion): Habitacion {
    const list = this.listRooms();
    const i = list.findIndex(r => r.id === room.id);
    if (i >= 0) {
      list[i] = { ...room };
    } else {
      room.id = (list.reduce((mx, r) => Math.max(mx, r.id), 0) || 0) + 1;
      list.push(room);
    }
    localStorage.setItem(this.LS_ROOMS, JSON.stringify(list));
    return room;
  }

  deleteRoom(id: number): void {
    const list = this.listRooms().filter(r => r.id !== id);
    localStorage.setItem(this.LS_ROOMS, JSON.stringify(list));
  }

  /*REPORTES */

  reportTotalsByMonth(): { mes: string; total: number }[] {
    const map = new Map<string, number>();
    for (const r of this.listReservations()) {
      const mes = (r.llegada || r.createdAt).slice(0, 7);
      map.set(mes, (map.get(mes) || 0) + r.total);
    }
    return [...map.entries()]
      .map(([mes, total]) => ({ mes, total }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }

  /*habitaciones arrendadas*/
  reportTopRooms(limit = 10) {
    const map = new Map<number, { habitacionId: number; nombreHabitacion: string; veces: number }>();
    for (const r of this.listReservations()) {
      const cur = map.get(r.habitacionId) || { habitacionId: r.habitacionId, nombreHabitacion: r.nombreHabitacion, veces: 0 };
      cur.veces++;
      map.set(r.habitacionId, cur);
    }
    return [...map.values()].sort((a, b) => b.veces - a.veces).slice(0, limit);
  }
}
