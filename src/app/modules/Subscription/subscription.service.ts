import httpStatus from 'http-status';
import { AppError } from '../../utils';
import { Types } from 'mongoose';
import { IUser } from '../User/user.interface';
import {
  InvoiceModel,
  SubscriptionPlanModel,
  UserSubscriptionModel,
} from './subscription.model';
import { WalletTransactionModel } from './wallet.model';
import { PaymentMethodModel } from './paymentMethod.model';
import VendorModel from '../Vendor/vendor.model';
import { paymentSslService } from '../Payment/payment.utils';
import { SubscriptionPaymentModel } from '../Payment/payment.model';
import config from '../../config';

const getMySubscriptionFromDB = async (user: IUser) => {
  const doc = await UserSubscriptionModel.findOne({ user: user._id })
    .populate('plan')
    .sort({ createdAt: -1 });

  return doc;
};

const listPlansFromDB = async () => {
  const data = await SubscriptionPlanModel.find({ isActive: true }).sort({
    price: 1,
  });
  return data;
};

const buyPlanInDB = async (
  user: IUser,
  payload: { planId: string; billingCycle?: string },
) => {
  const { planId } = payload;

  if (!Types.ObjectId.isValid(planId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid planId!');
  }

  const plan = await SubscriptionPlanModel.findById(planId);
  if (!plan || !plan.isActive) {
    throw new AppError(httpStatus.NOT_FOUND, 'Plan not found!');
  }

  const transactionId = paymentSslService.generateTransactionId();

  const gatewayUrl = await paymentSslService.initializePayment({
    total_amount: plan.price,
    validation_url: config.ssl.subscription_payment_validation_url as string,
    tran_id: transactionId,
  });

  await SubscriptionPaymentModel.create({
    user: user._id,
    subscriptionPlan: plan._id,
    amount: plan.price,
    status: 'Pending',
    transactionId,
    applied: false,
  });

  return { gatewayUrl, transactionId };
};

const verifyPlanPaymentInDB = async (tranId: string) => {
  if (!tranId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'tran_id is required!');
  }

  const payment = await SubscriptionPaymentModel.findOne({
    transactionId: tranId,
  });
  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Payment not found!');
  }

  if (payment.applied) {
    const existing = await UserSubscriptionModel.findOne({
      user: payment.user,
    }).populate('plan');
    return { payment, subscription: existing };
  }

  const validatedPayment = await paymentSslService.validatePayment(tranId);

  const subscriptionPlanId = payment.subscriptionPlan;
  if (!subscriptionPlanId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Subscription plan not found!');
  }

  const plan = await SubscriptionPlanModel.findById(subscriptionPlanId);
  if (!plan || !plan.isActive) {
    throw new AppError(httpStatus.NOT_FOUND, 'Plan not found!');
  }

  const renewsAt = new Date();
  const unit = plan.durationUnit;
  const value = plan.durationValue;
  if (unit === 'DAY') renewsAt.setDate(renewsAt.getDate() + value);
  if (unit === 'MONTH') renewsAt.setMonth(renewsAt.getMonth() + value);
  if (unit === 'YEAR') renewsAt.setFullYear(renewsAt.getFullYear() + value);

  const updatedSubscription = await UserSubscriptionModel.findOneAndUpdate(
    { user: payment.user },
    {
      user: payment.user,
      plan: plan._id,
      status: 'ACTIVE',
      renewsAt,
      autoRenew: false,
    },
    { new: true, upsert: true, runValidators: true },
  ).populate('plan');

  await VendorModel.findOneAndUpdate(
    { user: payment.user },
    {
      currentPlanId: plan._id,
      planExpiresAt: renewsAt,
      cycleStartedAt: new Date(),
      cycleListingsUsed: 0,
    },
  );

  await InvoiceModel.create({
    user: payment.user,
    invoiceNo: `INV-${Date.now()}`,
    date: new Date(),
    planName: plan.name,
    amount: plan.price,
    status: 'PAID',
  });

  await SubscriptionPaymentModel.findOneAndUpdate(
    // { transactionId: tranId, applied: false },
    { transactionId: tranId }, // transactionId  unique & index: true,
    {
      applied: true,
      status: validatedPayment.status,
      gatewayResponse: validatedPayment.gatewayResponse,
    },
    { new: true },
  );

  return { payment: validatedPayment, subscription: updatedSubscription };
};

const cancelSubscriptionInDB = async (user: IUser) => {
  const updated = await UserSubscriptionModel.findOneAndUpdate(
    { user: user._id },
    { status: 'CANCELLED', autoRenew: false },
    { new: true },
  ).populate('plan');

  if (!updated) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subscription not found!');
  }

  return updated;
};

const getMyInvoicesFromDB = async (user: IUser) => {
  const data = await InvoiceModel.find({ user: user._id }).sort({ date: -1 });
  return data;
};

const updatePaymentMethodInDB = async (
  user: IUser,
  payload: Record<string, unknown>,
) => {
  const provider = (payload.provider as string | undefined) ?? 'SSL';
  const token = (payload.token as string | undefined) ?? null;
  const last4 = (payload.last4 as string | undefined) ?? null;
  const brand = (payload.brand as string | undefined) ?? null;

  const updated = await PaymentMethodModel.findOneAndUpdate(
    { user: user._id, isDefault: true },
    {
      user: user._id,
      provider,
      token,
      last4,
      brand,
      isDefault: true,
    },
    { upsert: true, new: true, runValidators: true },
  );

  return updated;
};

const walletTopupInDB = async (
  user: IUser,
  payload: Record<string, unknown>,
) => {
  const amountRaw = payload.amount;
  const amount = typeof amountRaw === 'number' ? amountRaw : Number(amountRaw);
  if (!amount || Number.isNaN(amount) || amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid amount!');
  }

  const reference = (payload.reference as string | undefined) ?? null;

  const txn = await WalletTransactionModel.create({
    user: user._id,
    type: 'TOPUP',
    amount,
    status: 'COMPLETED',
    reference,
  });

  return txn;
};

const getWalletBalanceFromDB = async (user: IUser) => {
  const [credits, debits] = await Promise.all([
    WalletTransactionModel.aggregate([
      { $match: { user: user._id, status: 'COMPLETED', type: 'TOPUP' } },
      { $group: { _id: null, sum: { $sum: '$amount' } } },
    ]),
    WalletTransactionModel.aggregate([
      { $match: { user: user._id, status: 'COMPLETED', type: 'DEBIT' } },
      { $group: { _id: null, sum: { $sum: '$amount' } } },
    ]),
  ]);

  const totalTopup = credits?.[0]?.sum ?? 0;
  const totalDebit = debits?.[0]?.sum ?? 0;
  const balance = totalTopup - totalDebit;

  return { balance };
};

const adminCreatePlanInDB = async (payload: Record<string, unknown>) => {
  const created = await SubscriptionPlanModel.create(payload);
  return created;
};

const adminUpdatePlanInDB = async (
  id: string,
  payload: Record<string, unknown>,
) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid plan id!');
  }

  const updated = await SubscriptionPlanModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    throw new AppError(httpStatus.NOT_FOUND, 'Plan not found!');
  }

  return updated;
};

const adminDeletePlanInDB = async (id: string) => {
  const deletedPlan = await SubscriptionPlanModel.findByIdAndDelete(id);

  if (!deletedPlan) {
    throw new AppError(httpStatus.NOT_FOUND, 'Plan not found!');
  }

  return null;
};

const adminListSubscriptionsFromDB = async (query: Record<string, unknown>) => {
  const { page = 1, limit = 20 } = query as {
    page?: string | number;
    limit?: string | number;
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [data, total] = await Promise.all([
    UserSubscriptionModel.find()
      .populate('plan')
      .populate('user')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    UserSubscriptionModel.countDocuments(),
  ]);

  return {
    data,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: total ? Math.ceil(total / Number(limit)) : 0,
    },
  };
};

export const SubscriptionService = {
  getMySubscriptionFromDB,
  listPlansFromDB,
  buyPlanInDB,
  verifyPlanPaymentInDB,
  cancelSubscriptionInDB,
  getMyInvoicesFromDB,
  updatePaymentMethodInDB,
  walletTopupInDB,
  getWalletBalanceFromDB,
  adminCreatePlanInDB,
  adminUpdatePlanInDB,
  adminDeletePlanInDB,
  adminListSubscriptionsFromDB,
};
