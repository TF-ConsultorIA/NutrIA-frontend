import { FoodResponse } from './food';

export type TimeDay = 'Desayuno' | 'Almuerzo' | 'Cena';

export interface FoodWeekPlanRequest {
  weekId: number;
  foodId: number;
  userId: number;
  date: string;
  timeDay: TimeDay;
  portion: number;
}

export interface FoodWeekPlanResponse {
  id: number;
  weekId: number;
  foodId: number;
  userId: number;
  date: string;
  timeDay: TimeDay;
  portion: number;
}

export interface FoodWeekPlanDetailResponse {
  id: number;
  weekId: number;
  userId: number;
  date: string;
  timeDay: TimeDay;
  portion: number;
  food: FoodResponse;
}

export interface UpdatePortionRequest {
  portion: number;
}