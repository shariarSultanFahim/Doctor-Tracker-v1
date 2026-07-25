import { Patient, PatientDocument } from '../models/patient.model.js';
import { PaginatedResponse } from '@doctor-tracker/shared-types';
import { Types } from 'mongoose';

export interface PatientQueryParams {
  search?: string;
  condition?: string;
  doctorId?: string;
  from?: string;
  to?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

/**
 * Converts a search term into a fuzzy regex pattern allowing optional character gaps.
 */
function buildFuzzyRegex(term: string): RegExp {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const fuzzyPattern = escaped.split('').join('.*');
  return new RegExp(fuzzyPattern, 'i');
}

export class PatientRepository {
  async findPaginated(params: PatientQueryParams): Promise<PaginatedResponse<PatientDocument>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const skip = (page - 1) * limit;

    const match: Record<string, unknown> = {};

    if (params.search) {
      const fuzzyRegex = buildFuzzyRegex(params.search.trim());
      match.$or = [
        { name: fuzzyRegex },
        { condition: fuzzyRegex },
        { phone: fuzzyRegex },
      ];
    }

    if (params.condition) {
      const fuzzyConditionRegex = buildFuzzyRegex(params.condition.trim());
      match.condition = fuzzyConditionRegex;
    }

    if (params.doctorId) {
      match.doctorId = new Types.ObjectId(params.doctorId);
    }

    if (params.from || params.to) {
      match.visitDate = {};
      if (params.from) (match.visitDate as Record<string, Date>).$gte = new Date(params.from);
      if (params.to) (match.visitDate as Record<string, Date>).$lte = new Date(params.to);
    }

    const sortStage: Record<string, 1 | -1> = {};
    if (params.sort) {
      const field = params.sort.startsWith('-') ? params.sort.substring(1) : params.sort;
      const order = params.sort.startsWith('-') ? -1 : 1;
      sortStage[field] = order;
    } else {
      sortStage.visitDate = -1;
    }

    const pipeline: any[] = [
      { $match: match },
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      {
        $unwind: {
          path: '$doctor',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          doctorName: '$doctor.name',
        },
      },
      { $sort: sortStage },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const result = await Patient.aggregate(pipeline);
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

  async findById(id: string): Promise<PatientDocument | null> {
    return Patient.findById(id).populate('doctorId', 'name specialization hospital');
  }

  async create(data: Partial<PatientDocument>): Promise<PatientDocument> {
    return Patient.create(data);
  }

  async update(id: string, data: Partial<PatientDocument>): Promise<PatientDocument | null> {
    return Patient.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id: string): Promise<PatientDocument | null> {
    return Patient.findByIdAndDelete(id);
  }
}
