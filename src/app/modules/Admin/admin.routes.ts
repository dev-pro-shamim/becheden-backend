import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { AdminValidation } from './admin.validation';
import { AdminController } from './admin.controller';

const router = Router();

// adminGetAllAdmins
router.get(
  '/',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AdminController.getAllAdmins,
);

// adminGetDashboardStats
router.get(
  '/stats',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AdminController.getDashboardStats,
);

// adminCreateAdmin
router.post(
  '/',
  auth(ROLE.SUPER_ADMIN),
  validateRequest(AdminValidation.createAdminValidation),
  AdminController.createAdmin,
);

// adminUpdateAdmin
router.patch(
  '/:id',
  auth(ROLE.SUPER_ADMIN),
  validateRequest(AdminValidation.updateAdminValidation),
  AdminController.updateAdmin,
);

// superAdminDeleteAdmin
router.delete(
  '/:id',
  auth(ROLE.SUPER_ADMIN),
  AdminController.superAdminDeleteAdmin,
);

router.patch(
  '/users/:id/toggle-block',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(AdminValidation.toggleUserBlockValidation),
  AdminController.toggleUserBlock,
);

router.delete(
  '/users/:id',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AdminController.deleteUser,
);

export const AdminRoutes = router;
