import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],   
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class LoginPage  {
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(private router: Router) {}

  login() {

    this.errorMessage = '';


    if (!this.username || !this.password) {
      this.errorMessage = 'Por favor, ingresa usuario y contraseña';
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      if (this.username === 'admin' && this.password === '1234') {
        this.router.navigate(['/home']);
        
      } else {
        this.errorMessage = 'Usuario o contraseña incorrecta';
      }
      this.isLoading = false;
    }, 1000);
  }
}
