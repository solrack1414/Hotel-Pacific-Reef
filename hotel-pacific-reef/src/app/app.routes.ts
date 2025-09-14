import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { LoginPage } from './login/login.page';
import { ReservasPage } from './reservas/reservas.page';
import { AdminPage } from './admin/admin.page';  

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'home', component: HomePage },
  { path: 'reservas', component: ReservasPage },
  { path: 'admin', component: AdminPage }        
];