import { Types } from 'mongoose';
// import { TPageTypes } from './page.constant';
import { Document } from 'mongoose';

export interface IPage extends Document {
  _id: Types.ObjectId;

  // type: TPageTypes;
  type: string;
  title: string;
  content: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface IPagePayload {
  // type: TPageTypes;
  type: string;
  title: string;
  content: string;
}
