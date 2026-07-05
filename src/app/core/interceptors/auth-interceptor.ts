import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { TokenService } from '../../services/token.service';
import { AuthService } from '../../services/auth.service';
import { RefreshRequest } from '../../models/auth';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthRoute = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

  const token = tokenService.accessToken;
  const authReq = (token && !isAuthRoute)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 403 || isAuthRoute) {
        return throwError(() => error);
      }

      if (!tokenService.refreshToken) {
        router.navigate(['/auth/login']);
        return throwError(() => error);
      }

      if (isRefreshing) {
        return refreshTokenSubject.pipe(
          filter(newToken => newToken !== null),
          take(1),
          switchMap(newToken => {
            const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
            return next(retryReq);
          })
        );
      }

      isRefreshing = true;
      refreshTokenSubject.next(null);

      const request: RefreshRequest = { refreshToken: tokenService.refreshToken };

      return authService.refreshToken(request).pipe(
        switchMap((response) => {
          isRefreshing = false;
          const newToken = tokenService.accessToken;
          refreshTokenSubject.next(newToken);

          const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
          return next(retryReq);
        }),
        catchError((refreshError) => {
          isRefreshing = false;
          refreshTokenSubject.next(null);
          tokenService.clear();
          router.navigate(['/auth/login']);
          return throwError(() => refreshError);
        })
      );
    })
  );
};
