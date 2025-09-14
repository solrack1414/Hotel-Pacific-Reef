import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

type Habitacion = { id:number; tipo:'single'|'doble'|'suite'; precioNoche:number; };
type Reserva = {
  id:number; habitacionId:number; desde:string; hasta:string;
  noches:number; total:number; anticipo:number; saldo:number;
};

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './reservas.page.html',
  styleUrls: ['./reservas.page.scss'],
})
export class ReservasPage {
  desde = ''; hasta = ''; tipo = '';
  noches = 0;

  rooms: Habitacion[] = [
    { id:101, tipo:'doble', precioNoche:65000 },
    { id:102, tipo:'suite', precioNoche:120000 },
    { id:201, tipo:'single', precioNoche:52000 },
  ];
  filtradas = this.rooms;

  reservas: Reserva[] = [];

  private nochesEntre(a?:string,b?:string){
    if(!a||!b) return 0;
    const d1=new Date(a), d2=new Date(b);
    return Math.max(0, Math.round((+d2-+d1)/(1000*60*60*24)));
  }

  buscar(){
    this.noches = this.nochesEntre(this.desde, this.hasta);
    this.filtradas = this.rooms.filter(r => !this.tipo || r.tipo===this.tipo);
  }

  reservar(h: Habitacion){
    if(this.noches<=0){ return; }
    const total = h.precioNoche * this.noches;
    const anticipo = Math.round(total * 0.30);
    const r: Reserva = {
      id: Date.now(),
      habitacionId: h.id,
      desde: this.desde,
      hasta: this.hasta,
      noches: this.noches,
      total, anticipo, saldo: total - anticipo
    };
    this.reservas.unshift(r);
  }

  currency(n:number){
    return new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(n||0);
  }
}
