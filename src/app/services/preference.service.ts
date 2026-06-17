import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';
import { PreferenceCreateRequestDto, PreferenceResponseDto, PreferenceItemDto } from '../models/preference';

@Injectable({
  providedIn: 'root',
})
export class PreferenceService {
  private http = inject(HttpClient);
  private userService = inject(UserService);

  private get profileId() {
    return this.userService.currentUser()?.userId;
  }

  getPreferences() {
    return this.http.get<PreferenceResponseDto>(`${environment.apiUrl}/profiles/${this.profileId}/preferences`);
  }

  addPreference(request: PreferenceCreateRequestDto) {
    return this.http.post<PreferenceItemDto>(`${environment.apiUrl}/profiles/${this.profileId}/preferences`, request);
  }

  deletePreference(preferenceId: number) {
    return this.http.delete<void>(`${environment.apiUrl}/profiles/${this.profileId}/preferences/${preferenceId}`);
  }
}
