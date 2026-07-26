'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useDashboardSummary, useDashboardStats } from '@/hooks/use-dashboard';
import { UserCheck, Users, Calculator, UserPlus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DatePicker from '@/components/shared/date-picker';
import { Button } from '@/components/ui/button';

const PatientsOverTimeChart = dynamic(
  () => import('./_components/dashboard-charts').then((mod) => mod.PatientsOverTimeChart),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">Loading chart...</div> }
);

const PatientsPerDoctorChart = dynamic(
  () => import('./_components/dashboard-charts').then((mod) => mod.PatientsPerDoctorChart),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">Loading chart...</div> }
);

const PatientsByConditionChart = dynamic(
  () => import('./_components/dashboard-charts').then((mod) => mod.PatientsByConditionChart),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">Loading chart...</div> }
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
        <h1 className="text-xl font-bold text-foreground">Analytics Overview</h1>
        <p className="text-sm text-muted-foreground">Real-time statistics for doctors and patient registrations</p>
      </div>

      {/* Stat Cards Grid with Glassmorphic styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-medium text-muted-foreground">Total Doctors</span>
            <span className="text-2xl font-bold text-foreground">
              {isSummaryLoading ? '...' : summary.totalDoctors}
            </span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-medium text-muted-foreground">Total Patients</span>
            <span className="text-2xl font-bold text-foreground">
              {isSummaryLoading ? '...' : summary.totalPatients}
            </span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-medium text-muted-foreground">Avg. Patients / Doctor</span>
            <span className="text-2xl font-bold text-foreground">
              {isSummaryLoading ? '...' : summary.avgPatientsPerDoctor}
            </span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-pink-500/10 text-pink-500 rounded-xl">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-medium text-muted-foreground">New Patients (30d)</span>
            <span className="text-2xl font-bold text-foreground">
              {isSummaryLoading ? '...' : summary.newPatientsLast30Days}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Controls with ShadCN Tabs & DatePicker */}
      <div className="glass-card p-4 rounded-xl border border-border shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Bucket:</span>
          <Tabs value={bucket} onValueChange={(val) => setBucket(val as any)}>
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-36">
            <DatePicker value={from} onChange={setFrom} placeholder="From date" />
          </div>
          <span className="text-xs text-muted-foreground">to</span>
          <div className="w-36">
            <DatePicker value={to} onChange={setTo} placeholder="To date" />
          </div>
          {(from || to) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFrom('');
                setTo('');
              }}
              className="text-xs"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Visual Charts Grid with Swapped Chart Positions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5 rounded-xl border border-border shadow-sm space-y-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground">Patients Registered Over Time</h3>
          <PatientsOverTimeChart data={stats.patientsOverTime} />
        </div>

        {/* Swapped chart 1: Patients Distribution by Condition */}
        <div className="glass-card p-5 rounded-xl border border-border shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Patients Distribution by Condition</h3>
          <PatientsByConditionChart data={stats.patientsByCondition} />
        </div>

        {/* Swapped chart 2: Top 10 Doctors by Patients */}
        <div className="glass-card p-5 rounded-xl border border-border shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Top 10 Doctors by Patients</h3>
          <PatientsPerDoctorChart data={stats.patientsPerDoctor} />
        </div>
      </div>
    </div>
  );
}
