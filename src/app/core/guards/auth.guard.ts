import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { AuthService } from '../../services/auth.service';
import { RefreshRequest } from '../../models/auth';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  if (tokenService.isLoggedIn && !tokenService.isTokenExpired) {
    return true;
  }

  if (tokenService.isTokenExpired && tokenService.refreshToken) {
    const request: RefreshRequest = {
      refreshToken: tokenService.refreshToken!,
    };

    return authService.refreshToken(request).pipe(
      map(() => true),
      catchError(() => {
        return of(router.createUrlTree(['/auth/login']));
      })
    );
  }

  return router.createUrlTree(['/auth/login']);
};
