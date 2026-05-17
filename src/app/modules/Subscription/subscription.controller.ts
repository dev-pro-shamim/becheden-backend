import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { SubscriptionService } from './subscription.service';

const getMySubscription = asyncHandler(async (req, res) => {
  const result = await SubscriptionService.getMySubscriptionFromDB(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Subscription retrieved successfully!',
    data: result,
  });
});

const listPlans = asyncHandler(async (_req, res) => {
  const result = await SubscriptionService.listPlansFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Plans retrieved successfully!',
    data: result,
  });
});

const buyPlan = asyncHandler(async (req, res) => {
  const result = await SubscriptionService.buyPlanInDB(req.user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payment session created successfully!',
    data: result,
  });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const result = await SubscriptionService.verifyPlanPaymentInDB(
    req.query.tran_id as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payment verified successfully!',
    data: result,
  });
});

const cancelSubscription = asyncHandler(async (req, res) => {
  const result = await SubscriptionService.cancelSubscriptionInDB(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Subscription cancelled successfully!',
    data: result,
  });
});

const getMyInvoices = asyncHandler(async (req, res) => {
  const result = await SubscriptionService.getMyInvoicesFromDB(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Invoices retrieved successfully!',
    data: result,
  });
});

const updatePaymentMethod = asyncHandler(async (req, res) => {
  const result = await SubscriptionService.updatePaymentMethodInDB(
    req.user,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payment method updated successfully!',
    data: result,
  });
});

const walletTopup = asyncHandler(async (req, res) => {
  const result = await SubscriptionService.walletTopupInDB(req.user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Wallet topup initiated successfully!',
    data: result,
  });
});

const getWalletBalance = asyncHandler(async (req, res) => {
  const result = await SubscriptionService.getWalletBalanceFromDB(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Wallet balance retrieved successfully!',
    data: result,
  });
});

const adminCreatePlan = asyncHandler(async (req, res) => {
  const result = await SubscriptionService.adminCreatePlanInDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Plan created successfully!',
    data: result,
  });
});

const adminUpdatePlan = asyncHandler(async (req, res) => {
  const result = await SubscriptionService.adminUpdatePlanInDB(
    req.params.id  as string,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Plan updated successfully!',
    data: result,
  });
});

const adminDeletePlan = asyncHandler(async (req, res) => {
  const result = await SubscriptionService.adminDeletePlanInDB(req.params.id  as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Plan deleted successfully!',
    data: result,
  });
});

const adminListSubscriptions = asyncHandler(async (req, res) => {
  const result = await SubscriptionService.adminListSubscriptionsFromDB(
    req.query
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Subscriptions retrieved successfully!',
    data: result.data,
    meta: result.meta,
  });
});

export const SubscriptionController = {
  getMySubscription,
  listPlans,
  buyPlan,
  verifyPayment,
  cancelSubscription,
  getMyInvoices,
  updatePaymentMethod,
  walletTopup,
  getWalletBalance,
  adminCreatePlan,
  adminUpdatePlan,
  adminDeletePlan,
  adminListSubscriptions,
};
