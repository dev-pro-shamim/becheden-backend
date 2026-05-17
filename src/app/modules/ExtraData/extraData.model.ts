import { Schema, model } from 'mongoose';
import { IExtraData } from './extraData.interface';

const extraDataSchema = new Schema<IExtraData>(
  {
    adImage1: {
      type: String,
      default: null,
    },
    adImage2: {
      type: String,
      default: null,
    },
    adImage3: {
      type: String,
      default: null,
    },
    adImage4: {
      type: String,
      default: null,
    },
    adImage5: {
      type: String,
      default: null,
    },
    adImage6: {
      type: String,
      default: null,
    },
    adImage7: {
      type: String,
      default: null,
    },

    link1: {
      type: String,
      default: null,
    },
    link2: {
      type: String,
      default: null,
    },

    heading: {
      type: [String],
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

export const ExtraDataModel = model<IExtraData>('ExtraData', extraDataSchema);
