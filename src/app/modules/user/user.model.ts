import { model, Schema } from 'mongoose';
import { IUser, USER_ROLES } from './user.interface';

const userSchema = new Schema<IUser>({
  userName: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: USER_ROLES, required: true, default: 'admin' },
}, { timestamps: true, versionKey: false });

export const UserModel = model<IUser>('User', userSchema);
