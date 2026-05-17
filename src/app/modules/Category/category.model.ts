import { Document, Schema,  model } from 'mongoose';

// export interface ISubCategory {
//   _id: Types.ObjectId;
//   name: string;
//   slug: string;
//   icon?: string;
//   isActive: boolean;
//   order: number;
// }

export interface ICategory extends Document {
  name: string;
  slug: string;
  icon?: string;
  isActive: boolean;
  order: number;
  // subcategories: Types.DocumentArray<ISubCategory>;
}

// const subCategorySchema = new Schema<ISubCategory>(
//   {
//     name: {
//       type: String,
//       required: [true, 'Subcategory name is required!'],
//       trim: true,
//     },
//     slug: {
//       type: String,
//       required: [true, 'Subcategory slug is required!'],
//       trim: true,
//       lowercase: true,
//     },
//     icon: {
//       type: String,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     order: {
//       type: Number,
//       default: 0,
//     },
//   },
//   { _id: true, timestamps: true, versionKey: false }
// );

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required!'],
      trim: true,
      unique: [true, 'Category name must be unique!'],
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required!'],
      trim: true,
      lowercase: true,
      unique: [true, 'Category slug must be unique!'],
    },
    icon: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    // subcategories: {
    //   type: [subCategorySchema],
    //   default: [],
    // },
  },
  { timestamps: true, versionKey: false }
);

const CategoryModel = model<ICategory>('Category', categorySchema);

export default CategoryModel;
