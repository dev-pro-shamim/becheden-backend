import { Router } from 'express';
import {
  auth,
  rateLimit,
  validateRequest,
  validateRequestFromFormData,
} from '../../middlewares';
import { multerUpload } from '../../lib';
import { ROLE } from '../User/user.constant';
import { AdController } from './ad.controller';
import { AdValidation } from './ad.validation';

const router = Router();

// Public
router.get('/', AdController.getAllAds);
router.get('/latest', AdController.getLatestAds);
router.get('/top', AdController.getTopAds);
router.get('/featured', AdController.getFeaturedAds);

// Admin (declare before /:id)
router.get(
  '/admin',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AdController.adminGetAllAds
);

router.get(
  '/admin/summary',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AdController.adminGetSummary
);

// Admin: report moderation
router.get(
  '/admin/reports',
  rateLimit({ windowMs: 60 * 1000, max: 60 }),
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AdController.adminListReports
);

router.patch(
  '/admin/reports/:id/resolve',
  rateLimit({ windowMs: 60 * 1000, max: 60 }),
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AdController.adminResolveReport
);

// Authenticated user routes (declare before /:id)
router.get(
  '/my',
  auth(ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AdController.getMyAds
);

// Create an Ad (multipart/form-data)
router.post(
  '/',
  auth(ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  multerUpload.array('images', 5),
  validateRequestFromFormData(AdValidation.createAdSchema),
  AdController.createAd
);

// Update / Delete
router.patch(
  '/:id',
  auth(ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(AdValidation.updateAdSchema),
  AdController.updateAd
);

router.delete(
  '/:id',
  auth(ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AdController.deleteAd
);

router.patch(
  '/:id/approve',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  // validateRequest(AdValidation.approveAdSchema),
  AdController.approveAd
);

router.patch(
  '/:id/reject',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(AdValidation.rejectAdSchema),
  AdController.rejectAd
);

router.patch(
  '/:id/expire',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AdController.expireAd
);

// Boost
router.post(
  '/:id/boost',
  auth(ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(AdValidation.boostAdSchema),
  AdController.boostAd
);

// Report (allow public)
router.post(
  '/:id/report',
  rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }),
  validateRequest(AdValidation.reportAdSchema),
  AdController.reportAd
);

// Favourite
router.post(
  '/:id/favourite',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AdController.addFavourite
);

router.delete(
  '/:id/favourite',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  AdController.removeFavourite
);

// Public dynamic routes (keep last)
router.get('/:id', AdController.getAdById);
router.post(
  '/:id/view',
  rateLimit({ windowMs: 5 * 60 * 1000, max: 1 }),
  AdController.trackView
);

export const AdRoutes = router;
