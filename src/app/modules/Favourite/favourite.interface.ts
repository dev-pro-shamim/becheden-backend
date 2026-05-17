import { Document, Types } from 'mongoose';

export interface IFavourite extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  ad: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
