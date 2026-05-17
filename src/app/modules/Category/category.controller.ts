import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { CategoryService } from './category.service';

// 1) getAllCategories
const getAllCategories = asyncHandler(async (req, res) => {
  const result = await CategoryService.getAllCategoriesFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Categories retrieved successfully!',
    data: result,
  });
});

// 2) getCategoryTree
const getCategoryTree = asyncHandler(async (req, res) => {
  const result = await CategoryService.getCategoryTreeFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Category tree retrieved successfully!',
    data: result,
  });
});

// 3) createCategory
const createCategory = asyncHandler(async (req, res) => {
  const result = await CategoryService.createCategoryInDB(req.body, req.file);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Category created successfully!',
    data: result,
  });
});

// 4) updateCategory
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await CategoryService.updateCategoryInDB(
    id as string,
    req.body,
    req.file,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Category updated successfully!',
    data: result,
  });
});

// 5) deleteCategory
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await CategoryService.deleteCategoryFromDB(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Category deleted successfully!',
    data: result,
  });
});

// // 6) getSubCategoriesByCategoryId
// const getSubCategoriesByCategoryId = asyncHandler(async (req, res) => {
//   const { categoryId } = req.params;
//   const result = await CategoryService.getSubCategoriesByCategoryIdFromDB(
//     categoryId
//   );

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     message: 'Subcategories retrieved successfully!',
//     data: result,
//   });
// });

// // 7) createSubCategory
// const createSubCategory = asyncHandler(async (req, res) => {
//   const { categoryId } = req.params;

//   if (!req.file) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Icon image is required!');
//   }

//   const uploaded = await sendImageToCloudinary(req.file);
//   req.body.icon = uploaded.secure_url;

//   const result = await CategoryService.createSubCategoryInDB(
//     categoryId,
//     req.body
//   );

//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     message: 'Subcategory created successfully!',
//     data: result,
//   });
// });

// // 8) updateSubCategory
// const updateSubCategory = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   if (req.file) {
//     const uploaded = await sendImageToCloudinary(req.file);
//     req.body.icon = uploaded.secure_url;
//   }

//   const result = await CategoryService.updateSubCategoryInDB(id, req.body);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     message: 'Subcategory updated successfully!',
//     data: result,
//   });
// });

// // 9) deleteSubCategory
// const deleteSubCategory = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const result = await CategoryService.deleteSubCategoryFromDB(id);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     message: 'Subcategory deleted successfully!',
//     data: result,
//   });
// });

export const CategoryController = {
  getAllCategories,
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
  // getSubCategoriesByCategoryId,
  // createSubCategory,
  // updateSubCategory,
  // deleteSubCategory,
};
