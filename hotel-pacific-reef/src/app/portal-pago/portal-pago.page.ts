import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonicModule, 
  ToastController, 
  NavController, 
  LoadingController 
} from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthDbService, Reserva } from '../services/auth-db.service';
import { addIcons } from 'ionicons'; // Añadir esta importación
import { sparklesOutline, close, chevronBack, chevronForward } from 'ionicons/icons'; // Añadir estas importaciones

@Component({
  selector: 'app-portal-pago',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  templateUrl: './portal-pago.page.html',
  styleUrls: ['./portal-pago.page.scss'],
})
export class PortalPagoPage implements OnInit {
  // Datos de la reserva
  habitacion: any = null;
  llegada: string = '';
  salida: string = '';
  noches: number = 0;
  totalEstadia: number = 0;
  
  // Formulario de contacto
  contactForm: FormGroup;
  
  // Opciones de pago
  opcionPago: string = 'completo';
  metodoPago: string = 'transferencia';
  montoAPagar: number = 0;
  
  // Datos de transferencia
  comprobanteTransferencia: string = '';
  
  // Datos de tarjeta
  tarjetaNumero: string = '';
  tarjetaNombre: string = '';
  tarjetaExpiracion: string = '';
  tarjetaCVV: string = '';
  
  // Sesión
  currentEmail: string | null = null;

  constructor(
    private nav: NavController,
    private router: Router,
    private formBuilder: FormBuilder,
    private authDb: AuthDbService,
    private toast: ToastController,
    private loadingCtrl: LoadingController
  ) {
    addIcons({ sparklesOutline, close, chevronBack, chevronForward });
    
    this.contactForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required]
    });
  }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as any;
    
    if (state) {
      this.habitacion = state.habitacion;
      this.llegada = state.llegada;
      this.salida = state.salida;
      this.noches = state.noches;
      
      // Add validation for nights calculation
      if (isNaN(this.noches)) {
        const start = new Date(this.llegada);
        const end = new Date(this.salida);
        const timeDiff = end.getTime() - start.getTime();
        this.noches = Math.ceil(timeDiff / (1000 * 3600 * 24));
      }
      
      this.totalEstadia = this.habitacion.precioNoche * this.noches;
      this.calcularPago();
    } else {
      this.nav.navigateBack('/reservas');
      return;
    }
  }

  currency(v: number) {
    return v.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  }

  calcularPago() {
    if (this.opcionPago === 'completo') {
      this.montoAPagar = this.totalEstadia;
    } else {
      this.montoAPagar = Math.round(this.totalEstadia * 0.3); // 30%
    }
  }

  formularioValido(): boolean {
    if (!this.contactForm.valid || !this.opcionPago || !this.metodoPago) {
      return false;
    }
    
    if (this.metodoPago === 'transferencia' && !this.comprobanteTransferencia) {
      return false;
    }
    
    if (this.metodoPago === 'tarjeta' && 
        (!this.tarjetaNumero || !this.tarjetaNombre || !this.tarjetaExpiracion || !this.tarjetaCVV)) {
      return false;
    }
    
    return true;
  }

  async confirmarPago() {
    const loading = await this.loadingCtrl.create({
      message: 'Procesando pago...'
    });
    await loading.present();

    try {
      // Crear objeto de reserva
      const reservaData = {
        email: this.contactForm.value.email,
        habitacionId: this.habitacion.id,
        nombreHabitacion: this.habitacion.nombre,
        tipo: this.habitacion.tipo,
        llegada: this.llegada,
        salida: this.salida,
        noches: this.noches,
        precioNoche: this.habitacion.precioNoche,
        total: this.totalEstadia,
        pagoInicial: this.montoAPagar,
        pagoCompleto: this.opcionPago === 'completo',
        metodoPago: this.metodoPago,
        contacto: this.contactForm.value
      };

      // Guardar reserva (aquí se simula el proceso)
      const reserva = this.authDb.addReservation(reservaData);
      
      // Simular envío de correo
      this.simularEnvioCorreo(reserva);
      
      await loading.dismiss();
      
      // Mostrar mensaje de éxito
      const toast = await this.toast.create({
        message: 'Reserva confirmada. Se ha enviado un correo con los detalles.',
        duration: 3000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
      
      // Redirigir a home o perfil
      this.nav.navigateRoot('/perfil');
      
    } catch (error) {
      await loading.dismiss();
      
      const toast = await this.toast.create({
        message: 'Error al procesar la reserva. Intente nuevamente.',
        duration: 3000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    }
  }

  private simularEnvioCorreo(reserva: Reserva) {
    // En una aplicación real, aquí se conectaría a un servicio de correo
    console.log('Simulando envío de correo para reserva:', reserva);
    console.log('Detalles del correo:');
    console.log('- Para:', this.contactForm.value.email);
    console.log('- Asunto: Confirmación de reserva Hotel Pacific Reef');
    console.log('- Cuerpo:');
    console.log(`Hola ${this.contactForm.value.nombre},`);
    console.log(`Su reserva para ${this.habitacion.nombre} ha sido confirmada.`);
    console.log(`Check-in: ${this.llegada} a las 14:00`);
    console.log(`Check-out: ${this.salida} a las 12:00`);
    console.log(`Total pagado: ${this.montoAPagar.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })}`);
    
    if (this.opcionPago === 'parcial') {
      console.log(`Restante por pagar: ${(this.totalEstadia - this.montoAPagar).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })}`);
    }
  }

  logout(ev?: Event) {
    ev?.preventDefault();
    this.authDb.logout();
    this.nav.navigateRoot('/login');
  }
}