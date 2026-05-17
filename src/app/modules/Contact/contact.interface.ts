import { Types } from 'mongoose';

export interface IContact {
  _id: Types.ObjectId;

  name: string;
  email: string;
  phone: string;

  subject: string;
  message: string;

  isReplied: boolean;

  createdAt: Date;
  updatedAt: Date;
}
