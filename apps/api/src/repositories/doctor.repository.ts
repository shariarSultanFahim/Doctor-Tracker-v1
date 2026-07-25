import { Doctor, DoctorDocument } from '../models/doctor.model.js';
import { PaginatedResponse } from '@doctor-tracker/shared-types';

export interface DoctorQueryParams {
  search?: string;
  specialization?: string;
  from?: string;
  to?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export class DoctorRepository {
  async findPaginated(params: DoctorQueryParams): Promise<PaginatedResponse<DoctorDocument>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const skip = (page - 1) * limit;

    const match: Record<string, unknown> = {};

    if (params.search) {
      match.$text = { $search: params.search };
    }

    if (params.specialization) {
      match.specialization = params.specialization;
    }

    if (params.from || params.to) {
      match.createdAt = {};
      if (params.from) (match.createdAt as Record<string, Date>).$gte = new Date(params.from);
      if (params.to) (match.createdAt as Record<string, Date>).$lte = new Date(params.to);
    }

    const sortStage: Record<string, 1 | -1> = {};
    if (params.sort) {
      const field = params.sort.startsWith('-') ? params.sort.substring(1) : params.sort;
      const order = params.sort.startsWith('-') ? -1 : 1;
      sortStage[field] = order;
    } else {
      sortStage.createdAt = -1;
    }

    const pipeline: any[] = [
      { $match: match },
      {
        $lookup: {
          from: 'patients',
          localField: '_id',
          foreignField: 'doctorId',
          as: 'patientsList',
        },
      },
      {
        $addFields: {
          patientCount: { $size: '$patientsList' },
        },
      },
      { $project: { patientsList: 0 } },
      { $sort: sortStage },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const result = await Doctor.aggregate(pipeline);
    const data = result[0]?.data || [];
    const total = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findById(id: string): Promise<DoctorDocument | null> {
    return Doctor.findById(id);
  }

  async create(data: Partial<DoctorDocument>): Promise<DoctorDocument> {
    return Doctor.create(data);
  }

  async update(id: string, data: Partial<DoctorDocument>): Promise<DoctorDocument | null> {
    return Doctor.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id: string): Promise<DoctorDocument | null> {
    return Doctor.findByIdAndDelete(id);
  }
}
