import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, NavController, IonInput } from '@ionic/angular';
import { AuthDbService } from '../services/auth-db.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  email = '';
  password = '';
  showPass = false;
  isLoading = false;

  registerOpen = false;
  regEmail = '';
  regPass = '';
  regPass2 = '';
  regShowPass = false;

  @ViewChild('passInput', { static: false }) passInput?: IonInput;

  constructor(
    private auth: AuthDbService,
    private toast: ToastController,
    private nav: NavController
  ) {}

  async ngOnInit() {
    await this.auth.init();
    const logged = this.auth.getSessionEmail();
    if (logged) {
      // si ya está logueado, redirige según rol
      const to = this.auth.isAdmin() ? '/admin' : '/home';
      this.nav.navigateRoot(to);
    }
  }

  async onLogin() {
    if (!this.validEmail(this.email) || !this.password) {
      return this.msg('Completa correo y contraseña válidos.');
    }
    this.isLoading = true;
    try {
      const ok = await this.auth.login(this.email, this.password);
      if (!ok) return this.msg('Credenciales inválidas.');
      this.msg('¡Bienvenido!', 'success');

      // Redirección según rol
      const to = this.auth.isAdmin() ? '/admin' : '/home';
      this.nav.navigateRoot(to);
    } catch (e:any) {
      this.msg(e?.message || 'Error al iniciar sesión.');
    } finally {
      this.isLoading = false;
    }
  }

  fillAdminEmail() {
    this.email = 'admin@pacificreef.cl';
    // enfocar contraseña para escribirla de inmediato
    setTimeout(() => this.passInput?.setFocus(), 0);
  }

  openRegister(ev: Event) { ev.preventDefault(); this.registerOpen = true; }

  async onRegister() {
    if (!this.validEmail(this.regEmail)) return this.msg('Correo inválido.');
    if ((this.regPass || '').length < 6) return this.msg('La contraseña debe tener 6+ caracteres.');
    if (this.regPass !== this.regPass2) return this.msg('Las contraseñas no coinciden.');

    this.isLoading = true;
    try {
      await this.auth.register(this.regEmail, this.regPass);
      this.msg('Cuenta creada. Ahora puedes iniciar sesión.', 'success');
      this.registerOpen = false;
      this.email = this.regEmail;
      this.password = this.regPass;
      this.regEmail = this.regPass = this.regPass2 = '';
    } catch (e:any) {
      this.msg(e?.message || 'No se pudo crear la cuenta.');
    } finally {
      this.isLoading = false;
    }
  }

  forgot(ev: Event) { ev.preventDefault(); this.msg('Recuperación disponible pronto.'); }

  private validEmail(v: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  private async msg(text: string, color: 'danger'|'success'|'medium'='danger') {
    const t = await this.toast.create({ message: text, duration: 1800, color, position: 'bottom' });
    await t.present();
  }
}
