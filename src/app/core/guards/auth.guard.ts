import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { AuthService } from '../../services/auth.service';
import { RefreshRequest } from '../../models/auth';
import { of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
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
        router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }

  router.navigate(['/auth/login']);
  return false;
};
