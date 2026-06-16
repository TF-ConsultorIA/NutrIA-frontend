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
  private userId = this.userService.currentUser()?.userId;
  private baseUrl = `${environment.apiUrl}/profiles/${this.userId}/favorites`;

  getFavorites(size: number = 10, page: number = 1) {
    const params = new HttpParams().set('size', size).set('page', page);

    return this.http.get<PageResponse<FavoriteResponse>>(this.baseUrl, { params: params });
  }

  addFavorite(request: FavoriteCreateRequestDto) {
    return this.http.post<FavoriteResponse>(this.baseUrl, request);
  }

  removeFavorite(favoriteId: number) {
    return this.http.delete(`${this.baseUrl}/${favoriteId}`);
  }
}
