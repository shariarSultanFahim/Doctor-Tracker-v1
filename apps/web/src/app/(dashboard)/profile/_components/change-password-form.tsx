'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, ChangePasswordFormData } from '@doctor-tracker/shared-validators';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export { changePasswordSchema, type ChangePasswordFormData };

export default function ChangePasswordForm() {
  const { updateProfile } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await updateProfile.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password updated successfully');
      reset();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    }
  };

  return (
    <div className="glass-card p-5 rounded-xl border border-border shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-foreground">Change Password</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Current Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              {...register('currentPassword')}
              placeholder="••••••••"
              className="w-full pl-9 pr-4 py-2 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {errors.currentPassword && (
            <p className="text-xs text-destructive mt-1">{errors.currentPassword.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">New Password</label>
            <input
              type="password"
              {...register('newPassword')}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.newPassword && (
              <p className="text-xs text-destructive mt-1">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Confirm New Password</label>
            <input
              type="password"
              {...register('confirmPassword')}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" size="sm" variant="outline" disabled={updateProfile.isPending} className="gap-2 text-xs">
            {updateProfile.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
}
