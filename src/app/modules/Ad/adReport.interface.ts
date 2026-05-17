import { Document, Types } from 'mongoose';

export interface IAdReport extends Document {
  _id: Types.ObjectId;
  ad: Types.ObjectId;
  reporter?: Types.ObjectId | null;
  reason: string;
  details?: string | null;
  resolved: boolean;
  resolvedAt?: Date | null;
  resolvedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}
