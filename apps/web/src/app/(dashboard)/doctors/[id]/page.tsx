'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';
import { useDebounce } from 'use-debounce';
import { useDoctor, useUpdateDoctor, useDeleteDoctor } from '@/hooks/use-doctors';
import { useDoctorPatients, useCreatePatient, useUpdatePatient, useDeletePatient } from '@/hooks/use-patients';
import { Patient } from '@doctor-tracker/shared-types';
import PatientSheet, { PatientFormData } from '../../patients/_components/patient-sheet';
import DoctorSheet, { DoctorFormData } from '../../doctors/_components/doctor-sheet';
import { toast } from 'sonner';
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';

export default function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // NUQS State
  const [searchParam, setSearchParam] = useQueryState('search', parseAsString.withDefault(''));
  const [pageParam, setPageParam] = useQueryState('page', parseAsInteger.withDefault(1));

  // Local input state for debounced search
  const [searchInputValue, setSearchInputValue] = useState(searchParam);
  const [debouncedSearch] = useDebounce(searchInputValue, 300);

  const [isPatientSheetOpen, setIsPatientSheetOpen] = useState(false);
  const [isDoctorSheetOpen, setIsDoctorSheetOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const { data: doctorRes, isLoading: isDoctorLoading } = useDoctor(id);
  const { data: patientsRes, isLoading: isPatientsLoading } = useDoctorPatients(id, {
    search: debouncedSearch,
    page: pageParam,
    limit: 10,
  });

  const updateDoctorMutation = useUpdateDoctor();
  const deleteDoctorMutation = useDeleteDoctor();
  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();
  const deletePatientMutation = useDeletePatient();

  const doctor = doctorRes?.data;
  const patients = patientsRes?.data || [];
  const pagination = patientsRes?.pagination || { total: 0, totalPages: 1, page: 1, limit: 10 };

  const handleSearchChange = (val: string) => {
    setSearchInputValue(val);
    setSearchParam(val || null);
    setPageParam(1);
  };

  const handleDoctorEditSubmit = async (formData: DoctorFormData) => {
    try {
      await updateDoctorMutation.mutateAsync({ id, data: formData });
      toast.success('Doctor profile updated successfully');
      setIsDoctorSheetOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const handleDoctorDelete = async () => {
    if (confirm('Are you sure you want to delete this doctor? This will not delete their assigned patients, but their attending doctor reference will be unlinked.')) {
      try {
        await deleteDoctorMutation.mutateAsync(id);
        toast.success('Doctor profile deleted successfully');
        router.push('/doctors');
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Delete failed');
      }
    }
  };

  const handleCreateOrUpdate = async (formData: PatientFormData) => {
    try {
      if (selectedPatient) {
        await updatePatientMutation.mutateAsync({ id: selectedPatient._id, data: formData });
        toast.success('Patient record updated');
      } else {
        await createPatientMutation.mutateAsync({ doctorId: id, data: { ...formData, doctorId: id } });
        toast.success('Patient added to doctor roster');
      }
      setIsPatientSheetOpen(false);
      setSelectedPatient(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (patientId: string) => {
    if (confirm('Are you sure you want to delete this patient record?')) {
      try {
        await deletePatientMutation.mutateAsync(patientId);
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
    return <div className="py-12 text-center text-slate-500">Doctor profile not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Link href="/doctors" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Doctors Directory
      </Link>

      {/* Doctor Summary Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 shadow-inner animate-in fade-in zoom-in duration-300">
            {doctor.avatar ? (
              <img src={doctor.avatar} alt={doctor.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-slate-400">
                {doctor.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{doctor.name}</h1>
            <p className="text-sm font-medium text-sky-600">{doctor.specialization}</p>
            <p className="text-xs text-slate-500 mt-1">{doctor.hospital}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6">
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
          <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
            <button
              onClick={() => setIsDoctorSheetOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Profile
            </button>
            <button
              onClick={handleDoctorDelete}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium text-xs rounded-lg transition-colors border border-red-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Profile
            </button>
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
            setIsPatientSheetOpen(true);
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
              value={searchInputValue}
              onChange={(e) => handleSearchChange(e.target.value)}
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
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          {patient.avatar ? (
                            <img src={patient.avatar} alt={patient.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-slate-400">
                              {patient.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span>{patient.name}</span>
                      </div>
                    </td>
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
                          setIsPatientSheetOpen(true);
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

        {/* NUQS Synced Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total patients)
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPageParam(pagination.page - 1)}
              className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPageParam(pagination.page + 1)}
              className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <PatientSheet
        isOpen={isPatientSheetOpen}
        onClose={() => {
          setIsPatientSheetOpen(false);
          setSelectedPatient(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={selectedPatient}
        doctors={doctor ? [doctor] : []}
        lockDoctorId={id}
        title={selectedPatient ? 'Edit Patient Record' : 'Add New Patient'}
      />

      <DoctorSheet
        isOpen={isDoctorSheetOpen}
        onClose={() => setIsDoctorSheetOpen(false)}
        onSubmit={handleDoctorEditSubmit}
        initialData={doctor}
        title="Edit Doctor Details"
      />
    </div>
  );
}
