import { model, Schema } from 'mongoose';

export type TLocation = {
  division: string;
  area: string;
  isActive: boolean;
};

const locationSchema = new Schema<TLocation>(
  {
    division: {
      type: String,
      required: [true, 'Division is required!'],
      trim: true,
    },
    area: {
      type: String,
      required: [true, 'Area is required!'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

locationSchema.index({ division: 1, area: 1 }, { unique: true });

const LocationModel = model<TLocation>('Location', locationSchema);

export default LocationModel;
