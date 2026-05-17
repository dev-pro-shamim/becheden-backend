import { Document, Types } from 'mongoose';

export type TAdCondition = 'used' | 'new';
export type TAdStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'EXPIRED'
  | 'ARCHIVED';

export interface IAd extends Document {
  _id: Types.ObjectId;

  user: Types.ObjectId;
  categoryId: Types.ObjectId;
  // subCategoryId?: Types.ObjectId;

  condition: TAdCondition;
  title: string;
  description: string;
  price: number;
  negotiable: boolean;

  location: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;

  images: string[];
  status: TAdStatus;
  rejectReason?: string;
  rejectNote?: string;
  isFeatured: boolean;
  isUrgent: boolean;
  views: number;

  createdAt: Date;
  updatedAt: Date;
}
