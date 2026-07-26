'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Doctor } from '@doctor-tracker/shared-types';
import AvatarWithFallback from '@/components/shared/avatar-with-fallback';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const doctorFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  specialization: z.string().min(1, 'Specialization is required'),
  hospital: z.string().min(1, 'Hospital is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
  email: z.string().email('Invalid email address'),
  avatar: z.string().optional(),
});

export type DoctorFormData = z.infer<typeof doctorFormSchema>;

interface DoctorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DoctorFormData) => Promise<void>;
  initialData?: Doctor | null;
  isLoading?: boolean;
}

export default function DoctorSheet({ isOpen, onClose, onSubmit, initialData, isLoading = false }: DoctorSheetProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorFormSchema),
    values: initialData
      ? {
          name: initialData.name,
          specialization: initialData.specialization,
          hospital: initialData.hospital,
          phone: initialData.phone,
          email: initialData.email,
          avatar: initialData.avatar || '',
        }
      : {
          name: '',
          specialization: '',
          hospital: '',
          phone: '',
          email: '',
          avatar: '',
        },
  });

  const watchAvatar = watch('avatar');
  const watchName = watch('name');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('avatar', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col justify-between overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{initialData ? 'Edit Doctor Profile' : 'Add New Doctor'}</SheetTitle>
          <SheetDescription>Configure doctor contact and hospital specialization details</SheetDescription>
        </SheetHeader>

        <form id="doctor-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 my-4">
          {/* Avatar Photo Upload */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative group cursor-pointer">
              <AvatarWithFallback
                src={watchAvatar}
                name={watchName || 'Doctor'}
                className="w-20 h-20 border-2 border-primary/20 text-xl font-bold"
              />
              <label
                htmlFor="doctor-avatar"
                className="absolute inset-0 bg-black/60 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-medium"
              >
                Upload
              </label>
              <input
                id="doctor-avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <span className="text-[11px] text-muted-foreground">Click photo to update profile picture</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Full Name *</label>
            <Input
              type="text"
              {...register('name')}
              placeholder="e.g. Dr. Sarah Jenkins"
              className="h-9 text-xs"
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Specialization *</label>
            <Input
              type="text"
              {...register('specialization')}
              placeholder="e.g. Cardiology"
              className="h-9 text-xs"
            />
            {errors.specialization && <p className="text-xs text-destructive mt-1">{errors.specialization.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Hospital / Clinic *</label>
            <Input
              type="text"
              {...register('hospital')}
              placeholder="e.g. St. Jude Hospital"
              className="h-9 text-xs"
            />
            {errors.hospital && <p className="text-xs text-destructive mt-1">{errors.hospital.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Phone Number *</label>
            <Input
              type="text"
              {...register('phone')}
              placeholder="+1 555-0199"
              className="h-9 text-xs"
            />
            {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Email Address *</label>
            <Input
              type="email"
              {...register('email')}
              placeholder="doctor@hospital.com"
              className="h-9 text-xs"
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
          </div>
        </form>

        <SheetFooter className="pt-4 border-t border-border/40 gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" form="doctor-form" size="sm" disabled={isLoading} className="gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {initialData ? 'Save Changes' : 'Create Doctor Profile'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
