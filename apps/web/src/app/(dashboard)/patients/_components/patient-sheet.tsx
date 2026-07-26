'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Patient, Doctor } from '@doctor-tracker/shared-types';
import DoctorCombobox from '@/components/shared/doctor-combobox';
import DatePicker from '@/components/shared/date-picker';
import AvatarWithFallback from '@/components/shared/avatar-with-fallback';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const patientFormSchema = z.object({
  doctorId: z.string().min(1, 'Attending Doctor selection is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().int().min(0).max(120, 'Age must be between 0 and 120'),
  gender: z.enum(['Male', 'Female', 'Other']),
  condition: z.string().min(1, 'Condition is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
  visitDate: z.string().min(1, 'Visit date is required'),
  notes: z.string().max(500, 'Notes max 500 characters').optional(),
  avatar: z.string().optional(),
  bloodGroup: z.string().optional(),
  emergencyContact: z.string().optional(),
  address: z.string().optional(),
  allergies: z.string().optional(), // Comma separated in UI
  medicalHistory: z.string().optional(), // Comma separated in UI
});

export type PatientFormDataInput = z.infer<typeof patientFormSchema>;

export interface PatientFormData extends Omit<PatientFormDataInput, 'allergies' | 'medicalHistory'> {
  allergies?: string[];
  medicalHistory?: string[];
}

interface PatientSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => Promise<void>;
  initialData?: Patient | null;
  doctors?: Doctor[];
  defaultDoctorId?: string;
  isLoading?: boolean;
}

export default function PatientSheet({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  doctors = [],
  defaultDoctorId,
  isLoading = false,
}: PatientSheetProps) {
  const doctorIdVal =
    defaultDoctorId ||
    (typeof initialData?.doctorId === 'object' ? initialData.doctorId._id : initialData?.doctorId) ||
    '';

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatientFormDataInput>({
    resolver: zodResolver(patientFormSchema),
    values: {
      doctorId: doctorIdVal,
      name: initialData?.name || '',
      age: initialData?.age ?? 30,
      gender: initialData?.gender || 'Male',
      condition: initialData?.condition || '',
      phone: initialData?.phone || '',
      visitDate: initialData?.visitDate
        ? new Date(initialData.visitDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      notes: initialData?.notes || '',
      avatar: initialData?.avatar || '',
      bloodGroup: initialData?.bloodGroup || 'O+',
      emergencyContact: initialData?.emergencyContact || '',
      address: initialData?.address || '',
      allergies: initialData?.allergies ? initialData.allergies.join(', ') : '',
      medicalHistory: initialData?.medicalHistory ? initialData.medicalHistory.join(', ') : '',
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

  const handleFormSubmit = async (data: PatientFormDataInput) => {
    const formattedData: PatientFormData = {
      ...data,
      allergies: data.allergies
        ? data.allergies.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      medicalHistory: data.medicalHistory
        ? data.medicalHistory.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };
    await onSubmit(formattedData);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md glass-card flex flex-col justify-between overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{initialData ? 'Edit Patient Record' : 'Register New Patient'}</SheetTitle>
          <SheetDescription>Enter complete clinical records and personal medical history</SheetDescription>
        </SheetHeader>

        <form id="patient-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 my-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative group cursor-pointer">
              <AvatarWithFallback
                src={watchAvatar}
                name={watchName || 'Patient'}
                className="w-20 h-20 border-2 border-primary/20 text-xl font-bold"
              />
              <label
                htmlFor="patient-avatar"
                className="absolute inset-0 bg-black/60 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-medium"
              >
                Upload
              </label>
              <input
                id="patient-avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <span className="text-[11px] text-muted-foreground">Click photo to update avatar</span>
          </div>

          {/* Attending Doctor Combobox */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Attending Doctor *</label>
            <Controller
              name="doctorId"
              control={control}
              render={({ field }) => (
                <DoctorCombobox
                  doctors={doctors}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select doctor..."
                />
              )}
            />
            {errors.doctorId && <p className="text-xs text-destructive mt-1">{errors.doctorId.message}</p>}
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Full Name *</label>
              <input
                type="text"
                {...register('name')}
                placeholder="Patient name"
                className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Contact Phone *</label>
              <input
                type="text"
                {...register('phone')}
                placeholder="+1 555-0192"
                className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          {/* Age, Gender & Blood Group */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Age *</label>
              <input
                type="number"
                {...register('age')}
                className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.age && <p className="text-xs text-destructive mt-1">{errors.age.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Gender *</label>
              <select
                {...register('gender')}
                className="w-full px-2 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Blood Group</label>
              <select
                {...register('bloodGroup')}
                className="w-full px-2 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition & Visit Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Condition / Diagnosis *</label>
              <input
                type="text"
                {...register('condition')}
                placeholder="e.g. Hypertension"
                className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.condition && <p className="text-xs text-destructive mt-1">{errors.condition.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Visit Date *</label>
              <Controller
                name="visitDate"
                control={control}
                render={({ field }) => (
                  <DatePicker value={field.value} onChange={field.onChange} placeholder="Visit date" />
                )}
              />
            </div>
          </div>

          {/* Emergency Contact & Address */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Emergency Contact</label>
            <input
              type="text"
              {...register('emergencyContact')}
              placeholder="+1 555-0911 (Relative)"
              className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Home Address</label>
            <input
              type="text"
              {...register('address')}
              placeholder="Full address"
              className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Allergies & Medical History (Comma separated) */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Known Allergies (Comma-separated)</label>
            <input
              type="text"
              {...register('allergies')}
              placeholder="e.g. Penicillin, Peanuts"
              className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Surgical / Medical History (Comma-separated)</label>
            <input
              type="text"
              {...register('medicalHistory')}
              placeholder="e.g. Appendectomy (2018), Knee Surgery (2021)"
              className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Clinical Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Patient symptoms & observation..."
              className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </form>

        <SheetFooter className="pt-4 border-t border-border/40 gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" form="patient-form" size="sm" disabled={isLoading} className="gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {initialData ? 'Save Changes' : 'Register Patient'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
