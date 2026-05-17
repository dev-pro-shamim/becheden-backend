import { Schema, model } from 'mongoose';
import { IPayment } from './payment.interface';

// paymentSchema
const paymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required!'],
    },
    subscriptionPlan: {
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
      default: null,
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
      default: 'Pending', // default: 'Pending'
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
      default: null, // default: null
    },
  },
  { timestamps: true, versionKey: false },
);

// Subscription-specific payment model (uses same schema)
export const SubscriptionPaymentModel = model<IPayment>(
  'SubscriptionPayment',
  paymentSchema,
);
