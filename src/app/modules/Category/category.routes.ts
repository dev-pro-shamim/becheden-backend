import { Router } from 'express';
import { auth, validateRequestFromFormData } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { CategoryController } from './category.controller';
import { CategoryValidation } from './category.validation';
import { multerUpload } from '../../lib';

const router = Router();

// Public
router.get('/', CategoryController.getAllCategories);
router.get('/tree', CategoryController.getCategoryTree);

// Admin: category CRUD
router.post(
  '/',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  multerUpload.single('icon'),
  validateRequestFromFormData(CategoryValidation.createCategorySchema),
  CategoryController.createCategory
);

router.put(
  '/:id',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  multerUpload.single('icon'),
  validateRequestFromFormData(CategoryValidation.updateCategorySchema),
  CategoryController.updateCategory
);

router.delete(
  '/:id',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  CategoryController.deleteCategory
);

// // Subcategory
// router.get(
//   '/:categoryId/subcategory',
//   CategoryController.getSubCategoriesByCategoryId
// );

// router.post(
//   '/:categoryId/subcategory',
//   auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
//   multerUpload.single('icon'),
//   validateRequestFromFormData(CategoryValidation.createSubCategorySchema),
//   CategoryController.createSubCategory
// );

// router.patch(
//   '/subcategory/:id',
//   auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
//   multerUpload.single('icon'),
//   validateRequestFromFormData(CategoryValidation.updateSubCategorySchema),
//   CategoryController.updateSubCategory
// );

// router.delete(
//   '/subcategory/:id',
//   auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
//   CategoryController.deleteSubCategory
// );

export const CategoryRoutes = router;
