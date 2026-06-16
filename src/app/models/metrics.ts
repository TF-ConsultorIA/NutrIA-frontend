export interface UserMetricResponse {
  id: number;
  height: number;
  chest: number;
  arm: number;
}

export interface UserMetricCreateRequestDto {
  height: number;
  chest: number;
  arm: number;
}
