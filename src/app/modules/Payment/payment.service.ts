import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { AppError } from '../../utils';
import { paymentSslService } from './payment.utils';
import { SubscriptionPaymentModel } from './payment.model';
import config from '../../config';

const initPaymentInDB = async (
  user: unknown,
  payload: { amount: number; orderId?: string | null },
) => {
  const userId = (user as { _id?: string })?._id;
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
  }

  const transactionId = paymentSslService.generateTransactionId();

  const gatewayUrl = await paymentSslService.initializePayment({
    total_amount: payload.amount,
    validation_url: config.ssl.subscription_payment_validation_url as string,
    tran_id: transactionId,
  });

  const orderId = payload.orderId ?? null;

  await SubscriptionPaymentModel.create({
    user: new Types.ObjectId(userId),
    order:
      orderId && Types.ObjectId.isValid(orderId)
        ? new Types.ObjectId(orderId)
        : null,
    amount: payload.amount,
    status: 'Pending',
    transactionId,
  });

  return { gatewayUrl, transactionId };
};

const validatePaymentFromGateway = async (tranId: string) => {
  if (!tranId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'tran_id is required!');
  }

  const result = await paymentSslService.validatePayment(tranId);
  return result;
};

export const PaymentService = {
  initPaymentInDB,
  validatePaymentFromGateway,
};
