export interface FavoriteResponse {
  id: number;
  foodId: number;
  addedDate: string;
}

export interface FavoriteCreateRequestDto {
  foodId: number;
}
