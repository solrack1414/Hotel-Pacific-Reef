import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { LoginPage } from './login/login.page';
import { ReservasPage } from './reservas/reservas.page';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'home', component: HomePage },
  { path: 'reservas', component: ReservasPage },
  { path: 'perfil', loadComponent: () => import('./perfil/perfil.page').then(m => m.PerfilPage) },
  { path: 'admin/reservas', loadComponent: () => import('./pages/admin-reservas/admin-reservas.page').then(m => m.AdminReservasPage) },
  { path: 'admin/reportes', loadComponent: () => import('./pages/admin-reportes/admin-reportes.page').then(m => m.AdminReportesPage) },
  { path: 'admin/usuarios', loadComponent: () => import('./pages/admin-usuarios/admin-usuarios.page').then(m => m.AdminUsuariosPage) },
  { path: 'admin', loadComponent: () => import('./pages/admin/admin.page').then(m => m.AdminPage) },
  { path: 'admin/habitaciones', loadComponent: () => import('./pages/admin-habitaciones/admin-habitaciones.page').then(m => m.AdminHabitacionesPage) }

];