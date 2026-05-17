import { Document } from 'mongoose';

export interface IExtraData extends Document {
  websiteLogo?: string | null;

  adImage1?: string | null;
  adImage2?: string | null;
  adImage3?: string | null;
  adImage4?: string | null;
  adImage5?: string | null;
  adImage6?: string | null;
  adImage7?: string | null;

  link1?: string | null;
  link2?: string | null;

  heading?: string[] | null;

  createdAt: Date;
  updatedAt: Date;
}
