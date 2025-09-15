import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { LoginPage } from './login/login.page';
import { ReservasPage } from './reservas/reservas.page';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'home', component: HomePage },
  { path: 'reservas', component: ReservasPage },
  {    path: 'perfil',
    loadComponent: () => import('./perfil/perfil.page').then( m => m.PerfilPage)
  }
     
];