import { get, post, patch, del } from '../api';
import { Patient, PaginatedResponse, ApiResponse } from '@doctor-tracker/shared-types';

export interface PatientFilters {
  search?: string;
  condition?: string;
  doctorId?: string;
  from?: string;
  to?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function fetchPatients(filters?: PatientFilters): Promise<PaginatedResponse<Patient>> {
  return get<PaginatedResponse<Patient>>('/patients', filters as Record<string, unknown>);
}

export async function fetchDoctorPatients(doctorId: string, filters?: PatientFilters): Promise<PaginatedResponse<Patient>> {
  return get<PaginatedResponse<Patient>>(`/doctors/${doctorId}/patients`, filters as Record<string, unknown>);
}

export async function createDoctorPatient(doctorId: string, data: Partial<Patient>): Promise<ApiResponse<Patient>> {
  return post<ApiResponse<Patient>>(`/doctors/${doctorId}/patients`, data);
}

export async function updatePatient(id: string, data: Partial<Patient>): Promise<ApiResponse<Patient>> {
  return patch<ApiResponse<Patient>>(`/patients/${id}`, data);
}

export async function deletePatient(id: string): Promise<ApiResponse<void>> {
  return del<ApiResponse<void>>(`/patients/${id}`);
}

export async function fetchPatient(id: string): Promise<ApiResponse<Patient>> {
  return get<ApiResponse<Patient>>(`/patients/${id}`);
}
