import { Schema, model } from 'mongoose';
import { IAdReport } from './adReport.interface';

const adReportSchema = new Schema<IAdReport>(
  {
    ad: {
      type: Schema.Types.ObjectId,
      ref: 'Ad',
      required: [true, 'Ad reference is required!'],
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reason: {
      type: String,
      required: [true, 'Reason is required!'],
      trim: true,
    },
    details: {
      type: String,
      default: null,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

adReportSchema.index({ ad: 1, reporter: 1, createdAt: -1 });

export const AdReportModel = model<IAdReport>('AdReport', adReportSchema);
