import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'menu',
    loadComponent: () => import('./pages/menu/menu.page').then( m => m.MenuPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'reservas',
    loadComponent: () => import('./pages/reservas/reservas.page').then( m => m.ReservasPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'mis-reservas',
    loadComponent: () => import('./pages/mis-reservas/mis-reservas.page').then( m => m.MisReservasPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'promociones',
    loadComponent: () => import('./pages/promociones/promociones.page').then(m => m.PromocionesPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'pago',
    loadComponent: () => import('./pages/pago/pago.page').then(m => m.PagoPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then(m => m.PerfilPage),
    canActivate: [AuthGuard]
  },
];
