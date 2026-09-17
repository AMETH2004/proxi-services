import { Routes } from '@angular/router';
import { authGuard, prestataireGuard } from './core/guards';

export const routes: Routes = [
  {
    path: 'connexion',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'inscription',
    loadComponent: () => import('./pages/register/register').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'recherche' },
      {
        path: 'recherche',
        loadComponent: () => import('./pages/recherche/recherche').then((m) => m.RechercheComponent),
      },
      {
        path: 'prestataires/:id',
        loadComponent: () =>
          import('./pages/prestataire-detail/prestataire-detail').then(
            (m) => m.PrestataireDetailComponent,
          ),
      },
      {
        path: 'mes-rendez-vous',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/mes-rendez-vous/mes-rendez-vous').then((m) => m.MesRendezVousComponent),
      },
      {
        path: 'mon-profil',
        canActivate: [prestataireGuard],
        loadComponent: () => import('./pages/mon-profil/mon-profil').then((m) => m.MonProfilComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
