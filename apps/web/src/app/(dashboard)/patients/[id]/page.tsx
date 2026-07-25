'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePatient, useUpdatePatient, useDeletePatient } from '@/hooks/use-patients';
import { useDoctors } from '@/hooks/use-doctors';
import PatientSheet, { PatientFormData } from '../_components/patient-sheet';
import { toast } from 'sonner';
import { User, Calendar, Phone, Heart, FileText, Edit2, Trash2, ArrowLeft, Loader2, Landmark } from 'lucide-react';

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { data: patientRes, isLoading: isPatientLoading } = usePatient(id);
  const { data: doctorsRes } = useDoctors({ limit: 1000 });

  const updateMutation = useUpdatePatient();
  const deleteMutation = useDeletePatient();

  const patient = patientRes?.data;
  const doctors = doctorsRes?.data || [];

  const handleEditSubmit = async (formData: PatientFormData) => {
    try {
      await updateMutation.mutateAsync({ id, data: formData });
      toast.success('Patient record updated successfully');
      setIsSheetOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this patient record?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Patient record deleted successfully');
        router.push('/patients');
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Delete failed');
      }
    }
  };

  if (isPatientLoading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-sky-600" />
        Loading patient records...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-4 py-12 text-center text-slate-500">
        <div>Patient record not found.</div>
        <Link href="/patients" className="text-sky-600 font-medium hover:underline">
          Return to Patients List
        </Link>
      </div>
    );
  }

  const doctorVal = patient.doctorId;
  const attendingDoctor = typeof doctorVal === 'object' ? doctorVal : null;
  const attendingDoctorId = attendingDoctor?._id || (typeof doctorVal === 'string' ? doctorVal : '');

  return (
    <div className="space-y-6 max-w-5xl">
      <Link href="/patients" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Patients List
      </Link>

      {/* Patient Summary Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 shadow-inner animate-in fade-in zoom-in duration-300">
            {patient.avatar ? (
              <img src={patient.avatar} alt={patient.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-slate-400">
                {patient.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
            <p className="text-sm font-medium text-slate-500">{patient.age} years old • {patient.gender}</p>
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
              <Heart className="h-3 w-3 fill-rose-500 text-rose-500 animate-pulse" />
              {patient.condition}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-wrap gap-4 text-xs border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
            <div>
              <span className="block text-slate-400 font-medium">Phone</span>
              <span className="font-semibold text-slate-800">{patient.phone}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-medium">Last Visit</span>
              <span className="font-semibold text-slate-800">{new Date(patient.visitDate).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-medium">Registered</span>
              <span className="font-semibold text-slate-800">{new Date(patient.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
            <button
              onClick={() => setIsSheetOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Profile
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium text-xs rounded-lg transition-colors border border-red-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Record
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Observation Notes */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-slate-400" />
              Clinical Observation Notes
            </h3>
            <div className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-5 rounded-lg border border-slate-100 whitespace-pre-wrap min-h-[12rem] shadow-inner">
              {patient.notes || 'No observation notes provided for this patient record.'}
            </div>
          </div>
        </div>

        {/* Right Column: Attending Doctor */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Landmark className="h-4 w-4 text-slate-400" />
              Attending Practitioner
            </h3>

            {attendingDoctor ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 shadow-inner">
                    {attendingDoctor.avatar ? (
                      <img src={attendingDoctor.avatar} alt={attendingDoctor.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-slate-400">
                        {attendingDoctor.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <Link href={`/doctors/${attendingDoctorId}`} className="font-semibold text-slate-900 hover:text-sky-600 hover:underline block text-sm">
                      {attendingDoctor.name}
                    </Link>
                    <span className="text-xs text-sky-600 font-medium">{attendingDoctor.specialization}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                  <div>
                    <span className="block text-slate-400 font-medium">Hospital / Facility</span>
                    <span className="font-semibold text-slate-700">{attendingDoctor.hospital}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-medium">Doctor Email</span>
                    <span className="font-semibold text-slate-700">{attendingDoctor.email}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">
                Attending doctor information is unavailable or unpopulated.
                {attendingDoctorId && (
                  <div className="mt-2">
                    <Link href={`/doctors/${attendingDoctorId}`} className="text-sky-600 font-semibold hover:underline">
                      View Attending Doctor Profile
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <PatientSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={patient}
        doctors={doctors}
        title="Edit Patient Details"
      />
    </div>
  );
}
