import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { AuthDbService } from '../services/auth-db.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterLink],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  currentEmail: string | null = null;

  constructor(private auth: AuthDbService, private nav: NavController) {}

  async ngOnInit() {
    // Si usas guards, esto puede ser opcional:
    await this.auth.init?.(); // si el método existe (sólo web también lo tiene)
    this.currentEmail = this.auth.getSessionEmail();

    // Si no hay sesión, envía a login:
    if (!this.currentEmail) this.nav.navigateRoot('/login');
  }

  logout(ev?: Event) {
    ev?.preventDefault();
    this.auth.logout();
    this.nav.navigateRoot('/login');
  }
}
