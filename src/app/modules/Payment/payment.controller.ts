import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { PaymentService } from './payment.service';

const initPayment = asyncHandler(async (req, res) => {
  const result = await PaymentService.initPaymentInDB(req.user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payment session created successfully!',
    data: result,
  });
});

const validatePayment = asyncHandler(async (req, res) => {
  const result = await PaymentService.validatePaymentFromGateway(
    req.query.tran_id as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payment validated successfully!',
    data: result,
  });
});

export const PaymentController = {
  initPayment,
  validatePayment,
};
