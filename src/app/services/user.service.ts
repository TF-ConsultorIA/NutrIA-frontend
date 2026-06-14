import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { environment } from '../../environments/environment';
import { UserResponse } from '../models/user';
import { catchError, firstValueFrom, of, switchMap, tap } from 'rxjs';
import { StreakService } from './streak.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private streakService = inject(StreakService);
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/user`
  private userSignal = signal<UserResponse | null>(null);
  private token = inject(TokenService);

  public currentUser = this.userSignal.asReadonly();

  initializeUser() {
    if (!this.token.isLoggedIn) {
      this.userSignal.set(null);
      return of(null);
    }
    return firstValueFrom(
      this.getMe(),
    );
  }

  getMe() {
    return this.http.get<UserResponse>(`${this.baseUrl}/me`).pipe(
      tap((res) => {
        this.userSignal.set(res);
      }),
      switchMap((user) => {
        return this.streakService.checkInStreak(user.userId).pipe(
          catchError((err) => {
            return of(null);
          })
        );
      }),
      catchError(() => {
        this.userSignal.set(null);
        return of(null);
      }),
    );
  }

  updateMe(request: Partial<UserResponse>) {
    return this.http.put<UserResponse>(`${this.baseUrl}/me`, request).pipe(
      tap((res) => {
        this.userSignal.set(res);
      }),
    );
  }
}
