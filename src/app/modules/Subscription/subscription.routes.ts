import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionValidation } from './subscription.validation';

const router = Router();

// Public
router.get('/plans', SubscriptionController.listPlans);

// Authenticated
router.get(
  '/my',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  SubscriptionController.getMySubscription
);

router.post(
  '/change',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(SubscriptionValidation.buyPlanSchema),
  SubscriptionController.buyPlan
);

router.get(
  '/verify',
  validateRequest(SubscriptionValidation.verifyPaymentSchema),
  SubscriptionController.verifyPayment
);

router.post(
  '/cancel',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  SubscriptionController.cancelSubscription
);

router.get(
  '/invoice/my',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  SubscriptionController.getMyInvoices
);

router.post(
  '/payment-method',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  SubscriptionController.updatePaymentMethod
);

router.post(
  '/wallet/topup',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(SubscriptionValidation.walletTopupSchema),
  SubscriptionController.walletTopup
);

router.get(
  '/wallet',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  SubscriptionController.getWalletBalance
);

// Admin
router.get(
  '/admin',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  SubscriptionController.adminListSubscriptions
);

router.post(
  '/plans',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(SubscriptionValidation.createPlanSchema),
  SubscriptionController.adminCreatePlan
);

router.patch(
  '/plans/:id',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(SubscriptionValidation.updatePlanSchema),
  SubscriptionController.adminUpdatePlan
);

router.delete(
  '/plans/:id',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  SubscriptionController.adminDeletePlan
);

export const SubscriptionRoutes = router;
