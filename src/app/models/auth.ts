import { Gender } from "./gender";

export enum Role {
  ADMIN = 'ADMIN',
  YOUNGER = 'YOUNGER',
  FAMILY = 'FAMILY'
}

export enum UserType {
  YOUNGER = 'YOUNGER',
  FAMILY = 'FAMILY'
}

export interface RegisterUserRequest {
  email: string;
  name: string;
  lastNames?: string;
  password: string;
  birthDate: string;
  gender: Gender;
  userType: UserType;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  role: Role;
  accessExpiresInMs: number;
}

export interface ChangeEmailRequest {
  newEmail: string;
  password: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ChangeCredentialsResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  role: Role;
  accessExpiresInMs: number;
}
