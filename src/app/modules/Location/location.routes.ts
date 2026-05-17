import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { LocationController } from './location.controller';
import { LocationValidation } from './location.validation';

const router = Router();

// Public
router.get(
  '/',
  validateRequest(LocationValidation.listLocationSchema),
  LocationController.getLocations
);

// Admin
router.get(
  '/admin',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  LocationController.adminGetLocations
);

router.post(
  '/',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(LocationValidation.createLocationSchema),
  LocationController.createLocation
);

router.patch(
  '/:id',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(LocationValidation.updateLocationSchema),
  LocationController.updateLocation
);

router.delete(
  '/:id',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  LocationController.deleteLocation
);

export const LocationRoutes = router;
