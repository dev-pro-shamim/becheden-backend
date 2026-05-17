import { model, Schema } from 'mongoose';
import { IVendor } from './vendor.interface';
import { VENDOR_STATUS } from './vendor.constant';

const vendorSchema = new Schema<IVendor>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    storeName: {
      type: String,
      required: [true, 'Store name is required!'],
      trim: true,
    },
    storeImage: {
      type: String,
    },
    storeLocation: {
      type: String,
      required: [true, 'Store location is required!'],
      trim: true,
    },
    tradeLicense: {
      type: String,
    },
    tradeLicenseNumber: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(VENDOR_STATUS),
      default: VENDOR_STATUS.PENDING,
    },
    approvalNote: {
      type: String,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    blockedAt: {
      type: Date,
      default: null,
    },
    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    blockReason: {
      type: String,
      default: null,
    },
    currentPlanId: {
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
      default: null,
    },
    planExpiresAt: {
      type: Date,
      default: null,
    },
    listingsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    cycleStartedAt: {
      type: Date,
      default: null,
    },
    cycleListingsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

const VendorModel = model<IVendor>('Vendor', vendorSchema);

export default VendorModel;
