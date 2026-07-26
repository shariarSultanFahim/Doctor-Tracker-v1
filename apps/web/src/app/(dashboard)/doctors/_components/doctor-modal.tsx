'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Doctor } from '@doctor-tracker/shared-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const doctorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  specialization: z.string().min(1, 'Specialization is required'),
  hospital: z.string().min(1, 'Hospital is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
  email: z.string().email('Invalid email address'),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DoctorFormData) => Promise<void>;
  initialData?: Doctor | null;
  title: string;
}

export default function DoctorModal({ isOpen, onClose, onSubmit, initialData, title }: DoctorModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          specialization: initialData.specialization,
          hospital: initialData.hospital,
          phone: initialData.phone,
          email: initialData.email,
        }
      : {
          name: '',
          specialization: '',
          hospital: '',
          phone: '',
          email: '',
        },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form id="doctor-modal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 my-2">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Full Name</label>
            <Input
              {...register('name')}
              placeholder="Dr. Sarah Jenkins"
              className="h-9 text-xs"
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Specialization</label>
            <Input
              {...register('specialization')}
              placeholder="Cardiology"
              className="h-9 text-xs"
            />
            {errors.specialization && <p className="text-xs text-destructive mt-1">{errors.specialization.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Hospital / Clinic</label>
            <Input
              {...register('hospital')}
              placeholder="City General Hospital"
              className="h-9 text-xs"
            />
            {errors.hospital && <p className="text-xs text-destructive mt-1">{errors.hospital.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Phone Number</label>
            <Input
              {...register('phone')}
              placeholder="+1 555-0192"
              className="h-9 text-xs"
            />
            {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Email Address</label>
            <Input
              type="email"
              {...register('email')}
              placeholder="s.jenkins@hospital.org"
              className="h-9 text-xs"
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
          </div>
        </form>

        <DialogFooter className="gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="doctor-modal-form" size="sm" disabled={isSubmitting} className="gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Doctor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
