import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { PaymentController } from './payment.controller';
import { PaymentValidation } from './payment.validation';

const router = Router();

router.post(
  '/init',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(PaymentValidation.initPaymentSchema),
  PaymentController.initPayment
);

router.get(
  '/validate',
  validateRequest(PaymentValidation.validatePaymentSchema),
  PaymentController.validatePayment
);

export const PaymentRoutes = router;
