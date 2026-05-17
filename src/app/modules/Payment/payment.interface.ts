import { Types } from 'mongoose';

// IPayment
export interface IPayment {
  _id: Types.ObjectId;

  user: Types.ObjectId;
  subscriptionPlan?: Types.ObjectId | null;
  amount: number;

  status: 'Pending' | 'Paid' | 'Failed'; // default: 'Pending'
  transactionId: string;
  applied?: boolean;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gatewayResponse?: Record<string, any>; // default: null

  createdAt: Date;
  updatedAt: Date;
}
