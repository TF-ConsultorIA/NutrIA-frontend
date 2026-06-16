import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';
import { UserMetricCreateRequestDto, UserMetricResponse } from '../models/metrics';

@Injectable({
  providedIn: 'root',
})
export class MetricsService {
  private userService = inject(UserService);
  private userId = this.userService.currentUser()?.userId;
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/profiles/${this.userId}/metrics`;

  getMetrics() {
    return this.http.get<UserMetricResponse>(this.baseUrl);
  }

  upsertMetrics(request: UserMetricCreateRequestDto) {
    return this.http.post<UserMetricResponse>(this.baseUrl, request);
  }
}
