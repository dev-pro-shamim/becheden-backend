import { Schema, model } from 'mongoose';
import { IWalletTransaction } from './wallet.interface';

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required!'],
    },
    type: {
      type: String,
      enum: ['TOPUP', 'DEBIT'],
      required: [true, 'Type is required!'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required!'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'COMPLETED',
    },
    reference: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

walletTransactionSchema.index({ user: 1, createdAt: -1 });

export const WalletTransactionModel = model<IWalletTransaction>(
  'WalletTransaction',
  walletTransactionSchema
);
