import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// ============================================================
// Guard Angular 19 — authGuard (CanActivateFn fonctionnel)
// Protège les routes selon :
//   - La connexion (token présent)
//   - Le rôle requis (data.role dans la config de route)
//
// Usage dans app.routes.ts :
//   { path: 'admin', ..., canActivate: [authGuard], data: { role: 'ADMIN' } }
//   { path: 'courses/add', ..., canActivate: [authGuard], data: { roles: ['TEACHER'] } }
//   { path: 'enrollments', ..., canActivate: [authGuard] }
// ============================================================

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  // Vérifier si l'utilisateur est connecté
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // Vérifier le rôle requis si défini dans la route
  const requiredRole = (route.data?.['roles'] ?? route.data?.['role']) as string | string[] | undefined;
  
  if (requiredRole) {
    const userRole = authService.getRole();
    const isAuthorized = Array.isArray(requiredRole) 
      ? requiredRole.includes(userRole ?? '') 
      : userRole === requiredRole;

    if (!isAuthorized) {
      // Rôle insuffisant → page accès refusé
      router.navigate(['/forbidden']);
      return false;
    }
  }

  return true;
};
