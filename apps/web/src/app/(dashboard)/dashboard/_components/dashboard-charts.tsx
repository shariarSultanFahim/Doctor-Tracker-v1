'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { DashboardStats } from '@doctor-tracker/shared-types';

const PASTEL_COLORS = ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#34d399', '#fbbf24'];

export function PatientsOverTimeChart({ data = [] }: { data: DashboardStats['patientsOverTime'] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
          />
          <Area type="monotone" dataKey="count" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PatientsPerDoctorChart({ data = [] }: { data: DashboardStats['patientsPerDoctor'] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="doctorName" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
          />
          <Bar dataKey="patientCount" fill="#818cf8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PatientsByConditionChart({ data = [] }: { data: DashboardStats['patientsByCondition'] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full">
      <div className="h-64 w-full md:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="condition"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PASTEL_COLORS[index % PASTEL_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--popover)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '12px',
                color: 'var(--popover-foreground)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Rich Custom Legend Grid */}
      <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.map((entry, index) => {
          const percent = total > 0 ? ((entry.count / total) * 100).toFixed(1) : '0';
          const color = PASTEL_COLORS[index % PASTEL_COLORS.length];

          return (
            <div
              key={entry.condition || index}
              className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-muted/20"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs font-medium truncate">{entry.condition || 'Other'}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-foreground">{entry.count}</span>
                <span className="text-[10px] text-muted-foreground ml-1">({percent}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
