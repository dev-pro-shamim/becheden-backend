import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { VendorController } from './vendor.controller';
import { VendorValidation } from './vendor.validation';
import { multerUpload } from '../../lib';
import { validateRequestFromFormData } from '../../middlewares';

const router = Router();

// Vendor self-service
// router.post(
//   '/register',
//   auth(ROLE.VENDOR),
//   multerUpload.fields([
//     { name: 'storeImage', maxCount: 1 },
//     { name: 'tradeLicense', maxCount: 1 },
//   ]),
//   validateRequest(VendorValidation.registerVendor),
//   VendorController.registerVendor
// );

router.patch(
  '/me',
  auth(ROLE.VENDOR),
  multerUpload.fields([
    { name: 'storeImage', maxCount: 1 },
    { name: 'tradeLicense', maxCount: 1 },
  ]),
  validateRequestFromFormData(VendorValidation.updateVendor),
  VendorController.updateVendorProfile
);

router.get('/me', auth(ROLE.VENDOR), VendorController.getMyVendorProfile);
router.get('/me/usage', auth(ROLE.VENDOR), VendorController.getMyUsage);

// Admin endpoints
router.get(
  '/admin',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(VendorValidation.adminGetVendors),
  VendorController.adminGetVendors
);

router.patch(
  '/:id/approve',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(VendorValidation.approveVendor),
  VendorController.approveVendor
);

router.patch(
  '/:id/reject',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(VendorValidation.rejectVendor),
  VendorController.rejectVendor
);

router.patch(
  '/:id/block',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(VendorValidation.blockVendor),
  VendorController.blockVendor
);

router.patch(
  '/:id/unblock',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  VendorController.unblockVendor
);

export const VendorRoutes = router;
