import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { AuthDbService, Reserva, UserRow } from '../../services/auth-db.service';

type TotalMes = { mes: string; total: number; reservas: number };
type ReservaDet = Reserva & { nombrePersona?: string };

@Component({
  selector: 'app-admin-reportes',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink],
  templateUrl: './admin-reportes.page.html',
  styleUrls: ['./admin-reportes.page.scss']
})
export class AdminReportesPage implements OnInit {

  // Totales por mes
  totalesMes: TotalMes[] = [];
  topRooms: { habitacionId: number; nombreHabitacion: string; veces: number }[] = [];
  detalle: ReservaDet[] = [];

  constructor(private authDb: AuthDbService) {}

  async ngOnInit() {
    await this.authDb.init();
    this.load();
  }

  private load() {
    const users: UserRow[] = this.authDb.listUsers();
    const nameByEmail = new Map(users.map(u => [u.email.toLowerCase(), u.name || '']));
    this.detalle = this.authDb.listReservations().map(r => ({
      ...r,
      nombrePersona: nameByEmail.get(r.email) || r.email
    }));


    this.topRooms = this.authDb.reportTopRooms();
    this.totalesMes = this.buildTotalsByMonth(this.detalle);
  }

  /* calculo */

  currency(v: number | null | undefined) {
    return (v ?? 0).toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    });
  }

  // Noches de reservas 
  private diffNights(isoStart?: string, isoEnd?: string): number {
    if (!isoStart || !isoEnd) return 0;
    const s = new Date(isoStart.slice(0,10) + 'T00:00:00');
    const e = new Date(isoEnd.slice(0,10) + 'T00:00:00');
    const MS = 1000 * 60 * 60 * 24;
    return Math.max(0, Math.round((e.getTime() - s.getTime()) / MS));
  }

  effectiveNights(r: Reserva): number {
    if (typeof r.noches === 'number' && r.noches > 0) return r.noches;
    return this.diffNights(r.llegada, r.salida);
  }

  totalOf(r: Reserva): number {
    const noches = this.effectiveNights(r);
    const base   = noches * (r.precioNoche || 0);
    return (typeof r.total === 'number' && r.total > 0) ? r.total : base;
  }

  // total por meses 
  private buildTotalsByMonth(rows: Reserva[]): TotalMes[] {
    const map = new Map<string, { total: number; reservas: number }>();

    for (const r of rows) {
      const mes = (r.llegada || r.createdAt).slice(0, 7); // YYYY-MM
      const cur = map.get(mes) || { total: 0, reservas: 0 };
      cur.total += this.totalOf(r);
      cur.reservas += 1;
      map.set(mes, cur);
    }

    return [...map.entries()]
      .map(([mes, x]) => ({ mes, total: x.total, reservas: x.reservas }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }

  totalGeneral(): number {
    return this.totalesMes.reduce((acc, x) => acc + (x.total || 0), 0);
  }

  totalReservasGeneral(): number {
    return this.totalesMes.reduce((acc, x) => acc + (x.reservas || 0), 0);
  }






  /*Exportaciones*/

  // Exporta los totales por mes
  exportCSV() {
    const header = ['mes','reservas','total'];
    const rows = this.totalesMes.map(r => [r.mes, String(r.reservas), String(r.total)]);
    const csv = [header, ...rows].map(cols =>
      cols.map(x => `"${String(x).replace(/"/g,'""')}"`).join(',')
    ).join('\n');
    this.downloadCSV(csv, 'totales_por_mes.csv');
  }

  // exportar detalle completo:
exportDetalleExcel() {
  // BOM + "sep=;" hacen que Excel detecte UTF-8 y el separador
  const BOM = '\ufeff';
  const SEP = ';';

  const header = [
    'Cliente',
    'Email',
    'Habitacion',
    'Tipo',
    'Fecha inicio',
    'Fecha salida',
    'Noches',
    'Valor por noche',
    'Valor total',
    'Creada'
  ];

  // Ordena por llegada y luego email
  const rowsData = [...this.detalle].sort((a, b) => {
    const da = (a.llegada || '').localeCompare(b.llegada || '');
    return da !== 0 ? da : a.email.localeCompare(b.email);
  });

  const rows = rowsData.map(d => {
    const noches = this.effectiveNights(d);
    const total  = this.totalOf(d);
    const nombre = (d as any).nombrePersona || d.email;

    // Columnas: textos entre comillas; números sin comillas
    const cols = [
      this.csvText(nombre),
      this.csvText(d.email),
      this.csvText(d.nombreHabitacion),
      this.csvText(d.tipo),
      this.csvDate(d.llegada),
      this.csvDate(d.salida),
      String(noches),
      String(d.precioNoche || 0),
      String(total),
      this.csvText(this.fmtDateTime(d.createdAt))
    ];

    return cols.join(SEP);
  });

  const csv = [ 'sep=;', header.join(SEP), ...rows ].join('\r\n');
  this.downloadCSV(BOM + csv, 'detalle_reservas.csv');
}

/* ==== Helpers para CSV/Excel ==== */
private csvText(s: any): string {
  return `"${String(s ?? '').replace(/"/g, '""')}"`;
}
private csvDate(iso?: string): string {
  return iso ? iso.slice(0, 10) : '';
}
private fmtDateTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

private downloadCSV(data: string, filename: string) {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);

}
}