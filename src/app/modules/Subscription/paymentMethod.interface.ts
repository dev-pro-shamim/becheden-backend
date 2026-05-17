import { Document, Types } from 'mongoose';

export interface IPaymentMethod extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  provider: string;
  token?: string | null;
  last4?: string | null;
  brand?: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
