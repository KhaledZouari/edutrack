import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data?.['roles'] ?? route.data?.['role']) as string | string[] | undefined;

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  if (!roles) return true;

  const currentRole = authService.getRole();
  const allowed = Array.isArray(roles) ? roles.includes(currentRole ?? '') : roles === currentRole;
  if (!allowed) {
    router.navigate(['/forbidden']);
    return false;
  }

  return true;
};
