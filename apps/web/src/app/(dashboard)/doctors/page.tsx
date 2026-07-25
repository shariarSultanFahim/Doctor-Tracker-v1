'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDoctors, useCreateDoctor, useUpdateDoctor, useDeleteDoctor } from '@/hooks/use-doctors';
import { Doctor } from '@doctor-tracker/shared-types';
import DoctorModal from './_components/doctor-modal';
import { toast } from 'sonner';
import { Search, Plus, Eye, Edit2, Trash2, Calendar, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function DoctorsPage() {
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const { data, isLoading } = useDoctors({ search, specialization, page, limit });
  const createMutation = useCreateDoctor();
  const updateMutation = useUpdateDoctor();
  const deleteMutation = useDeleteDoctor();

  const handleCreateOrUpdate = async (formData: any) => {
    try {
      if (selectedDoctor) {
        await updateMutation.mutateAsync({ id: selectedDoctor._id, data: formData });
        toast.success('Doctor updated successfully');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Doctor created successfully');
      }
      setIsModalOpen(false);
      setSelectedDoctor(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this doctor?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Doctor deleted successfully');
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Delete failed');
      }
    }
  };

  const doctors = data?.data || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, page: 1, limit: 10 };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Doctors Directory</h1>
          <p className="text-sm text-slate-500">Manage and track medical specialists</p>
        </div>
        <button
          onClick={() => {
            setSelectedDoctor(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Doctor
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, specialization..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>
        <div className="flex w-full md:w-auto items-center gap-2">
          <input
            type="text"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            placeholder="Filter by specialization..."
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
          {(search || specialization) && (
            <button
              onClick={() => {
                setSearch('');
                setSpecialization('');
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Doctors DataTable */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Doctor Name</th>
                <th className="py-3.5 px-4">Specialization</th>
                <th className="py-3.5 px-4">Hospital</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Patients</th>
                <th className="py-3.5 px-4">Added On</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-sky-600" />
                    Loading doctors...
                  </td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No doctors found matching criteria.
                  </td>
                </tr>
              ) : (
                doctors.map((doctor) => (
                  <tr key={doctor._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">{doctor.name}</td>
                    <td className="py-3 px-4 text-slate-600">{doctor.specialization}</td>
                    <td className="py-3 px-4 text-slate-600">{doctor.hospital}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      <div>{doctor.phone}</div>
                      <div className="text-slate-400">{doctor.email}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-sky-700">{doctor.patientCount ?? 0}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {new Date(doctor.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <Link
                        href={`/doctors/${doctor._id}`}
                        className="p-1.5 inline-flex text-slate-400 hover:text-sky-600 rounded-md hover:bg-sky-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-amber-600 rounded-md hover:bg-amber-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doctor._id)}
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

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total doctors)
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

      <DoctorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDoctor(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={selectedDoctor}
        title={selectedDoctor ? 'Edit Doctor' : 'Add New Doctor'}
      />
    </div>
  );
}
