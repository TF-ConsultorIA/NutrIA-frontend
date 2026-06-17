export interface PreferenceItemDto {
  id: number;
  foodId: number;
  type: string;
}

export interface PreferenceResponseDto {
  liked: PreferenceItemDto[];
  disliked: PreferenceItemDto[];
  allergies: PreferenceItemDto[];
}

export interface PreferenceCreateRequestDto {
  foodId: number;
  type: string;
}
