import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  ToastController,
  LoadingController,
  AlertController,
  NavController
} from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthDbService, Habitacion } from '../services/auth-db.service';

@Component({
  selector: 'app-portal-pago',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './portal-pago.page.html',
  styleUrls: ['./portal-pago.page.scss']
})
export class PortalPagoPage implements OnInit {

  // Header/user
  currentEmail: string | null = null;

  // Datos de la reserva recibidos desde "Reservas"
  habitacion: Habitacion | null = null;
  llegada: string | null = null;   // YYYY-MM-DD
  salida: string | null = null;    // YYYY-MM-DD
  noches = 0;
  totalEstadia = 0;

  // Pago
  opcionPago: 'completo' | 'parcial' | '' = '';         // ngModel en radios
  metodoPago: 'transferencia' | 'tarjeta' | '' = '';    // ngModel en segment
  montoAPagar = 0;

  // Transferencia
  comprobanteTransferencia = '';

  // Tarjeta
  tarjetaNumero = '';
  tarjetaNombre = '';
  tarjetaExpiracion = ''; // MM/AA
  tarjetaCVV = '';

  // Form de contacto (reactive)
  contactForm = this.fb.group({
    nombre:   ['', [Validators.required, Validators.minLength(2)]],
    email:    ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{7,}$/)]],
  });

  constructor(
    private db: AuthDbService,
    private fb: FormBuilder,
    private toast: ToastController,
    private loading: LoadingController,
    private alert: AlertController,
    private nav: NavController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.db.init();

    // Sesión
    this.currentEmail = this.db.getSessionEmail();
    if (!this.currentEmail) {
      this.nav.navigateRoot('/login');
      return;
    }

    // Recibir state desde /reservas
    const state = this.router.getCurrentNavigation()?.extras?.state as any || history.state;
    const roomId: number | undefined = state?.roomId;
    this.llegada = state?.llegada || null;
    this.salida  = state?.salida  || null;
    this.noches  = Number(state?.noches || 0);

    // Buscar habitación
    const rooms = this.db.listRooms?.() || [];
    this.habitacion = rooms.find((r: Habitacion) => r.id === roomId) || null;

    if (!this.habitacion || !this.llegada || !this.salida || this.noches <= 0) {
      await this.msg('Datos de la reserva incompletos. Vuelve a Reservas.');
      this.nav.navigateBack('/reservas');
      return;
    }

    this.totalEstadia = this.habitacion.precioNoche * this.noches;

    // Valores por defecto de pago
    this.opcionPago = 'completo';
    this.calcularPago();           // setea montoAPagar
    this.metodoPago = 'transferencia';
  }

  /* ============ UI helpers ============ */
  currency(v?: number | null) {
    const n = Number(v ?? 0);
    return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  }

  async msg(text: string, color: 'danger' | 'success' | 'medium' = 'danger') {
    (await this.toast.create({ message: text, duration: 2000, color, position: 'bottom' })).present();
  }

  logout(ev?: Event) {
    ev?.preventDefault();
    this.db.logout();
    this.nav.navigateRoot('/login');
  }

  /* ============ Pago / Validaciones ============ */
  calcularPago() {
    if (!this.habitacion) { this.montoAPagar = 0; return; }
    if (this.opcionPago === 'parcial') {
      this.montoAPagar = Math.round(this.totalEstadia * 0.3);
    } else {
      this.montoAPagar = this.totalEstadia;
    }
    // Si el usuario eligió una opción de pago y no hay método seleccionado aún, por defecto transferencia
    if (this.opcionPago && !this.metodoPago) this.metodoPago = 'transferencia';
  }

  formularioValido(): boolean {
    // Contacto
    if (!this.contactForm.valid) return false;

    // Fechas y habitación
    if (!this.habitacion || !this.llegada || !this.salida || this.noches <= 0) return false;

    // Opción de pago y método
    if (!this.opcionPago || !this.metodoPago) return false;

    // Campos de método
    if (this.metodoPago === 'transferencia') {
      if (!this.comprobanteTransferencia.trim()) return false;
    } else if (this.metodoPago === 'tarjeta') {
      if (!/^\d{13,19}$/.test(this.tarjetaNumero.replace(/\s/g, ''))) return false;
      if (this.tarjetaNombre.trim().length < 2) return false;
      if (!/^\d{2}\/\d{2}$/.test(this.tarjetaExpiracion)) return false; // MM/AA simple
      if (!/^\d{3,4}$/.test(this.tarjetaCVV)) return false;
    }

    return true;
    // Nota: Disponibilidad final se revalida en confirmarPago()
  }

  async confirmarPago() {
    if (!this.formularioValido()) {
      return this.msg('Revisa los campos obligatorios.');
    }
    const loading = await this.loading.create({ message: 'Procesando pago…' });
    await loading.present();

    try {
      // Revalidar disponibilidad antes de crear la reserva (concurrencia básica)
      const hab = this.habitacion!;
      const ok = this.db.isRangeAvailable(hab.id, this.llegada!, this.salida!);
      if (!ok) throw new Error('La habitación ya no está disponible en esas fechas.');

      // Crear reserva
      this.db.addReservation({
        email: this.currentEmail!,
        habitacionId: hab.id,
        nombreHabitacion: hab.nombre,
        tipo: hab.tipo,
        llegada: this.llegada!,
        salida: this.salida!,
        noches: this.noches,
        precioNoche: hab.precioNoche,
        total: this.totalEstadia
      });

      await loading.dismiss();
      const done = await this.alert.create({
        header: 'Pago confirmado',
        message: 'Tu reserva fue generada con éxito. Recibirás un correo con el detalle.',
        buttons: [{ text: 'Ir a Perfil', handler: () => this.nav.navigateRoot('/perfil') }]
      });
      done.present();

    } catch (e: any) {
      await loading.dismiss();
      const er = await this.alert.create({
        header: 'Error',
        message: e?.message || 'No se pudo completar el pago.',
        buttons: ['OK']
      });
      er.present();
    }
  }
}
