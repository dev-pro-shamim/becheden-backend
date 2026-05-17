import { Schema, model } from 'mongoose';
import { IConversationRead } from './chatRead.interface';

const conversationReadSchema = new Schema<IConversationRead>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Conversation reference is required!'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required!'],
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, versionKey: false }
);

conversationReadSchema.index({ conversation: 1, user: 1 }, { unique: true });

export const ConversationReadModel = model<IConversationRead>(
  'ConversationRead',
  conversationReadSchema
);
