'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePatients, useCreatePatient, useUpdatePatient, useDeletePatient } from '@/hooks/use-patients';
import { useDoctors } from '@/hooks/use-doctors';
import { Patient } from '@doctor-tracker/shared-types';
import PatientModal from './_components/patient-modal';
import { toast } from 'sonner';
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Loader2, User } from 'lucide-react';

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [condition, setCondition] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const { data: patientsRes, isLoading } = usePatients({ search, condition, doctorId, page, limit: 10 });
  const { data: doctorsRes } = useDoctors({ limit: 100 });

  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();
  const deleteMutation = useDeletePatient();

  const patients = patientsRes?.data || [];
  const doctors = doctorsRes?.data || [];
  const pagination = patientsRes?.pagination || { total: 0, totalPages: 1, page: 1, limit: 10 };

  const handleCreateOrUpdate = async (formData: any) => {
    try {
      if (selectedPatient) {
        await updateMutation.mutateAsync({ id: selectedPatient._id, data: formData });
        toast.success('Patient record updated');
      } else {
        await createMutation.mutateAsync({ doctorId: formData.doctorId, data: formData });
        toast.success('Patient record created');
      }
      setIsModalOpen(false);
      setSelectedPatient(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this patient record?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Patient record deleted');
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Delete failed');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Patients Directory</h1>
          <p className="text-sm text-slate-500">Manage patient records across all medical specialists</p>
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

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient name..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <div className="flex flex-wrap w-full md:w-auto items-center gap-2">
          <input
            type="text"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="Filter by condition..."
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white"
          >
            <option value="">All Doctors</option>
            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.name}
              </option>
            ))}
          </select>
          {(search || condition || doctorId) && (
            <button
              onClick={() => {
                setSearch('');
                setCondition('');
                setDoctorId('');
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Patients DataTable */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-600 uppercase">
                <th className="py-3.5 px-4">Patient Name</th>
                <th className="py-3.5 px-4">Age / Gender</th>
                <th className="py-3.5 px-4">Condition</th>
                <th className="py-3.5 px-4">Assigned Doctor</th>
                <th className="py-3.5 px-4">Visit Date</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-sky-600" />
                    Loading patient records...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No patients found matching criteria.
                  </td>
                </tr>
              ) : (
                patients.map((patient) => {
                  const docId = typeof patient.doctorId === 'object' ? patient.doctorId._id : patient.doctorId;
                  return (
                    <tr key={patient._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">{patient.name}</td>
                      <td className="py-3 px-4 text-slate-600">{patient.age} / {patient.gender}</td>
                      <td className="py-3 px-4 text-slate-600">{patient.condition}</td>
                      <td className="py-3 px-4 text-sky-600 font-medium">
                        <Link href={`/doctors/${docId}`} className="hover:underline">
                          {patient.doctorName || 'View Doctor'}
                        </Link>
                      </td>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total patients)
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
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
        doctors={doctors}
        title={selectedPatient ? 'Edit Patient Record' : 'Add New Patient'}
      />
    </div>
  );
}
