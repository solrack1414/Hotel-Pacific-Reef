import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage {
  nombreHotel = 'Hotel Pacific';
  email = 'contacto@pacific.cl';
  guardado = false;

  guardar(){
    this.guardado = true;
    setTimeout(()=> this.guardado=false, 1800);
  }
}