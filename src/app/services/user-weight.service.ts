import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';
import { UserWeightCreateRequest, UserWeightResponse } from '../models/user-weight';

@Injectable({
  providedIn: 'root',
})
export class UserWeightService {
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private userId = this.userService.currentUser()?.userId

  private baseUrl = `${environment.apiUrl}/profiles/${this.userId}/weights`;

  listWeights() {
    return this.http.get<UserWeightResponse[]>(this.baseUrl);
  }

  registerWeight(request: UserWeightCreateRequest) {
    return this.http.post<UserWeightResponse>(this.baseUrl, request);
  }
}
