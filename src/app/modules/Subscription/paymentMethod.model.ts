import { Schema, model } from 'mongoose';
import { IPaymentMethod } from './paymentMethod.interface';

const paymentMethodSchema = new Schema<IPaymentMethod>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required!'],
    },
    provider: {
      type: String,
      required: [true, 'Provider is required!'],
      default: 'SSL',
    },
    token: {
      type: String,
      default: null,
    },
    last4: {
      type: String,
      default: null,
    },
    brand: {
      type: String,
      default: null,
    },
    isDefault: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

paymentMethodSchema.index({ user: 1, isDefault: 1 });

export const PaymentMethodModel = model<IPaymentMethod>(
  'PaymentMethod',
  paymentMethodSchema
);
