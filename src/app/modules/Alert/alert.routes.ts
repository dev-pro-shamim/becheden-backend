import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { AlertController } from './alert.controller';
import { AlertValidation } from './alert.validation';

const router = Router();

router.post(
  '/',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(AlertValidation.createAlertSchema),
  AlertController.createAlert
);

router.get(
  '/my',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AlertController.listMyAlerts
);

router.patch(
  '/:id',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(AlertValidation.updateAlertSchema),
  AlertController.updateAlert
);

router.delete(
  '/:id',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AlertController.deleteAlert
);

router.post(
  '/saved-search',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(AlertValidation.createSavedSearchSchema),
  AlertController.createSavedSearch
);

router.get(
  '/saved-search/my',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AlertController.listMySavedSearches
);

router.delete(
  '/saved-search/:id',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AlertController.deleteSavedSearch
);

export const AlertRoutes = router;
