import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary, fetchDashboardStats, DashboardStatsFilters } from '../lib/api/dashboard';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => fetchDashboardSummary(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDashboardStats(filters: DashboardStatsFilters = {}) {
  return useQuery({
    queryKey: ['dashboard', 'stats', filters],
    queryFn: () => fetchDashboardStats(filters),
    staleTime: 1000 * 60 * 5,
  });
}
