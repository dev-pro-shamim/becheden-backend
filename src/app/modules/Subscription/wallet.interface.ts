import { Document, Types } from 'mongoose';

export type TWalletTxnType = 'TOPUP' | 'DEBIT';
export type TWalletTxnStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface IWalletTransaction extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: TWalletTxnType;
  amount: number;
  status: TWalletTxnStatus;
  reference?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
