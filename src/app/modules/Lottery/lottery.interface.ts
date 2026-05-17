import { Document, Types } from 'mongoose';

export type TLotteryStatus = 'ACTIVE' | 'COMPLETED' | 'INACTIVE';

export interface ILottery extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  drawDate: Date;
  ticketPrice: number;
  totalTickets: number;
  participantsCount: number;
  prize?: string;
  image?: string;
  status: TLotteryStatus;
  winnerToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILotteryEntry extends Document {
  _id: Types.ObjectId;
  lottery: Types.ObjectId;
  user: Types.ObjectId;
  tokenNumbers: string[];
  createdAt: Date;
  updatedAt: Date;
}

// export interface IRewardRedemption extends Document {
//   _id: Types.ObjectId;
//   user: Types.ObjectId;
//   rewardId: string;
//   quantity: number;
//   createdAt: Date;
//   updatedAt: Date;
// }
