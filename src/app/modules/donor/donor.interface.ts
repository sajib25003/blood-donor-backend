export const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
] as const;

export const SEX_OPTIONS = ['male', 'female', 'other'] as const;

export type TBloodGroup = (typeof BLOOD_GROUPS)[number];
export type TSex = (typeof SEX_OPTIONS)[number];

export interface IDonor {
  name: string;
  dob: Date;
  mobileNo: string;
  sex: TSex;
  bloodGroup: TBloodGroup;
  currentLocation: string;
}

export type TCreateDonor = IDonor;
export type TUpdateDonor = Partial<IDonor>;

export interface TDonorQuery {
  bloodGroup?: string;
  location?: string;
  search?: string;
  page?: string;
  limit?: string;
}
