import { get } from '../api';
import { DashboardSummary, DashboardStats, ApiResponse } from '@doctor-tracker/shared-types';

export interface DashboardStatsFilters {
  from?: string;
  to?: string;
  bucket?: 'day' | 'week' | 'month';
}

export async function fetchDashboardSummary(): Promise<ApiResponse<DashboardSummary>> {
  return get<ApiResponse<DashboardSummary>>('/dashboard/summary');
}

export async function fetchDashboardStats(filters?: DashboardStatsFilters): Promise<ApiResponse<DashboardStats>> {
  return get<ApiResponse<DashboardStats>>('/dashboard/stats', filters as Record<string, unknown>);
}
