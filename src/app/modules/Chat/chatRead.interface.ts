import { Document, Types } from 'mongoose';

export interface IConversationRead extends Document {
  _id: Types.ObjectId;
  conversation: Types.ObjectId;
  user: Types.ObjectId;
  lastReadAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
