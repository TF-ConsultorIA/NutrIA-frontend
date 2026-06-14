import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { StreakResponse } from '../models/streak';

@Injectable({
  providedIn: 'root',
})
export class StreakService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/streaks`

  getCurrentStreak(userId: number) {
    return this.http.get<StreakResponse>(`${this.baseUrl}/user/${userId}`);
  }

  checkInStreak(userId: number) {
    return this.http.post<StreakResponse>(`${this.baseUrl}/user/${userId}/check-in`, {});
  }
}
