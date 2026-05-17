import httpStatus from 'http-status';
import { AppError } from '../../utils';
import { PipelineStage, Types } from 'mongoose';
import { IUser } from '../User/user.interface';
import {
  LotteryEntryModel,
  LotteryModel,
  // RewardRedemptionModel,
} from './lottery.model';
import { deleteImageFromCloudinary, sendImageToCloudinary } from '../../lib';
import { ILottery } from './lottery.interface';
import { paymentSslService } from '../Payment/payment.utils';
import { LotteryPaymentModel } from './lotteryPayment.model';
import config from '../../config';

// listLotteriesFromDB
const listLotteriesFromDB = async (query: Record<string, unknown>) => {
  const {
    status,
    page = 1,
    limit = 10,
  } = query as {
    status?: string;
    page?: string | number;
    limit?: string | number;
  };

  const filter: Record<string, unknown> = {};
  if (status && ['ACTIVE', 'COMPLETED', 'INACTIVE'].includes(status)) {
    filter.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    LotteryModel.find(filter)
      .sort({ drawDate: 1 })
      .skip(skip)
      .limit(Number(limit)),
    LotteryModel.countDocuments(filter),
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

// getLotteryByIdFromDB
const getLotteryByIdFromDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid lottery id!');
  }

  const doc = await LotteryModel.findById(id);
  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Lottery not found!');
  }

  return doc;
};

// Helper function to generate unique token number
const generateUniqueToken = async (
  lotteryId: Types.ObjectId,
): Promise<string> => {
  let tokenNumber: string;
  let exists = true;

  while (exists) {
    // Generate random 6-digit number
    const random = Math.floor(100000 + Math.random() * 900000);
    tokenNumber = `TKN-${random}`;

    // Check if already exists for this lottery
    const found = await LotteryEntryModel.findOne({
      lottery: lotteryId,
      tokenNumbers: { $in: [tokenNumber] },
    });
    exists = !!found;
  }

  return tokenNumber!;
};

// Helper to apply lottery tokens after successful payment
const applyLotteryTokensForUser = async (
  user: IUser,
  lottery: ILottery,
  quantity: number,
) => {
  const tokenNumbers: string[] = [];
  for (let i = 0; i < quantity; i++) {
    const tokenNumber = await generateUniqueToken(lottery._id);
    tokenNumbers.push(tokenNumber);
  }

  const existingEntry = await LotteryEntryModel.findOne({
    lottery: lottery._id,
    user: user._id,
  });

  if (existingEntry) {
    existingEntry.tokenNumbers.push(...tokenNumbers);
    await existingEntry.save();
  } else {
    await LotteryEntryModel.create({
      lottery: lottery._id,
      user: user._id,
      tokenNumbers,
    });

    await LotteryModel.findByIdAndUpdate(lottery._id, {
      $inc: { participantsCount: 1 },
    });
  }

  await LotteryModel.findByIdAndUpdate(lottery._id, {
    $inc: { totalTickets: quantity },
  });

  return tokenNumbers;
};

// joinLotteryInDB - initialize payment session for lottery
const joinLotteryInDB = async (
  user: IUser,
  lotteryId: string,
  payload: { quantity?: number },
) => {
  if (!Types.ObjectId.isValid(lotteryId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid lottery id!');
  }

  const quantity = payload?.quantity ? Number(payload.quantity) : 1;
  if (Number.isNaN(quantity) || quantity <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid quantity!');
  }

  const lottery = await LotteryModel.findById(lotteryId);
  if (!lottery) {
    throw new AppError(httpStatus.NOT_FOUND, 'Lottery not found!');
  }

  if (lottery.status !== 'ACTIVE') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Lottery is not active!');
  }

  const amount = lottery.ticketPrice * quantity;
  if (!amount || Number.isNaN(amount) || amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid amount calculated!');
  }

  const transactionId = paymentSslService.generateTransactionId();
  const gatewayUrl = await paymentSslService.initializePayment({
    total_amount: amount,
    validation_url: config.ssl.lottery_payment_validation_url as string,
    tran_id: transactionId,
  });

  await LotteryPaymentModel.create({
    user: user._id,
    lottery: lottery._id,
    quantity,
    amount,
    status: 'Pending',
    transactionId,
    applied: false,
  });

  return { gatewayUrl, transactionId };
};

// verifyLotteryPaymentInDB - after successful payment, generate tokens
const verifyLotteryPaymentInDB = async (user: IUser, tranId: string) => {
  if (!tranId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'tran_id is required!');
  }

  const payment = await LotteryPaymentModel.findOne({
    transactionId: tranId,
    user: user._id,
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Lottery payment not found!');
  }

  const lottery = await LotteryModel.findById(payment.lottery);
  if (!lottery) {
    throw new AppError(httpStatus.NOT_FOUND, 'Lottery not found!');
  }

  if (payment.applied) {
    const entry = await LotteryEntryModel.findOne({
      lottery: lottery._id,
      user: user._id,
    });

    return {
      // payment,
      // lottery,
      tokenNumbers: entry?.tokenNumbers ?? [],
      // alreadyApplied: true,
    };
  }

  const validationResponse =
    await paymentSslService.validateFromGatewayRaw(tranId);

  const status = validationResponse.element?.[0]?.status;

  if (status !== 'VALID' && status !== 'VALIDATED') {
    throw new AppError(
      httpStatus.EXPECTATION_FAILED,
      'Payment validation failed!',
    );
  }

  const gatewayResponse = validationResponse.element[0];

  const updatedPayment = await LotteryPaymentModel.findOneAndUpdate(
    { transactionId: tranId },
    {
      status: 'Paid',
      gatewayResponse,
    },
    { new: true },
  );

  if (!updatedPayment) {
    throw new AppError(httpStatus.NOT_MODIFIED, 'Payment not updated!');
  }

  const tokenNumbers = await applyLotteryTokensForUser(
    user,
    lottery,
    payment.quantity,
  );

  await LotteryPaymentModel.findOneAndUpdate(
    { transactionId: tranId },
    { applied: true },
    { new: true },
  );

  return {
    // payment: finalPayment,
    // lottery,
    tokenNumbers,
    // alreadyApplied: false,
  };
};

// getMySummaryFromDB
const getMySummaryFromDB = async (user: IUser) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // const [entriesThisMonth, rewardRedeems] = await Promise.all([
  //   LotteryEntryModel.countDocuments({
  //     user: user._id,
  //     createdAt: { $gte: startOfMonth, $lt: endOfMonth },
  //   }),
  //   RewardRedemptionModel.countDocuments({ user: user._id }),
  // ]);

  const entriesThisMonth = await LotteryEntryModel.countDocuments({
    user: user._id,
    createdAt: { $gte: startOfMonth, $lt: endOfMonth },
  });
  const winsAgg = await LotteryEntryModel.aggregate([
    { $match: { user: user._id } },
    {
      $lookup: {
        from: 'lotteries',
        localField: 'lottery',
        foreignField: '_id',
        as: 'lottery',
      },
    },
    {
      $unwind: {
        path: '$lottery',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        'lottery.status': 'COMPLETED',
        'lottery.winnerToken': { $ne: null },
      },
    },
    {
      $match: {
        $expr: {
          $in: ['$lottery.winnerToken', '$tokenNumbers'],
        },
      },
    },
    { $count: 'count' },
  ]);

  const winsCount = winsAgg?.[0]?.count ?? 0;

  return {
    entriesThisMonth,
    // rewardPoints: rewardRedeems,
    winsCount,
  };
};

// getMyUpcomingFromDB
const getMyUpcomingFromDB = async (user: IUser) => {
  const pipeline: PipelineStage[] = [
    { $match: { user: new Types.ObjectId(user._id) } },
    {
      $lookup: {
        from: 'lotteries',
        localField: 'lottery',
        foreignField: '_id',
        as: 'lottery',
      },
    },
    {
      $unwind: {
        path: '$lottery',
        preserveNullAndEmptyArrays: true,
      },
    },
    { $match: { 'lottery.drawDate': { $gte: new Date() } } },
    { $sort: { 'lottery.drawDate': 1 } },
    {
      $project: {
        _id: 0,
        lotteryId: '$lottery._id',
        title: '$lottery.title',
        drawDate: '$lottery.drawDate',
        status: '$lottery.status',
        ticketPrice: '$lottery.ticketPrice',
      },
    },
  ];

  const data = await LotteryEntryModel.aggregate(pipeline as PipelineStage[]);
  return data;
};

// getMyRewardsFromDB
// const getMyRewardsFromDB = async (user: IUser) => {
//   const data = await RewardRedemptionModel.find({ user: user._id }).sort({
//     createdAt: -1,
//   });
//   return data;
// };

// redeemRewardInDB
// const redeemRewardInDB = async (
//   user: IUser,
//   payload: { rewardId: string; quantity?: number },
// ) => {
//   const quantity = payload?.quantity ? Number(payload.quantity) : 1;
//   if (!payload?.rewardId) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'rewardId is required!');
//   }
//   if (Number.isNaN(quantity) || quantity <= 0) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Invalid quantity!');
//   }

//   const created = await RewardRedemptionModel.create({
//     user: user._id,
//     rewardId: payload.rewardId,
//     quantity,
//   });

//   return created;
// };

// adminCreateLotteryInDB
const adminCreateLotteryInDB = async (
  payload: Pick<
    ILottery,
    'title' | 'description' | 'drawDate' | 'ticketPrice' | 'prize' | 'image'
  >,
  imageFile: Express.Multer.File | undefined,
) => {
  if (!imageFile) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Icon image is required!');
  }

  // Validate draw date (must be in the future)
  const drawDate = new Date(payload.drawDate);
  const now = new Date();
  if (Number.isNaN(drawDate.getTime()) || drawDate <= now) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Draw date must be in the future!',
    );
  }

  const uploaded = await sendImageToCloudinary(imageFile);
  payload.image = uploaded.secure_url;

  const created = await LotteryModel.create(payload);
  return created;
};

// adminUpdateLotteryInDB
const adminUpdateLotteryInDB = async (
  id: string,
  payload: Pick<
    ILottery,
    'title' | 'description' | 'drawDate' | 'ticketPrice' | 'prize' | 'image'
  >,
  imageFile: Express.Multer.File | undefined,
) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid lottery id!');
  }

  // If drawDate is being updated, ensure it is in the future
  if (payload.drawDate) {
    const drawDate = new Date(payload.drawDate);
    const now = new Date();
    if (Number.isNaN(drawDate.getTime()) || drawDate <= now) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Draw date must be in the future!',
      );
    }
  }

  if (imageFile) {
    const uploaded = await sendImageToCloudinary(imageFile);
    payload.image = uploaded.secure_url;
  }

  const updated = await LotteryModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    if (payload.image) {
      await deleteImageFromCloudinary(payload.image);
    }
    throw new AppError(httpStatus.NOT_FOUND, 'Lottery not found!');
  }

  return updated;
};

// adminListLotteriesFromDB
const adminListLotteriesFromDB = async (query: Record<string, unknown>) => {
  const {
    status,
    page = 1,
    limit = 20,
  } = query as {
    status?: string;
    page?: string | number;
    limit?: string | number;
  };

  const filter: Record<string, unknown> = {};
  if (status && ['active', 'inactive', 'completed'].includes(status)) {
    filter.status = status.toUpperCase();
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    LotteryModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    LotteryModel.countDocuments(filter),
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

// adminUpdateLotteryStatusInDB
// const adminUpdateLotteryStatusInDB = async (
//   id: string,
//   payload: { status: string },
// ) => {
//   if (!Types.ObjectId.isValid(id)) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Invalid lottery id!');
//   }

//   const status = payload?.status?.toUpperCase();
//   if (!status || !['ACTIVE', 'INACTIVE', 'COMPLETED'].includes(status)) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Invalid status!');
//   }

//   const updated = await LotteryModel.findByIdAndUpdate(
//     id,
//     { status },
//     { new: true, runValidators: true },
//   );

//   if (!updated) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Lottery not found!');
//   }

//   return updated;
// };

// adminRunDrawInDB
const adminRunDrawInDB = async (lotteryId: string, winningToken: string) => {
  if (!Types.ObjectId.isValid(lotteryId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid lottery id!');
  }

  const lottery = await LotteryModel.findById(lotteryId);
  if (!lottery) {
    throw new AppError(httpStatus.NOT_FOUND, 'Lottery not found!');
  }

  if (lottery.status === 'COMPLETED' && lottery.winnerToken) {
    // Already completed - find and return winner
    const winnerEntry = await LotteryEntryModel.findOne({
      lottery: lottery._id,
      tokenNumbers: { $in: [lottery.winnerToken] },
    }).populate('user');

    return {
      lottery,
      winner: winnerEntry,
      winningToken: lottery.winnerToken,
    };
  }

  if (!winningToken) {
    // Get all entries and collect all tokens
    const allEntries = await LotteryEntryModel.find({
      lottery: lottery._id,
    });

    if (allEntries.length === 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'No entries found for this lottery!',
      );
    }

    // Flatten all token numbers from all entries
    const allTokens: string[] = [];
    allEntries.forEach((entry) => {
      allTokens.push(...entry.tokenNumbers);
    });

    if (allTokens.length === 0) {
      throw new AppError(httpStatus.BAD_REQUEST, 'No tokens found!');
    }

    // Select random winning token
    const randomIndex = Math.floor(Math.random() * allTokens.length);
    winningToken = allTokens[randomIndex];
  }

  // Update lottery with winner token and status
  await LotteryModel.findByIdAndUpdate(lotteryId, {
    status: 'COMPLETED',
    winnerToken: winningToken,
  });

  // Find winner entry
  const winnerEntry = await LotteryEntryModel.findOne({
    lottery: lottery._id,
    tokenNumbers: { $in: [winningToken] },
  }).populate('user');

  return {
    lottery,
    winner: winnerEntry,
    winningToken,
  };
};

// getMyTokensForLotteryFromDB
const getMyTokensForLotteryFromDB = async (user: IUser, lotteryId: string) => {
  if (!Types.ObjectId.isValid(lotteryId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid lottery id!');
  }

  const entry = await LotteryEntryModel.findOne({
    lottery: lotteryId,
    user: user._id,
  }).select('tokenNumbers createdAt');

  if (!entry) {
    return { tokenNumbers: [], totalTokens: 0, hasWon: false };
  }

  // Get lottery to check if it has a winner
  const lottery = await LotteryModel.findById(lotteryId).select('winnerToken');

  return {
    tokenNumbers: entry.tokenNumbers,
    totalTokens: entry.tokenNumbers.length,
    hasWon:
      lottery?.winnerToken && entry.tokenNumbers.includes(lottery.winnerToken),
    winningToken: lottery?.winnerToken || null,
  };
};

export const LotteryService = {
  listLotteriesFromDB,
  getLotteryByIdFromDB,
  joinLotteryInDB,
  verifyLotteryPaymentInDB,
  getMySummaryFromDB,
  getMyUpcomingFromDB,
  // getMyRewardsFromDB,
  // redeemRewardInDB,
  adminCreateLotteryInDB,
  adminUpdateLotteryInDB,
  adminListLotteriesFromDB,
  // adminUpdateLotteryStatusInDB,
  adminRunDrawInDB,
  getMyTokensForLotteryFromDB,
};
