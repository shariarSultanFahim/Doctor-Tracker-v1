import { get, post, patch, del } from '../api';
import { Doctor, PaginatedResponse, ApiResponse } from '@doctor-tracker/shared-types';

export interface DoctorFilters {
  search?: string;
  specialization?: string;
  from?: string;
  to?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function fetchDoctors(filters?: DoctorFilters): Promise<PaginatedResponse<Doctor>> {
  return get<PaginatedResponse<Doctor>>('/doctors', filters as Record<string, unknown>);
}

export async function fetchDoctorById(id: string): Promise<ApiResponse<Doctor>> {
  return get<ApiResponse<Doctor>>(`/doctors/${id}`);
}

export async function createDoctor(data: Partial<Doctor>): Promise<ApiResponse<Doctor>> {
  return post<ApiResponse<Doctor>>('/doctors', data);
}

export async function updateDoctor(id: string, data: Partial<Doctor>): Promise<ApiResponse<Doctor>> {
  return patch<ApiResponse<Doctor>>(`/doctors/${id}`, data);
}

export async function deleteDoctor(id: string): Promise<ApiResponse<void>> {
  return del<ApiResponse<void>>(`/doctors/${id}`);
}
