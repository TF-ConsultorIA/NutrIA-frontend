import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { inject } from '@angular/core';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const isNotLoggedIn = !tokenService.isLoggedIn;
  const isTokenExpiredWithoutRefresh = tokenService.isTokenExpired && !tokenService.refreshToken;

  if (isNotLoggedIn || isTokenExpiredWithoutRefresh) {
    return true;
  }

  return router.createUrlTree(['/']);
};
