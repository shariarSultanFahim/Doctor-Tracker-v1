import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDoctors, fetchDoctorById, createDoctor, updateDoctor, deleteDoctor, DoctorFilters } from '../lib/api/doctors';
import { Doctor } from '@doctor-tracker/shared-types';

export function useDoctors(filters: DoctorFilters = {}) {
  return useQuery({
    queryKey: ['doctors', filters],
    queryFn: () => fetchDoctors(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: () => fetchDoctorById(id),
    enabled: !!id,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Doctor>) => createDoctor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Doctor> }) => updateDoctor(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['doctor', variables.id] });
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDoctor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
