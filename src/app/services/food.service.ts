import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { FoodResponse, FoodType } from '../models/food';
import { PageResponse } from '../models/page-response';

@Injectable({
  providedIn: 'root',
})
export class FoodService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/foods`;

  getByType(type: string, page: number = 1, size: number = 10) {
    const queryParams = new HttpParams().set('type', type).set('page', page).set('size', size);
    return this.http.get<PageResponse<FoodResponse>>(`${this.baseUrl}/type`, { params: queryParams });
  }

  searchPlates(query: string, type: FoodType = FoodType.PLATE, page: number = 1, size: number = 10) {
    const queryParams = new HttpParams().set('name', query).set('type', type).set('page', page).set('size', size);
    return this.http.get<PageResponse<FoodResponse>>(`${this.baseUrl}/search`, { params: queryParams });
  }

  getFoodById(id: number) {
    return this.http.get<FoodResponse>(`${this.baseUrl}/${id}`);
  }

  getAllFoods(page: number = 1, size: number = 10) {
    const queryParams = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<FoodResponse>>(`${this.baseUrl}`, { params: queryParams });
  }
}
