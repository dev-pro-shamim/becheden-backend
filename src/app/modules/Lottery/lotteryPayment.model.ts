import { Schema, model } from 'mongoose';
import { ILotteryPayment } from './lotteryPayment.interface';

const lotteryPaymentSchema = new Schema<ILotteryPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required!'],
    },
    lottery: {
      type: Schema.Types.ObjectId,
      ref: 'Lottery',
      required: [true, 'Lottery reference is required!'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required!'],
      min: [1, 'Quantity must be at least 1!'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required!'],
      min: [0, 'Amount must be greater than 0!'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      required: [true, 'Status is required!'],
      default: 'Pending',
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required!'],
      unique: true,
      index: true,
    },
    applied: {
      type: Boolean,
      default: false,
    },
    gatewayResponse: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

export const LotteryPaymentModel = model<ILotteryPayment>(
  'LotteryPayment',
  lotteryPaymentSchema,
);
