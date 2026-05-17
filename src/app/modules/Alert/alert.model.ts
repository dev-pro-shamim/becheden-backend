import { Schema, model } from 'mongoose';
import { IAlert, ISavedSearch } from './alert.interface';

const alertSchema = new Schema<IAlert>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required!'],
    },
    title: {
      type: String,
      required: [true, 'Title is required!'],
      trim: true,
    },
    filters: {
      type: Schema.Types.Mixed,
      required: [true, 'Filters is required!'],
    },
    frequency: {
      type: String,
      enum: ['INSTANT', 'DAILY', 'WEEKLY'],
      required: [true, 'Frequency is required!'],
      default: 'DAILY',
    },
    paused: {
      type: Boolean,
      default: false,
    },
    lastNotifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

const savedSearchSchema = new Schema<ISavedSearch>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required!'],
    },
    payload: {
      type: Schema.Types.Mixed,
      required: [true, 'Payload is required!'],
    },
  },
  { timestamps: true, versionKey: false }
);

export const AlertModel = model<IAlert>('Alert', alertSchema);
export const SavedSearchModel = model<ISavedSearch>(
  'SavedSearch',
  savedSearchSchema
);
