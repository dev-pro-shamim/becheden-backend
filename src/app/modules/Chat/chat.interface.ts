import { Document, Types } from 'mongoose';

export interface IConversation extends Document {
  _id: Types.ObjectId;
  ad?: Types.ObjectId;
  participants: Types.ObjectId[];
  lastMessageText?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage extends Document {
  _id: Types.ObjectId;
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  text?: string;
  attachment?: {
    type: 'image' | 'file';
    url: string;
    name?: string;
    size?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatBlock extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  blockedUser: Types.ObjectId;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}
