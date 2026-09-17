import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.getToken()) {
    return true;
  }
  return router.createUrlTree(['/connexion']);
};

export const prestataireGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.getToken() && auth.user()?.role === 'prestataire') {
    return true;
  }
  return router.createUrlTree(['/']);
};
