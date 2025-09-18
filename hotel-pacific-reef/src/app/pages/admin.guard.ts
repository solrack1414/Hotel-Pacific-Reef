import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthDbService } from '../services/auth-db.service';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthDbService);
  const router = inject(Router);
  await auth.init();
  const email = auth.getSessionEmail();
  if (email && auth.isAdmin(email)) return true;
  router.navigateByUrl('/login');
  return false;
};
