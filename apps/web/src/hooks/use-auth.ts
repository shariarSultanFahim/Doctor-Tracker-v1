'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe, updateProfile } from '@/lib/api/auth';
import { User } from '@doctor-tracker/shared-types';

export function useAuth() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await getMe();
      return res.data;
    },
    retry: false,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: Partial<User & { currentPassword?: string; newPassword?: string }>) => {
      const res = await updateProfile(payload);
      return res.data;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['auth', 'me'], updatedUser);
    },
  });

  return {
    user: data,
    isLoading,
    error,
    updateProfile: updateProfileMutation,
  };
}
