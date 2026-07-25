import { get, post } from '../api';
import { User, ApiResponse } from '@doctor-tracker/shared-types';

export interface LoginPayload {
  email: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<ApiResponse<User>> {
  return post<ApiResponse<User>>('/auth/login', payload);
}

export async function logout(): Promise<ApiResponse<void>> {
  return post<ApiResponse<void>>('/auth/logout');
}

export async function getMe(): Promise<ApiResponse<User>> {
  return get<ApiResponse<User>>('/auth/me');
}
