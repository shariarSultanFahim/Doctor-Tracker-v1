'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Doctor } from '@doctor-tracker/shared-types';
import { X, Loader2 } from 'lucide-react';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
            <input
              {...register('name')}
              placeholder="Dr. Sarah Jenkins"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Specialization</label>
            <input
              {...register('specialization')}
              placeholder="Cardiology"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
            {errors.specialization && <p className="text-xs text-red-500 mt-1">{errors.specialization.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Hospital / Clinic</label>
            <input
              {...register('hospital')}
              placeholder="City General Hospital"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
            {errors.hospital && <p className="text-xs text-red-500 mt-1">{errors.hospital.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
            <input
              {...register('phone')}
              placeholder="+1 555-0192"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              {...register('email')}
              placeholder="s.jenkins@hospital.org"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Doctor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
