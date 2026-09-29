import { randomBytes } from 'node:crypto';
import { Types } from 'mongoose';
import {
  TUpdateRequestQuery,
  UPDATE_REQUEST_STATUSES,
} from './updateRequest.interface';
import { UpdateRequestModel } from './updateRequest.model';

export class UpdateRequestInputError extends Error {}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parsePositiveInteger = (
  value: string | undefined,
  fallback: number,
  max: number,
) => {
  if (value === undefined) return fallback;
  if (!/^[1-9]\d*$/.test(value))
    throw new UpdateRequestInputError('Invalid pagination value.');
  return Math.min(Number(value), max);
};

const createUpdateRequest = async (input: unknown) => {
  if (
    !isRecord(input) ||
    Object.keys(input).some(
      (key) => !['name', 'mobileNo', 'message'].includes(key),
    )
  ) {
    throw new UpdateRequestInputError(
      'Only name, mobileNo and message are allowed.',
    );
  }

  const { name, mobileNo, message } = input;
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 100) {
    throw new UpdateRequestInputError(
      'name is required and must be at most 100 characters.',
    );
  }
  if (typeof mobileNo !== 'string' || !/^01[3-9]\d{8}$/.test(mobileNo)) {
    throw new UpdateRequestInputError(
      'mobileNo must be an 11-digit Bangladeshi mobile number.',
    );
  }
  if (
    typeof message !== 'string' ||
    !message.trim() ||
    message.trim().length > 1000
  ) {
    throw new UpdateRequestInputError(
      'message is required and must be at most 1000 characters.',
    );
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const referenceNo = `BCIC-${randomBytes(8).toString('hex').toUpperCase()}`;
    try {
      const request = await UpdateRequestModel.create({
        name: name.trim(),
        mobileNo,
        message: message.trim(),
        referenceNo,
      });
      return {
        referenceNo: request.referenceNo,
        createdAt: request.createdAt?.toISOString(),
      };
    } catch (error) {
      const duplicateReference =
        isRecord(error) &&
        error.code === 11000 &&
        isRecord(error.keyPattern) &&
        error.keyPattern.referenceNo === 1;
      if (!duplicateReference || attempt === 2) throw error;
    }
  }
  throw new Error('Could not generate a unique reference number.');
};

const getAllUpdateRequests = async (query: TUpdateRequestQuery) => {
  const page = parsePositiveInteger(query.page, 1, 100000);
  const limit = parsePositiveInteger(query.limit, 10, 100);
  const filter: { status?: string } = {};
  if (query.status) {
    if (
      !UPDATE_REQUEST_STATUSES.includes(
        query.status as (typeof UPDATE_REQUEST_STATUSES)[number],
      )
    ) {
      throw new UpdateRequestInputError('Invalid status filter.');
    }
    filter.status = query.status;
  }
  const [data, total] = await Promise.all([
    UpdateRequestModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    UpdateRequestModel.countDocuments(filter),
  ]);
  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const updateRequestStatus = (id: string, input: unknown) => {
  if (!Types.ObjectId.isValid(id))
    throw new UpdateRequestInputError('Invalid request ID.');
  if (
    !isRecord(input) ||
    Object.keys(input).length !== 1 ||
    !UPDATE_REQUEST_STATUSES.includes(
      input.status as (typeof UPDATE_REQUEST_STATUSES)[number],
    )
  ) {
    throw new UpdateRequestInputError('status must be pending or resolved.');
  }
  return UpdateRequestModel.findByIdAndUpdate(
    id,
    { status: input.status },
    { new: true, runValidators: true },
  );
};

export const UpdateRequestServices = {
  createUpdateRequest,
  getAllUpdateRequests,
  updateRequestStatus,
};
