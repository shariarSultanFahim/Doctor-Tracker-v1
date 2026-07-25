import { axiosInstance } from './axios';

export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await axiosInstance.get<T>(url, { params });
  return response.data;
}

export async function post<T>(url: string, data?: unknown): Promise<T> {
  const response = await axiosInstance.post<T>(url, data);
  return response.data;
}

export async function patch<T>(url: string, data?: unknown): Promise<T> {
  const response = await axiosInstance.patch<T>(url, data);
  return response.data;
}

export async function del<T>(url: string): Promise<T> {
  const response = await axiosInstance.delete<T>(url);
  return response.data;
}
