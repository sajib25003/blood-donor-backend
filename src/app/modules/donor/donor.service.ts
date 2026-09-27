import { FilterQuery, Types } from 'mongoose';
import {
  BLOOD_GROUPS,
  IDonor,
  SEX_OPTIONS,
  TDonorQuery,
} from './donor.interface';
import { DonorModel } from './donor.model';

export class DonorInputError extends Error {}

const fields = [
  'name',
  'dob',
  'mobileNo',
  'sex',
  'bloodGroup',
  'currentLocation',
] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeDonorInput = (input: unknown, partial = false) => {
  if (!isRecord(input))
    throw new DonorInputError('Donor data must be an object.');
  const keys = Object.keys(input);
  if (
    !keys.length ||
    keys.some((key) => !fields.includes(key as (typeof fields)[number]))
  ) {
    throw new DonorInputError('Unknown or missing donor fields.');
  }

  const result: Record<string, string | Date> = {};
  for (const field of fields) {
    const value = input[field];
    if (value === undefined && partial) continue;
    if (typeof value !== 'string' || !value.trim()) {
      throw new DonorInputError(`${field} is required and must be a string.`);
    }
    const trimmed = value.trim();
    if (field === 'dob') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        throw new DonorInputError('dob must be in YYYY-MM-DD format.');
      }
      const dob = new Date(`${trimmed}T00:00:00.000Z`);
      if (
        Number.isNaN(dob.getTime()) ||
        dob.toISOString().slice(0, 10) !== trimmed ||
        dob >= new Date()
      ) {
        throw new DonorInputError('dob must be a valid past date.');
      }
      result.dob = dob;
    } else if (field === 'mobileNo') {
      const mobile = trimmed.replace(/^\+?88/, '');
      if (!/^01[3-9]\d{8}$/.test(mobile)) {
        throw new DonorInputError(
          'mobileNo must be a valid Bangladeshi mobile number.',
        );
      }
      result.mobileNo = mobile;
    } else if (field === 'bloodGroup') {
      if (!BLOOD_GROUPS.includes(trimmed as (typeof BLOOD_GROUPS)[number])) {
        throw new DonorInputError('Invalid bloodGroup.');
      }
      result.bloodGroup = trimmed;
    } else if (field === 'sex') {
      if (
        !SEX_OPTIONS.includes(
          trimmed.toLowerCase() as (typeof SEX_OPTIONS)[number],
        )
      ) {
        throw new DonorInputError('Invalid sex.');
      }
      result.sex = trimmed.toLowerCase();
    } else {
      const maxLength = field === 'name' ? 100 : 120;
      if (trimmed.length > maxLength)
        throw new DonorInputError(`${field} is too long.`);
      result[field] = trimmed;
    }
  }
  return result;
};

const ageFromDob = (dob: Date) => {
  const today = new Date();
  let age = today.getUTCFullYear() - dob.getUTCFullYear();
  const month = today.getUTCMonth() - dob.getUTCMonth();
  if (month < 0 || (month === 0 && today.getUTCDate() < dob.getUTCDate()))
    age--;
  return age;
};

const parsePositiveInteger = (
  value: string | undefined,
  fallback: number,
  max: number,
) => {
  if (value === undefined) return fallback;
  if (!/^[1-9]\d*$/.test(value))
    throw new DonorInputError('Invalid pagination value.');
  return Math.min(Number(value), max);
};

const createDonor = async (input: unknown) =>
  DonorModel.create(normalizeDonorInput(input) as unknown as IDonor);

const getAllDonors = async (query: TDonorQuery) => {
  const page = parsePositiveInteger(query.page, 1, 100000);
  const limit = parsePositiveInteger(query.limit, 20, 100);
  const filter: FilterQuery<IDonor> = {};

  if (query.bloodGroup) {
    if (
      !BLOOD_GROUPS.includes(query.bloodGroup as (typeof BLOOD_GROUPS)[number])
    ) {
      throw new DonorInputError('Invalid bloodGroup filter.');
    }
    filter.bloodGroup = query.bloodGroup;
  }
  if (query.location) {
    const location = query.location.trim();
    if (location.length > 120)
      throw new DonorInputError('Location filter is too long.');
    filter.currentLocation = {
      $regex: location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    };
  }
  if (query.search) {
    const search = query.search.trim();
    if (search.length > 80) throw new DonorInputError('Search is too long.');
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { mobileNo: { $regex: escaped } },
      ];
    }
  }

  const [donors, total] = await Promise.all([
    DonorModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    DonorModel.countDocuments(filter),
  ]);

  return {
    data: donors.map(({ dob, ...donor }) => ({
      ...donor,
      age: ageFromDob(dob),
    })),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getDonorStats = async () => {
  const grouped = await DonorModel.aggregate<{ _id: string; count: number }>([
    { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
  ]);
  const byBloodGroup = Object.fromEntries(
    BLOOD_GROUPS.map((group) => [group, 0]),
  );
  for (const { _id, count } of grouped) {
    if (BLOOD_GROUPS.includes(_id as (typeof BLOOD_GROUPS)[number])) {
      byBloodGroup[_id] = count;
    }
  }
  return {
    total: grouped.reduce((sum, group) => sum + group.count, 0),
    byBloodGroup,
  };
};

const getDonorById = (id: string) => {
  if (!Types.ObjectId.isValid(id))
    throw new DonorInputError('Invalid donor ID.');
  return DonorModel.findById(id);
};

const updateDonor = (id: string, input: unknown) => {
  if (!Types.ObjectId.isValid(id))
    throw new DonorInputError('Invalid donor ID.');
  const update = normalizeDonorInput(input, true);
  return DonorModel.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });
};

const deleteDonor = (id: string) => {
  if (!Types.ObjectId.isValid(id))
    throw new DonorInputError('Invalid donor ID.');
  return DonorModel.findByIdAndDelete(id);
};

export const DonorServices = {
  createDonor,
  getAllDonors,
  getDonorStats,
  getDonorById,
  updateDonor,
  deleteDonor,
};
