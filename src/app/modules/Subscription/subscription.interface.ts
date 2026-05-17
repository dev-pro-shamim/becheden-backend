import { Document, Types } from 'mongoose';

export type TDurationUnit = 'DAY' | 'MONTH' | 'YEAR';

export interface ISubscriptionPlan extends Document {
  _id: Types.ObjectId;
  name: string;
  price: number;
  currency: string;
  durationUnit: TDurationUnit;
  durationValue: number;
  adsLimit: number;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserSubscription extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  plan: Types.ObjectId;
  status: string;
  renewsAt?: Date;
  autoRenew: boolean;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInvoice extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  invoiceNo: string;
  date: Date;
  planName?: string;
  amount: number;
  status: string;
  downloadUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
