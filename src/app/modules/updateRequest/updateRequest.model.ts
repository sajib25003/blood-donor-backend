import { model, Schema } from 'mongoose';
import { IUpdateRequest, UPDATE_REQUEST_STATUSES } from './updateRequest.interface';

const updateRequestSchema = new Schema<IUpdateRequest>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    mobileNo: { type: String, required: true, match: /^01[3-9]\d{8}$/ },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    referenceNo: { type: String, required: true, unique: true },
    status: { type: String, enum: UPDATE_REQUEST_STATUSES, default: 'pending' },
  },
  { timestamps: true, versionKey: false },
);

updateRequestSchema.index({ status: 1, createdAt: -1 });

export const UpdateRequestModel = model<IUpdateRequest>('UpdateRequest', updateRequestSchema);
