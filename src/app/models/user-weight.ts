export interface UserWeightResponse {
  id: number;
  registerDate: string;
  weightKg: number;
}

export interface UserWeightCreateRequest {
  registerDate: string;
  weightKg: number;
}
