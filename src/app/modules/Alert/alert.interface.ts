import { Document, Types } from 'mongoose';

export type TAlertFrequency = 'INSTANT' | 'DAILY' | 'WEEKLY';

export interface IAlert extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  title: string;
  filters: Record<string, unknown>;
  frequency: TAlertFrequency;
  paused: boolean;
  lastNotifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISavedSearch extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  payload: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
