import { Doctor } from '../models/doctor.model.js';
import { Patient } from '../models/patient.model.js';
import { DashboardSummary, DashboardStats } from '@doctor-tracker/shared-types';

export class DashboardRepository {
  async getSummary(): Promise<DashboardSummary> {
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await Patient.countDocuments();
    const avgPatientsPerDoctor = totalDoctors > 0 ? Number((totalPatients / totalDoctors).toFixed(1)) : 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newPatientsLast30Days = await Patient.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    return {
      totalDoctors,
      totalPatients,
      avgPatientsPerDoctor,
      newPatientsLast30Days,
    };
  }

  async getStats(from?: string, to?: string, bucket: 'day' | 'week' | 'month' = 'day'): Promise<DashboardStats> {
    const dateMatch: Record<string, unknown> = {};
    if (from || to) {
      dateMatch.visitDate = {};
      if (from) (dateMatch.visitDate as Record<string, Date>).$gte = new Date(from);
      if (to) (dateMatch.visitDate as Record<string, Date>).$lte = new Date(to);
    }

    let dateFormat = '%Y-%m-%d';
    if (bucket === 'week') dateFormat = '%Y-W%V';
    if (bucket === 'month') dateFormat = '%Y-%m';

    const patientsOverTime = await Patient.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$visitDate' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } },
    ]);

    const patientsPerDoctor = await Patient.aggregate([
      {
        $group: {
          _id: '$doctorId',
          patientCount: { $sum: 1 },
        },
      },
      { $sort: { patientCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      { $unwind: '$doctor' },
      {
        $project: {
          doctorName: '$doctor.name',
          patientCount: 1,
          _id: 0,
        },
      },
    ]);

    const patientsByCondition = await Patient.aggregate([
      {
        $group: {
          _id: '$condition',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $project: { condition: '$_id', count: 1, _id: 0 } },
    ]);

    const doctorsBySpecialization = await Doctor.aggregate([
      {
        $group: {
          _id: '$specialization',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $project: { specialization: '$_id', count: 1, _id: 0 } },
    ]);

    return {
      patientsOverTime,
      patientsPerDoctor,
      patientsByCondition,
      doctorsBySpecialization,
    };
  }
}
