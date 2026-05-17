import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { AppError } from '../../utils';
import CategoryModel, { ICategory } from './category.model';
import { deleteImageFromCloudinary, sendImageToCloudinary } from '../../lib';
import { AdModel } from '../Ad/ad.model';

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

// 1) Public: get all categories
const getAllCategoriesFromDB = async (): Promise<ICategory[]> => {
  const data = await CategoryModel.find().sort({ order: 1, createdAt: -1 });
  return data;
};

// 2) Public: get category tree
const getCategoryTreeFromDB = async (): Promise<ICategory[]> => {
  const data = await CategoryModel.find({ isActive: true }).sort({
    order: 1,
    createdAt: -1,
  });

  // return data.map((c) => {
  //   const obj = c.toObject();

  //   type TSubCategoryPlain = {
  //     isActive: boolean;
  //     order?: number;
  //   };

  //   const rawSubcategories = (obj.subcategories ??
  //     []) as unknown as TSubCategoryPlain[];

  //   const subcategories = rawSubcategories
  //     .filter((s) => s.isActive)
  //     .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  //   return {
  //     ...obj,
  //     subcategories,
  //   };
  // });

  return data;
};

// 3) Admin: create category
const createCategoryInDB = async (
  payload: {
    name: string;
    slug?: string;
    icon?: string;
    order?: number;
    isActive?: boolean;
  },
  imageFile: Express.Multer.File | undefined,
): Promise<ICategory> => {
  if (!imageFile) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Icon image is required!');
  }

  const slug = payload.slug ? toSlug(payload.slug) : toSlug(payload.name);  

  // Ensure category slug uniqueness
  const exists = await CategoryModel.exists({ slug });
  if (exists) {
    throw new AppError(httpStatus.CONFLICT, 'Category slug must be unique!');
  }

  const uploaded = await sendImageToCloudinary(imageFile);
  payload.icon = uploaded.secure_url;

  const created = await CategoryModel.create({
    name: payload.name,
    slug,
    icon: payload.icon,
    order: payload.order ?? 0,
    isActive: payload.isActive ?? true,
  });

  if (!created) {
    await deleteImageFromCloudinary(uploaded.secure_url);
  }
 
  return created;
};

// 4) Admin: update category
const updateCategoryInDB = async (
  id: string,
  payload: Partial<{
    name: string;
    slug: string;
    icon?: string;
    order?: number;
    isActive?: boolean;
  }>,
  imageFile: Express.Multer.File | undefined,
): Promise<ICategory> => {
  // Determine target slug if it will change
  const targetSlug = payload.slug
    ? toSlug(payload.slug)
    : payload.name
      ? toSlug(payload.name)
      : undefined;

  if (targetSlug) {
    const exists = await CategoryModel.exists({
      slug: targetSlug,
      _id: { $ne: new Types.ObjectId(id) },
    });
    if (exists) {
      throw new AppError(httpStatus.CONFLICT, 'Category slug must be unique!');
    }
  }

  const existingCategory = await CategoryModel.findById(id);

  if (!existingCategory) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found!');
  }

  if (imageFile) {
    const uploaded = await sendImageToCloudinary(imageFile);
    payload.icon = uploaded.secure_url;
  }

  const updatedCategory = await CategoryModel.findByIdAndUpdate(
    id,
    {
      ...payload,
      ...(payload?.slug ? { slug: toSlug(payload.slug) } : {}),
      ...(payload?.name && !payload?.slug
        ? { slug: toSlug(payload.name) }
        : {}),
    },
    { new: true, runValidators: true },
  );

  if (!updatedCategory) {
    if (imageFile && payload.icon) {
      await deleteImageFromCloudinary(payload.icon);
    }
    throw new AppError(httpStatus.NOT_FOUND, 'Category not updated!');
  }

  if (
    updatedCategory.icon &&
    existingCategory.icon &&
    updatedCategory.icon !== existingCategory.icon
  ) {
    await deleteImageFromCloudinary(existingCategory.icon);
  }

  return updatedCategory;
};

// 5) Admin: delete category
const deleteCategoryFromDB = async (id: string): Promise<ICategory> => {
  const category = await CategoryModel.findById(id);

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found!');
  }

  // Prevent deletion if any Ad exists under this category
  const adCount = await AdModel.countDocuments({
    categoryId: new Types.ObjectId(id),
  });

  if (adCount > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot delete category: ads exist under this category.',
    );
  }

  const iconUrls: string[] = [];
  if (category.icon) iconUrls.push(category.icon);
  // for (const sub of category.subcategories ?? []) {
  //   if (sub.icon) iconUrls.push(sub.icon);
  // }

  const deleted = await CategoryModel.findByIdAndDelete(id);

  // Best-effort cleanup of Cloudinary images
  await Promise.all(
    iconUrls.map(async (url) => {
      try {
        await deleteImageFromCloudinary(url);
      } catch {
        // swallow errors to not block deletion flow
      }
    }),
  );

  return deleted as ICategory;
};

// // 6) Subcategory: list
// const getSubCategoriesByCategoryIdFromDB = async (
//   categoryId: string
// ): Promise<ISubCategory[]> => {
//   const category = await CategoryModel.findById(categoryId);

//   if (!category) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Category not found!');
//   }

//   return category.subcategories;
// };

// // 7) Subcategory: create
// const createSubCategoryInDB = async (
//   categoryId: string,
//   payload: {
//     name: string;
//     slug?: string;
//     icon?: string;
//     order?: number;
//     isActive?: boolean;
//   }
// ): Promise<ICategory> => {
//   const category = await CategoryModel.findById(categoryId);
//   if (!category) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Category not found!');
//   }

//   const slug = payload.slug ? toSlug(payload.slug) : toSlug(payload.name);

//   // Ensure subcategory slug uniqueness within this category
//   const duplicate = category.subcategories.some((s) => s.slug === slug);
//   if (duplicate) {
//     throw new AppError(
//       httpStatus.CONFLICT,
//       'Subcategory slug must be unique within the category!'
//     );
//   }

//   category.subcategories.push({
//     name: payload.name,
//     slug,
//     icon: payload.icon,
//     order: payload.order ?? 0,
//     isActive: payload.isActive ?? true,
//   });

//   await category.save();

//   return category;
// };

// // 8) Subcategory: update
// const updateSubCategoryInDB = async (
//   subCategoryId: string,
//   payload: Partial<{
//     name: string;
//     slug: string;
//     icon?: string;
//     order?: number;
//     isActive?: boolean;
//   }>
// ): Promise<ICategory> => {
//   const category = await CategoryModel.findOne({
//     'subcategories._id': new Types.ObjectId(subCategoryId),
//   });

//   if (!category) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Subcategory not found!');
//   }

//   const subCategory = category.subcategories.id(subCategoryId);
//   if (!subCategory) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Subcategory not found!');
//   }

//   const oldIcon = subCategory.icon;

//   // Determine target slug if it will change
//   const targetSlug = payload.slug
//     ? toSlug(payload.slug)
//     : payload.name
//     ? toSlug(payload.name)
//     : undefined;

//   if (targetSlug) {
//     const duplicate = category.subcategories.some(
//       (s) => s.slug === targetSlug && String(s._id) !== String(subCategoryId)
//     );
//     if (duplicate) {
//       throw new AppError(
//         httpStatus.CONFLICT,
//         'Subcategory slug must be unique within the category!'
//       );
//     }
//   }

//   if (payload.name) {
//     subCategory.name = payload.name;
//     if (!payload.slug) {
//       subCategory.slug = toSlug(payload.name);
//     }
//   }

//   if (payload.slug) subCategory.slug = toSlug(payload.slug);
//   if (typeof payload.icon !== 'undefined') subCategory.icon = payload.icon;
//   if (typeof payload.order !== 'undefined') subCategory.order = payload.order;
//   if (typeof payload.isActive !== 'undefined')
//     subCategory.isActive = payload.isActive;

//   await category.save();

//   if (payload.icon && oldIcon && payload.icon !== oldIcon) {
//     await deleteImageFromCloudinary(oldIcon);
//   }

//   return category;
// };

// // 9) Subcategory: delete
// const deleteSubCategoryFromDB = async (
//   subCategoryId: string
// ): Promise<ICategory> => {
//   const category = await CategoryModel.findOne({
//     'subcategories._id': new Types.ObjectId(subCategoryId),
//   });

//   if (!category) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Subcategory not found!');
//   }

//   const sub = category.subcategories.id(subCategoryId);
//   // capture icon before deletion
//   const subIcon = sub?.icon;

//   if (!sub) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Subcategory not found!');
//   }

//   // Prevent deletion if any Ad exists under this subcategory
//   const adCount = await AdModel.countDocuments({
//     subCategoryId: new Types.ObjectId(subCategoryId),
//   });

//   if (adCount > 0) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'Cannot delete subcategory: ads exist under this subcategory.'
//     );
//   }

//   sub.deleteOne();
//   await category.save();

//   if (subIcon) {
//     try {
//       await deleteImageFromCloudinary(subIcon);
//     } catch {
//       // ignore cleanup errors
//     }
//   }

//   return category;
// };

export const CategoryService = {
  getAllCategoriesFromDB,
  getCategoryTreeFromDB,
  createCategoryInDB,
  updateCategoryInDB,
  deleteCategoryFromDB,
  // getSubCategoriesByCategoryIdFromDB,
  // createSubCategoryInDB,
  // updateSubCategoryInDB,
  // deleteSubCategoryFromDB,
};
