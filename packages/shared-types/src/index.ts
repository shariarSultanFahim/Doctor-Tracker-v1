export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin';
  createdAt: string;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  patientCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type Gender = 'Male' | 'Female' | 'Other';

export interface Patient {
  _id: string;
  doctorId: string | Doctor;
  doctorName?: string;
  name: string;
  age: number;
  gender: Gender;
  condition: string;
  phone: string;
  visitDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalDoctors: number;
  totalPatients: number;
  avgPatientsPerDoctor: number;
  newPatientsLast30Days: number;
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface DoctorPatientCount {
  doctorName: string;
  patientCount: number;
}

export interface CategoryCount {
  condition?: string;
  specialization?: string;
  count: number;
}

export interface DashboardStats {
  patientsOverTime: TimeSeriesPoint[];
  patientsPerDoctor: DoctorPatientCount[];
  patientsByCondition: { condition: string; count: number }[];
  doctorsBySpecialization: { specialization: string; count: number }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
