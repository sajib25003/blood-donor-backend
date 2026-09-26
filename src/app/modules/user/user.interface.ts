export const USER_ROLES = ['admin'] as const;
export type TUserRole = (typeof USER_ROLES)[number];

export interface IUser {
  userName: string;
  password: string; // bcrypt hash in database
  role: TUserRole;
}
