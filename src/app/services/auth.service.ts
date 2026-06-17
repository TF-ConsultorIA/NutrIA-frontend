import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { TokenService } from './token.service';
import { AuthResponse, ChangeCredentialsResponse, ChangeEmailRequest, ChangePasswordRequest, LoginRequest, RefreshRequest, RegisterUserRequest } from '../models/auth';
import { switchMap, tap } from 'rxjs';
import { UserResponse } from '../models/user';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private token = inject(TokenService);
  private baseUrl = `${environment.apiUrl}/auth`;
  private userService = inject(UserService);

  isLoggedIn = signal(this.token.isLoggedIn);

  login(request: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request).pipe(
      tap((res) => {
        this.token.save(res.accessToken, res.refreshToken, res.email, res.role, res.accessExpiresInMs);
        this.isLoggedIn.set(true);
      }),
      switchMap(() => {
        return this.userService.getMe();
      })
    );
  }

  register(request: RegisterUserRequest) {
    return this.http.post<UserResponse>(`${this.baseUrl}/register`, request);
  }

  refreshToken(request: RefreshRequest) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh`, request).pipe(
      tap((res) => {
        this.token.save(res.accessToken, res.refreshToken, res.email, res.role, res.accessExpiresInMs);
      }),
    );
  }

  logout() {
    let request: RefreshRequest = { refreshToken: this.token.refreshToken! };

    return this.http.post<void>(`${this.baseUrl}/logout`, request).pipe(
      tap(() => {
        this.token.clear();
        this.isLoggedIn.set(false);
      }),
    );
  }

  changeEmail(request: ChangeEmailRequest) {
    return this.http.post<ChangeCredentialsResponse>(`${this.baseUrl}/change-email`, request).pipe(
      tap((res) => {
        this.token.save(res.accessToken, res.refreshToken, res.email, res.role, res.accessExpiresInMs);
      }),
    );
  }

  changePassword(request: ChangePasswordRequest) {
    return this.http.post<ChangeCredentialsResponse>(`${this.baseUrl}/change-password`, request).pipe(
      tap((res) => {
        this.token.save(res.accessToken, res.refreshToken, res.email, res.role, res.accessExpiresInMs);
      }),
    );
  }
}
