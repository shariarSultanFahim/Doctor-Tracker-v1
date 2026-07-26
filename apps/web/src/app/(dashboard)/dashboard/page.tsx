'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useDashboardSummary, useDashboardStats } from '@/hooks/use-dashboard';
import { useAuth } from '@/hooks/use-auth';
import { useWeather } from '@/hooks/use-weather';
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
  const [greeting, setGreeting] = useState('Good Morning!');

  const { user } = useAuth();
  const { data: weather, isLoading: isWeatherLoading } = useWeather();
  const { data: summaryRes, isLoading: isSummaryLoading } = useDashboardSummary();
  const { data: statsRes } = useDashboardStats({ from, to, bucket });

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

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Good Morning!');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good Afternoon!');
    } else if (hour >= 17 && hour < 22) {
      setGreeting('Good Evening!');
    } else {
      setGreeting('Good Night!');
    }
  }, []);

  const userName = user?.name || 'Dr. Admin';
  const userRole = user?.email ? 'Medical Administrator' : 'Administrator';

  return (
    <div className="space-y-6">
      {/* Top Section Grid: Patient History Stats (Left) + Greetings Card (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left Side: Incoming Patient History Stats (Order 2 on mobile, Order 1 on desktop) */}
        <div className="xl:col-span-8 order-2 xl:order-1 glass-card p-4 rounded-2xl border border-border shadow-sm space-y-3">
          {/* Header Bar inside card */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <h2 className="text-sm font-bold text-foreground">Incoming Patient History</h2>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">Bucket:</span>
                <Tabs value={bucket} onValueChange={(val) => setBucket(val as any)}>
                  <TabsList className="h-7 p-0.5">
                    <TabsTrigger value="day" className="text-[11px] px-2 h-6">Day</TabsTrigger>
                    <TabsTrigger value="week" className="text-[11px] px-2 h-6">Week</TabsTrigger>
                    <TabsTrigger value="month" className="text-[11px] px-2 h-6">Month</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-32 sm:w-36">
                  <DatePicker value={from} onChange={setFrom} placeholder="From date" />
                </div>
                <span className="text-[11px] text-muted-foreground">to</span>
                <div className="w-32 sm:w-36">
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
                    className="text-xs h-7 px-2"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* 4 Stat Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Card 1: Total Doctors */}
            <div className="p-3 rounded-xl bg-background/80 border border-border/60 flex flex-col justify-between space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                  <UserCheck className="h-3.5 w-3.5" />
                </div>
                <span className="text-lg font-bold text-foreground">
                  {isSummaryLoading ? '...' : summary.totalDoctors}
                </span>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground truncate">Total Doctors</span>
            </div>

            {/* Card 2: Total Patients */}
            <div className="p-3 rounded-xl bg-background/80 border border-border/60 flex flex-col justify-between space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-indigo-500/10 text-indigo-500">
                  <Users className="h-3.5 w-3.5" />
                </div>
                <span className="text-lg font-bold text-foreground">
                  {isSummaryLoading ? '...' : summary.totalPatients}
                </span>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground truncate">Total Patients</span>
            </div>

            {/* Card 3: Avg Patients / Doctor */}
            <div className="p-3 rounded-xl bg-background/80 border border-border/60 flex flex-col justify-between space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-purple-500/10 text-purple-500">
                  <Calculator className="h-3.5 w-3.5" />
                </div>
                <span className="text-lg font-bold text-foreground">
                  {isSummaryLoading ? '...' : summary.avgPatientsPerDoctor}
                </span>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground truncate">Avg. Patients / Doctor</span>
            </div>

            {/* Card 4: New Patients (30d) */}
            <div className="p-3 rounded-xl bg-background/80 border border-border/60 flex flex-col justify-between space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-pink-500/10 text-pink-500">
                  <UserPlus className="h-3.5 w-3.5" />
                </div>
                <span className="text-lg font-bold text-foreground">
                  {isSummaryLoading ? '...' : summary.newPatientsLast30Days}
                </span>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground truncate">New Patients (30d)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Greetings Card (Order 1 on mobile, Order 2 on desktop) */}
        <div className="xl:col-span-4 order-1 xl:order-2 glass-card p-4 sm:p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between gap-4">
          {/* Left Column Info */}
          <div className="flex flex-col justify-between space-y-3 flex-1 min-w-0">
            <div className="space-y-1">
              <div
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent/60 text-[11px] font-semibold text-accent-foreground border border-border/40"
                title={weather?.description ? `${weather.description} (${weather.city})` : 'Weather'}
              >
                <span>{weather ? weather.emoji : '🌤️'}</span>
                <span>{isWeatherLoading ? '...' : `${weather?.temp ?? 24}°C`}</span>
                {weather?.city && <span className="text-[10px] opacity-70 font-normal ml-0.5">({weather.city})</span>}
              </div>
              <p className="text-xs font-medium text-muted-foreground pt-0.5">{greeting}</p>
            </div>

            <div>
              <h3 className="text-base font-bold text-foreground leading-tight truncate">{userName}</h3>
              <p className="text-xs text-muted-foreground font-medium truncate">{userRole}</p>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground pt-2 border-t border-border/40">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Doctors: <strong className="text-foreground font-bold">{isSummaryLoading ? '...' : summary.totalDoctors}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Patients: <strong className="text-foreground font-bold">{isSummaryLoading ? '...' : summary.totalPatients}</strong></span>
              </div>
            </div>
          </div>

          {/* Right Center: Radial Circular Progress Gauge */}
          <div className="relative w-22 h-22 sm:w-28 sm:h-28 flex items-center justify-center shrink-0 my-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-muted/30"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-sidebar-primary"
                strokeDasharray="78, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl sm:text-2xl font-bold text-foreground leading-none">
                {summary.totalPatients}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-semibold mt-1">Patients</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5 rounded-xl border border-border shadow-sm space-y-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground">Patients Registered Over Time</h3>
          <PatientsOverTimeChart data={stats.patientsOverTime} />
        </div>

        {/* Patients Distribution by Condition */}
        <div className="glass-card p-5 rounded-xl border border-border shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Patients Distribution by Condition</h3>
          <PatientsByConditionChart data={stats.patientsByCondition} />
        </div>

        {/* Top 5 Doctors by Patients */}
        <div className="glass-card p-5 rounded-xl border border-border shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Top 5 Doctors by Patients</h3>
          <PatientsPerDoctorChart data={stats.patientsPerDoctor} />
        </div>
      </div>
    </div>
  );
}
