import { Document, Types } from 'mongoose';
import { TVendorStatus } from './vendor.constant';

export interface IVendor extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;

  storeName: string;
  storeImage: string;
  storeLocation: string;

  tradeLicense: string;
  tradeLicenseNumber: string;

  status: TVendorStatus;
  approvalNote?: string | null;
  approvedAt?: Date | null;
  approvedBy?: Types.ObjectId | null;

  blocked: boolean;
  blockedAt?: Date | null;
  blockedBy?: Types.ObjectId | null;
  blockReason?: string | null;

  currentPlanId?: Types.ObjectId | null;
  planExpiresAt?: Date | null;
  listingsUsed: number;
  cycleStartedAt?: Date | null;
  cycleListingsUsed: number;

  createdAt: Date;
  updatedAt: Date;
}
