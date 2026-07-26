'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { User, Mail, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const profileInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  avatar: z.string().optional(),
});

export type ProfileInfoFormData = z.infer<typeof profileInfoSchema>;

interface ProfileInfoFormProps {
  avatar: string;
}

export default function ProfileInfoForm({ avatar }: ProfileInfoFormProps) {
  const { user, updateProfile } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInfoFormData>({
    resolver: zodResolver(profileInfoSchema),
    values: {
      name: user?.name || '',
      email: user?.email || '',
      avatar: avatar || user?.avatar || '',
    },
  });

  const onSubmit = async (data: ProfileInfoFormData) => {
    try {
      await updateProfile.mutateAsync({
        ...data,
        avatar,
      });
      toast.success('Profile details saved');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save profile');
    }
  };

  return (
    <div className="glass-card p-5 rounded-xl border border-border shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-foreground">Account Information</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              {...register('name')}
              className="w-full pl-9 pr-4 py-2 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              {...register('email')}
              className="w-full pl-9 pr-4 py-2 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={updateProfile.isPending} className="gap-2 text-xs">
            {updateProfile.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
