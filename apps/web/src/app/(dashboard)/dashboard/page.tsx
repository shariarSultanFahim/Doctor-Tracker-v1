'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useDashboardSummary, useDashboardStats } from '@/hooks/use-dashboard';
import { UserCheck, Users, Calculator, UserPlus, Loader2 } from 'lucide-react';

const PatientsOverTimeChart = dynamic(
  () => import('./_components/dashboard-charts').then((mod) => mod.PatientsOverTimeChart),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-xs text-slate-400">Loading chart...</div> }
);

const PatientsPerDoctorChart = dynamic(
  () => import('./_components/dashboard-charts').then((mod) => mod.PatientsPerDoctorChart),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-xs text-slate-400">Loading chart...</div> }
);

const PatientsByConditionChart = dynamic(
  () => import('./_components/dashboard-charts').then((mod) => mod.PatientsByConditionChart),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-xs text-slate-400">Loading chart...</div> }
);

export default function DashboardPage() {
  const [bucket, setBucket] = useState<'day' | 'week' | 'month'>('day');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data: summaryRes, isLoading: isSummaryLoading } = useDashboardSummary();
  const { data: statsRes, isLoading: isStatsLoading } = useDashboardStats({ from, to, bucket });

  const summary = summaryRes?.data || {
    totalDoctors: 0,
    totalPatients: 0,
    avgPatientsPerDoctor: 0,
    newPatientsLast30Days: 0,
  };

  const stats = statsRes?.data || {
    patientsOverTime: [],
    patientsPerDoctor: [],
    patientsByCondition: [],
    doctorsBySpecialization: [],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Analytics Overview</h1>
        <p className="text-sm text-slate-500">Real-time statistics for doctors and patient registrations</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500">Total Doctors</span>
            <span className="text-2xl font-bold text-slate-900">
              {isSummaryLoading ? '...' : summary.totalDoctors}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500">Total Patients</span>
            <span className="text-2xl font-bold text-slate-900">
              {isSummaryLoading ? '...' : summary.totalPatients}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500">Avg. Patients / Doctor</span>
            <span className="text-2xl font-bold text-slate-900">
              {isSummaryLoading ? '...' : summary.avgPatientsPerDoctor}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-pink-50 text-pink-600 rounded-xl">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500">New Patients (30d)</span>
            <span className="text-2xl font-bold text-slate-900">
              {isSummaryLoading ? '...' : summary.newPatientsLast30Days}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Controls for Charts */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 uppercase">Bucket:</span>
          {(['day', 'week', 'month'] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBucket(b)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                bucket === b ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
          />
          {(from || to) && (
            <button
              onClick={() => {
                setFrom('');
                setTo('');
              }}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-800">Patients Registered Over Time</h3>
          <PatientsOverTimeChart data={stats.patientsOverTime} />
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-800">Top 10 Doctors by Patients</h3>
          <PatientsPerDoctorChart data={stats.patientsPerDoctor} />
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-800">Patients Distribution by Condition</h3>
          <PatientsByConditionChart data={stats.patientsByCondition} />
        </div>
      </div>
    </div>
  );
}
