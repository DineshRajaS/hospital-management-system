import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.currentUser();

    if (user && allowedRoles.includes(user.role)) {
      return true;
    }

    router.navigate(['/']);
    return false;
  };
};