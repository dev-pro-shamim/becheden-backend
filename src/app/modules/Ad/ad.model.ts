import { Schema, model } from 'mongoose';
import { IAd } from './ad.interface';

const adSchema = new Schema<IAd>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required!'],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required!'],
    },
    // subCategoryId: {
    //   type: Schema.Types.ObjectId,
    //   default: null,
    // },
    condition: {
      type: String,
      enum: ['used', 'new'],
      required: [true, 'Condition is required!'],
    },
    title: {
      type: String,
      required: [true, 'Title is required!'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required!'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required!'],
      min: 0,
    },
    negotiable: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      required: [true, 'Location is required!'],
      trim: true,
    },
    contactName: {
      type: String,
      required: [true, 'Contact name is required!'],
      trim: true,
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone is required!'],
      trim: true,
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required!'],
      trim: true,
      lowercase: true,
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'APPROVED',
        'REJECTED',
        'ACTIVE',
        'INACTIVE',
        'EXPIRED',
        'ARCHIVED',
      ],
      default: 'PENDING',
    },
    rejectReason: {
      type: String,
      default: null,
      trim: true,
    },
    rejectNote: {
      type: String,
      default: null,
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

export const AdModel = model<IAd>('Ad', adSchema);
