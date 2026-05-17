import { Router } from 'express';
import {
  auth,
  validateRequest,
  validateRequestFromFormData,
} from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { LotteryController } from './lottery.controller';
import { LotteryValidation } from './lottery.validation';
import { multerUpload } from '../../lib';

const router = Router();

// Public
router.get(
  '/',
  validateRequest(LotteryValidation.listLotteriesSchema),
  LotteryController.listLotteries,
);

// Admin (declare before /:id dynamic routes)
router.get(
  '/admin',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  LotteryController.adminListLotteries,
);

// getLotteryById
router.get('/:id', LotteryController.getLotteryById);

// Authenticated user
router.post(
  '/:id/join',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(LotteryValidation.joinLotterySchema),
  LotteryController.joinLottery,
);

// Verify lottery payment
router.get(
  '/payment/verify',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  LotteryController.verifyLotteryPayment,
);

// getMySummary
router.get(
  '/my/summary',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  LotteryController.getMySummary,
);

// getMyUpcoming
router.get(
  '/my/upcoming',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  LotteryController.getMyUpcoming,
);

// // getMyRewards
// router.get(
//   '/my/rewards',
//   auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
//   LotteryController.getMyRewards,
// );

// // redeemReward
// router.post(
//   '/reward/redeem',
//   auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
//   validateRequest(LotteryValidation.redeemRewardSchema),
//   LotteryController.redeemReward,
// );

// getMyTokens
router.get(
  '/:id/my-tokens',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  LotteryController.getMyTokens,
);

// adminCreateLottery
router.post(
  '/',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  multerUpload.single('lotteryImage'),
  validateRequestFromFormData(LotteryValidation.createLotterySchema),
  LotteryController.adminCreateLottery,
);

// adminUpdateLottery
router.patch(
  '/:id',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  multerUpload.single('lotteryImage'),
  validateRequestFromFormData(LotteryValidation.updateLotterySchema),
  LotteryController.adminUpdateLottery,
);

// adminUpdateLotteryStatus
// router.patch(
//   '/:id/status',
//   auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
//   validateRequest(LotteryValidation.updateLotteryStatusSchema),
//   LotteryController.adminUpdateLotteryStatus,
// );

// adminRunDraw
router.post(
  '/:id/draw',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  LotteryController.adminRunDraw,
);

export const LotteryRoutes = router;
