import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  FoodWeekPlanDetailResponse,
  FoodWeekPlanRequest,
  FoodWeekPlanResponse,
  UpdatePortionRequest,
} from '../models/food-week-plan';
import { Week } from '../models/week';

export interface SelectedMealSlot {
  date: string;
  dayName: string;
  mealType: string;
  weekId: number;
}

@Injectable({
  providedIn: 'root',
})
export class MealPlanService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/meal-plans`;

  private selectedMealSlot = signal<SelectedMealSlot | null>(null);
  getSelectedMealSlot = this.selectedMealSlot.asReadonly();

  setSelectedMealSlot(date: string, dayName: string, mealType: string, weekId: number) {
    this.selectedMealSlot.set({ date, dayName, mealType, weekId });
  }

  clearSelectedMealSlot() {
    this.selectedMealSlot.set(null);
  }

  addMeal(request: FoodWeekPlanRequest): Observable<FoodWeekPlanResponse> {
    return this.http.post<FoodWeekPlanResponse>(this.apiUrl, request);
  }

  getPlansByUserAndWeek(userId: number, weekId: number): Observable<FoodWeekPlanDetailResponse[]> {
    return this.http.get<FoodWeekPlanDetailResponse[]>(`${this.apiUrl}/user/${userId}/week/${weekId}`);
  }

  updatePortion(id: number, request: UpdatePortionRequest): Observable<FoodWeekPlanResponse> {
    return this.http.put<FoodWeekPlanResponse>(`${this.apiUrl}/${id}`, request);
  }

  deleteMeal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  getCurrentWeek(): Observable<Week> {
    return this.http.get<Week>(`${environment.apiUrl}/weeks/current`);
  }
}