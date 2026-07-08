import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';
import { PageResponse } from '../models/page-response';
import { FavoriteCreateRequestDto, FavoriteResponse } from '../models/favorite';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private http = inject(HttpClient);
  private userService = inject(UserService);

  private get profileId() {
    return this.userService.currentUser()?.userId;
  }

  getFavorites(page: number = 0, size: number = 10) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<FavoriteResponse>>(
      `${environment.apiUrl}/profiles/${this.profileId}/favorites`,
      { params },
    );
  }

  addFavorite(request: FavoriteCreateRequestDto) {
    return this.http.post<FavoriteResponse>(
      `${environment.apiUrl}/profiles/${this.profileId}/favorites`,
      request,
    );
  }

  removeFavorite(favoriteId: number) {
    return this.http.delete(
      `${environment.apiUrl}/profiles/${this.profileId}/favorites/${favoriteId}`,
    );
  }
}
