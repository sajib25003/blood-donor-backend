export const UPDATE_REQUEST_STATUSES = ['pending', 'resolved'] as const;

export type TUpdateRequestStatus = (typeof UPDATE_REQUEST_STATUSES)[number];

export interface IUpdateRequest {
  name: string;
  mobileNo: string;
  message: string;
  referenceNo: string;
  status: TUpdateRequestStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TUpdateRequestQuery {
  status?: string;
  page?: string;
  limit?: string;
}
