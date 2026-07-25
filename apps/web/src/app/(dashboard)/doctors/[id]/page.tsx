'use client';

import { use, useState } from 'react';
import { useDoctor } from '@/hooks/use-doctors';
import { useDoctorPatients, useCreatePatient, useUpdatePatient, useDeletePatient } from '@/hooks/use-patients';
import { Patient } from '@doctor-tracker/shared-types';
import PatientModal from '../../patients/_components/patient-modal';
import { toast } from 'sonner';
import { UserCheck, Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const { data: doctorRes, isLoading: isDoctorLoading } = useDoctor(id);
  const { data: patientsRes, isLoading: isPatientsLoading } = useDoctorPatients(id, { search, page, limit: 10 });

  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();
  const deleteMutation = useDeletePatient();

  const doctor = doctorRes?.data;
  const patients = patientsRes?.data || [];
  const pagination = patientsRes?.pagination || { total: 0, totalPages: 1, page: 1, limit: 10 };

  const handleCreateOrUpdate = async (formData: any) => {
    try {
      if (selectedPatient) {
        await updateMutation.mutateAsync({ id: selectedPatient._id, data: formData });
        toast.success('Patient record updated');
      } else {
        await createMutation.mutateAsync({ doctorId: id, data: { ...formData, doctorId: id } });
        toast.success('Patient added to doctor roster');
      }
      setIsModalOpen(false);
      setSelectedPatient(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (patientId: string) => {
    if (confirm('Delete this patient record?')) {
      try {
        await deleteMutation.mutateAsync(patientId);
        toast.success('Patient record deleted');
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Delete failed');
      }
    }
  };

  if (isDoctorLoading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-sky-600" />
        Loading doctor profile...
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="py-12 text-center text-slate-500">
        Doctor profile not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/doctors" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Doctors
      </Link>

      {/* Doctor Summary Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <UserCheck className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{doctor.name}</h1>
            <p className="text-sm font-medium text-sky-600">{doctor.specialization}</p>
            <p className="text-xs text-slate-500 mt-1">{doctor.hospital}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-xs border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
          <div>
            <span className="block text-slate-400 font-medium">Phone</span>
            <span className="font-semibold text-slate-800">{doctor.phone}</span>
          </div>
          <div>
            <span className="block text-slate-400 font-medium">Email</span>
            <span className="font-semibold text-slate-800">{doctor.email}</span>
          </div>
          <div>
            <span className="block text-slate-400 font-medium">Registered</span>
            <span className="font-semibold text-slate-800">{new Date(doctor.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Scoped Patient List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Assigned Patients</h2>
          <p className="text-xs text-slate-500">Patients undergoing care under {doctor.name}</p>
        </div>
        <button
          onClick={() => {
            setSelectedPatient(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Patient
        </button>
      </div>

      {/* Scoped Patients DataTable */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-600 uppercase">
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Age / Gender</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Visit Date</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isPatientsLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-1 text-sky-600" />
                    Fetching patient records...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No patients assigned to this doctor yet.
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">{patient.name}</td>
                    <td className="py-3 px-4 text-slate-600">{patient.age} / {patient.gender}</td>
                    <td className="py-3 px-4 text-slate-600">{patient.condition}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {new Date(patient.visitDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{patient.phone}</td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-amber-600 rounded-md hover:bg-amber-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(patient._id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PatientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPatient(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={selectedPatient}
        lockDoctorId={id}
        title={selectedPatient ? 'Edit Patient Record' : 'Add New Patient'}
      />
    </div>
  );
}
