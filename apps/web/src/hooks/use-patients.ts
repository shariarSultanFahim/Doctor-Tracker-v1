import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPatients, fetchDoctorPatients, createDoctorPatient, updatePatient, deletePatient, PatientFilters } from '../lib/api/patients';
import { Patient } from '@doctor-tracker/shared-types';

export function usePatients(filters: PatientFilters = {}) {
  return useQuery({
    queryKey: ['patients', filters],
    queryFn: () => fetchPatients(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDoctorPatients(doctorId: string, filters: PatientFilters = {}) {
  return useQuery({
    queryKey: ['doctor-patients', doctorId, filters],
    queryFn: () => fetchDoctorPatients(doctorId, filters),
    enabled: !!doctorId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ doctorId, data }: { doctorId: string; data: Partial<Patient> }) => createDoctorPatient(doctorId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-patients', variables.doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) => updatePatient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-patients'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
