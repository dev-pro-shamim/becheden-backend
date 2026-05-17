import { Schema, model } from 'mongoose';
import { IFavourite } from './favourite.interface';

const favouriteSchema = new Schema<IFavourite>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required!'],
    },
    ad: {
      type: Schema.Types.ObjectId,
      ref: 'Ad',
      required: [true, 'Ad reference is required!'],
    },
  },
  { timestamps: true, versionKey: false }
);

favouriteSchema.index({ user: 1, ad: 1 }, { unique: true });

export const FavouriteModel = model<IFavourite>('Favourite', favouriteSchema);
