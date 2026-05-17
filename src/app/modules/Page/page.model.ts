import { model, Schema } from 'mongoose';
import { IPage } from './page.interface';
// import { PageTypes } from './page.constant';

const pageSchema = new Schema<IPage>(
  {
    type: {
      type: String,
      // enum: Object.values(PageTypes),
      required: [true, 'Type is required!'],
    },
    title: {
      type: String,
      required: [true, 'Title is required!'],
    },
    content: {
      type: String,
      required: [true, 'Content is required!'],
    },
  },
  { timestamps: true, versionKey: false }
);

export const Page = model<IPage>('Page', pageSchema);
