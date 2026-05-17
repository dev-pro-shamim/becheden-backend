import { Schema, model } from 'mongoose';
import {
  IInvoice,
  ISubscriptionPlan,
  IUserSubscription,
} from './subscription.interface';

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: {
      type: String,
      required: [true, 'Name is required!'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required!'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'BDT',
    },
    durationUnit: {
      type: String,
      enum: ['DAY', 'MONTH', 'YEAR'],
      default: 'MONTH',
    },
    durationValue: {
      type: Number,
      default: 1,
      min: 1,
    },
    adsLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    features: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const userSubscriptionSchema = new Schema<IUserSubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required!'],
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
      required: [true, 'Plan reference is required!'],
    },
    status: {
      type: String,
      default: 'ACTIVE',
    },
    renewsAt: {
      type: Date,
      default: null,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    credits: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

const invoiceSchema = new Schema<IInvoice>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required!'],
    },
    invoiceNo: {
      type: String,
      required: [true, 'Invoice no is required!'],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    planName: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required!'],
      min: 0,
    },
    status: {
      type: String,
      default: 'PAID',
    },
    downloadUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

export const SubscriptionPlanModel = model<ISubscriptionPlan>(
  'SubscriptionPlan',
  subscriptionPlanSchema
);

export const UserSubscriptionModel = model<IUserSubscription>(
  'UserSubscription',
  userSubscriptionSchema
);

export const InvoiceModel = model<IInvoice>('Invoice', invoiceSchema);
