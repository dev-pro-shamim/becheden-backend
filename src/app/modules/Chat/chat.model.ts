import { Schema, model } from 'mongoose';
import { IChatBlock, IConversation, IMessage } from './chat.interface';

const conversationSchema = new Schema<IConversation>(
  {
    ad: {
      type: Schema.Types.ObjectId,
      ref: 'Ad',
      default: null,
    },
    participants: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: [true, 'Participants are required!'],
      validate: {
        validator: (arr: unknown[]) => Array.isArray(arr) && arr.length >= 2,
        message: 'At least two participants are required!',
      },
    },
    lastMessageText: {
      type: String,
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

conversationSchema.index({ ad: 1, participants: 1 });

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Conversation reference is required!'],
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender reference is required!'],
    },
    text: {
      type: String,
      default: null,
    },
    attachment: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

messageSchema.index({ conversation: 1, createdAt: -1 });

const chatBlockSchema = new Schema<IChatBlock>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required!'],
    },
    blockedUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Blocked user reference is required!'],
    },
    reason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

chatBlockSchema.index({ user: 1, blockedUser: 1 }, { unique: true });

export const ConversationModel = model<IConversation>(
  'Conversation',
  conversationSchema
);
export const MessageModel = model<IMessage>('Message', messageSchema);
export const ChatBlockModel = model<IChatBlock>('ChatBlock', chatBlockSchema);
