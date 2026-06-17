export enum FoodType {
  INGREDIENT = 'INGREDIENT',
  PLATE = 'PLATE',
}

export interface FoodResponse {
  id: number;
  foodName: string;
  foodType: FoodType;
  foodGroup: string;
  energy: number;
  proteins: number;
  totalFat: number;
  water: number;
  carbohydratesTotal: number;
  calcium: number;
  iron: number;
  sodium: number;
  randomBg?: string;
}
