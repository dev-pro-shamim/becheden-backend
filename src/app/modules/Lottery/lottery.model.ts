import { Schema, model } from 'mongoose';
import {
  ILottery,
  ILotteryEntry,
  // IRewardRedemption,
} from './lottery.interface';

const lotterySchema = new Schema<ILottery>(
  {
    title: {
      type: String,
      required: [true, 'Title is required!'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required!'],
      trim: true,
    },
    drawDate: {
      type: Date,
      required: [true, 'Draw date is required!'],
    },
    ticketPrice: {
      type: Number,
      required: [true, 'Ticket price is required!'],
      min: 0,
    },
    totalTickets: {
      type: Number,
      default: 0,
      min: 0,
    },
    participantsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    prize: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'INACTIVE'],
      default: 'INACTIVE',
    },
    winnerToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

const lotteryEntrySchema = new Schema<ILotteryEntry>(
  {
    lottery: {
      type: Schema.Types.ObjectId,
      ref: 'Lottery',
      required: [true, 'Lottery reference is required!'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required!'],
    },
    tokenNumbers: {
      type: [String],
      required: [true, 'Token numbers are required!'],
      default: [],
    },
  },
  { timestamps: true, versionKey: false },
);

// Index to ensure one entry per user per lottery
lotteryEntrySchema.index({ lottery: 1, user: 1 }, { unique: true });

// const rewardRedemptionSchema = new Schema<IRewardRedemption>(
//   {
//     user: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: [true, 'User reference is required!'],
//     },
//     rewardId: {
//       type: String,
//       required: [true, 'Reward ID is required!'],
//     },
//     quantity: {
//       type: Number,
//       default: 1,
//       min: 1,
//     },
//   },
//   { timestamps: true, versionKey: false }
// );

export const LotteryModel = model<ILottery>('Lottery', lotterySchema);

export const LotteryEntryModel = model<ILotteryEntry>(
  'LotteryEntry',
  lotteryEntrySchema,
);

// export const RewardRedemptionModel = model<IRewardRedemption>(
//   'RewardRedemption',
//   rewardRedemptionSchema
// );
