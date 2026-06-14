import { Gender } from "./gender";

export interface UserResponse {
  userId: number;
  email: string;
  name: string;
  lastNames: string;
  gender: Gender;
  birthDate: string;
}
