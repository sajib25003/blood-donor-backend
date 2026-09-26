import { Types } from 'mongoose';
import { UserModel } from '../user/user.model';

const getUserByUserNameFromDB = (userName: string) =>
  UserModel.findOne({ userName: userName.trim().toLowerCase(), role: 'admin' })
    .select('+password').exec();

const getCurrentUserFromDB = (id: string) => {
  if (!Types.ObjectId.isValid(id)) return null;
  return UserModel.findOne({ _id: id, role: 'admin' }).select('userName role').lean().exec();
};

export const AuthServices = { getUserByUserNameFromDB, getCurrentUserFromDB };
