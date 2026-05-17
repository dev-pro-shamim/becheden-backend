import { Router } from 'express';
import {
  auth,
  validateRequestFromFormData,
  validateRequest,
} from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { multerUpload } from '../../lib';
import { ExtraDataController } from './extraData.controller';
import { ExtraDataValidation } from './extraData.validation';

const router = Router();

// Get global extra data (public)
router.get('/', ExtraDataController.getExtraData);

// Upsert global extra data: update a single image slot (image-1/2/3)
router.post(
  '/',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  multerUpload.single('adImage'),
  validateRequestFromFormData(ExtraDataValidation.upsertExtraDataSchema),
  ExtraDataController.upsertExtraData,
);

// Update global extra data: update a single link slot (link1/link2)
router.post(
  '/link',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(ExtraDataValidation.updateExtraDataLinkSchema),
  ExtraDataController.updateExtraDataLink,
);

// Update global extra data: update heading array
router.post(
  '/heading',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(ExtraDataValidation.updateExtraDataHeadingSchema),
  ExtraDataController.updateExtraDataHeading,
);

export const ExtraDataRoutes = router;
