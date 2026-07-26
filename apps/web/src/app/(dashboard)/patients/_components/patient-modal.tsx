'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Patient, Doctor } from '@doctor-tracker/shared-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const patientSchema = z.object({
  doctorId: z.string().min(1, 'Doctor is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().int().min(0).max(120, 'Age must be 0-120'),
  gender: z.enum(['Male', 'Female', 'Other']),
  condition: z.string().min(1, 'Condition is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
  visitDate: z.string().min(1, 'Visit date is required'),
  notes: z.string().max(500, 'Notes max 500 chars').optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => Promise<void>;
  initialData?: Patient | null;
  doctors?: Doctor[];
  lockDoctorId?: string;
  title: string;
}

export default function PatientModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  doctors = [],
  lockDoctorId,
  title,
}: PatientModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: initialData
      ? {
          doctorId: typeof initialData.doctorId === 'object' ? initialData.doctorId._id : initialData.doctorId,
          name: initialData.name,
          age: initialData.age,
          gender: initialData.gender,
          condition: initialData.condition,
          phone: initialData.phone,
          visitDate: initialData.visitDate ? new Date(initialData.visitDate).toISOString().split('T')[0] : '',
          notes: initialData.notes || '',
        }
      : {
          doctorId: lockDoctorId || '',
          name: '',
          age: 30,
          gender: 'Male',
          condition: '',
          phone: '',
          visitDate: new Date().toISOString().split('T')[0],
          notes: '',
        },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form id="patient-modal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 my-2">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Attending Doctor</label>
            {lockDoctorId ? (
              <Input
                type="text"
                value={lockDoctorId}
                disabled
                className="h-9 text-xs"
              />
            ) : (
              <select
                {...register('doctorId')}
                className="w-full px-3 h-9 border border-border rounded-lg text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select a Doctor</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name} ({doc.specialization})
                  </option>
                ))}
              </select>
            )}
            {errors.doctorId && <p className="text-xs text-destructive mt-1">{errors.doctorId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Patient Name</label>
              <Input
                {...register('name')}
                placeholder="Jane Doe"
                className="h-9 text-xs"
              />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Age</label>
              <Input
                type="number"
                {...register('age')}
                className="h-9 text-xs"
              />
              {errors.age && <p className="text-xs text-destructive mt-1">{errors.age.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Gender</label>
              <select
                {...register('gender')}
                className="w-full px-3 h-9 border border-border rounded-lg text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Condition</label>
              <Input
                {...register('condition')}
                placeholder="Hypertension"
                className="h-9 text-xs"
              />
              {errors.condition && <p className="text-xs text-destructive mt-1">{errors.condition.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Phone Number</label>
              <Input
                {...register('phone')}
                placeholder="+1 555-0182"
                className="h-9 text-xs"
              />
              {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Visit Date</label>
              <Input
                type="date"
                {...register('visitDate')}
                className="h-9 text-xs"
              />
              {errors.visitDate && <p className="text-xs text-destructive mt-1">{errors.visitDate.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Medical Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Diagnosis details, prescription notes..."
              className="w-full px-3 py-2 border border-border rounded-lg text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </form>

        <DialogFooter className="gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="patient-modal-form" size="sm" disabled={isSubmitting} className="gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Patient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
