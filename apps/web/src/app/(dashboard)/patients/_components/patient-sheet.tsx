'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Patient, Doctor } from '@doctor-tracker/shared-types';
import { X, Loader2 } from 'lucide-react';

export const patientFormSchema = z.object({
  doctorId: z.string().min(1, 'Attending Doctor selection is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().int().min(0).max(120, 'Age must be between 0 and 120'),
  gender: z.enum(['Male', 'Female', 'Other']),
  condition: z.string().min(1, 'Condition is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
  visitDate: z.string().min(1, 'Visit date is required'),
  notes: z.string().max(500, 'Notes max 500 characters').optional(),
});

export type PatientFormData = z.infer<typeof patientFormSchema>;

interface PatientSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => Promise<void>;
  initialData?: Patient | null;
  doctors?: Doctor[];
  lockDoctorId?: string;
  title: string;
}

export default function PatientSheet({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  doctors = [],
  lockDoctorId,
  title,
}: PatientSheetProps) {
  const defaultDocId = lockDoctorId || (typeof initialData?.doctorId === 'object' ? initialData.doctorId._id : initialData?.doctorId) || '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    values: {
      doctorId: defaultDocId,
      name: initialData?.name || '',
      age: initialData?.age ?? 30,
      gender: initialData?.gender || 'Male',
      condition: initialData?.condition || '',
      phone: initialData?.phone || '',
      visitDate: initialData?.visitDate ? new Date(initialData.visitDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: initialData?.notes || '',
    },
  });

  if (!isOpen) return null;

  // Lookup locked doctor name for display
  const lockedDoctor = doctors.find((d) => d._id === lockDoctorId);
  const lockedDoctorDisplayName = lockedDoctor ? `${lockedDoctor.name} (${lockedDoctor.specialization})` : lockDoctorId;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">Enter patient diagnosis & appointment records</p>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form id="patient-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Attending Doctor</label>
              {lockDoctorId ? (
                <div>
                  <input type="hidden" {...register('doctorId')} value={lockDoctorId} />
                  <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium">
                    {lockedDoctorDisplayName}
                  </div>
                </div>
              ) : (
                <select
                  {...register('doctorId')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
                >
                  <option value="">Select a Doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name} ({doc.specialization})
                    </option>
                  ))}
                </select>
              )}
              {errors.doctorId && <p className="text-xs text-red-500 mt-1">{errors.doctorId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Name</label>
                <input
                  {...register('name')}
                  placeholder="Jane Doe"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  {...register('age')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
                {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  {...register('gender')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
                <input
                  {...register('condition')}
                  placeholder="Hypertension"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
                {errors.condition && <p className="text-xs text-red-500 mt-1">{errors.condition.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  {...register('phone')}
                  placeholder="+1 555-0182"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Visit Date</label>
                <input
                  type="date"
                  {...register('visitDate')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
                {errors.visitDate && <p className="text-xs text-red-500 mt-1">{errors.visitDate.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Medical Notes</label>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="Diagnosis details, prescription notes..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="patient-form"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Patient
          </button>
        </div>
      </div>
    </div>
  );
}
