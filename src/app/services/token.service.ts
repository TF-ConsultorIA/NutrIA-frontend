import { Injectable } from '@angular/core';

const ACCESS_KEY = 'nutria.accessToken';
const REFRESH_KEY = 'nutria.refreshToken';
const EMAIL_KEY = 'nutria.email';
const ROLE_KEY = 'nutria.role';
const EXPIRATION_KEY = 'nutria.expiration';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  get accessToken() {
    return localStorage.getItem(ACCESS_KEY);
  }

  get refreshToken() {
    return localStorage.getItem(REFRESH_KEY);
  }

  get email() {
    return localStorage.getItem(EMAIL_KEY);
  }

  get role() {
    return localStorage.getItem(ROLE_KEY);
  }

  get expiration() {
    const exp = localStorage.getItem(EXPIRATION_KEY);
    if (!exp) return null;
    return parseInt(exp, 10);
  }

  save(accessToken: string, refreshToken: string, email: string, role: string, expirationMs: number) {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    localStorage.setItem(EMAIL_KEY, email);
    localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem(EXPIRATION_KEY, (Date.now() + expirationMs).toString());
  }

  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(EXPIRATION_KEY);
  }

  get isLoggedIn() {
    return !!this.accessToken;
  }

  get isTokenExpired() {
    const exp = this.expiration;
    if (!exp) return true;
    return Date.now() > exp;
  }
}
