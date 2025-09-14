import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { LoginPage } from './login/login.page';
import { ReservasPage } from './reservas/reservas.page';
import { AdminModificarPage } from './Admin-modif/Admin-modif.page';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'home', component: HomePage },
  { path: 'reservas', component: ReservasPage },
  { path: 'Admin-modifi', component: AdminModificarPage },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.page').then( m => m.AdminPage)
  }
];
