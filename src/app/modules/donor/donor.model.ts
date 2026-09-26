import { model, Schema } from 'mongoose';
import { BLOOD_GROUPS, IDonor, SEX_OPTIONS } from './donor.interface';

const donorSchema = new Schema<IDonor>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    dob: { type: Date, required: true },
    mobileNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^01[3-9]\d{8}$/,
    },
    sex: { type: String, required: true, enum: SEX_OPTIONS },
    bloodGroup: { type: String, required: true, enum: BLOOD_GROUPS },
    currentLocation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
  },
  { timestamps: true, versionKey: false },
);

donorSchema.index({ bloodGroup: 1, currentLocation: 1 });

export const DonorModel = model<IDonor>('Donor', donorSchema);
