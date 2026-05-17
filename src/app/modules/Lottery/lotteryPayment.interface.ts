import { Document, Types } from 'mongoose';

export interface ILotteryPayment extends Document {
  _id: Types.ObjectId;

  user: Types.ObjectId;
  lottery: Types.ObjectId;
  quantity: number;
  amount: number;

  status: 'Pending' | 'Paid' | 'Failed';
  transactionId: string;
  applied: boolean;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gatewayResponse?: Record<string, any> | null;

  createdAt: Date;
  updatedAt: Date;
}
