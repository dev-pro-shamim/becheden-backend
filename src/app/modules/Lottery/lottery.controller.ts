import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { LotteryService } from './lottery.service';

// listLotteries
const listLotteries = asyncHandler(async (req, res) => {
  const result = await LotteryService.listLotteriesFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Lotteries retrieved successfully!',
    data: result.data,
    meta: result.meta,
  });
});

// getLotteryById
const getLotteryById = asyncHandler(async (req, res) => {
  const result = await LotteryService.getLotteryByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Lottery retrieved successfully!',
    data: result,
  });
});

// verifyLotteryPayment
const verifyLotteryPayment = asyncHandler(async (req, res) => {
  const result = await LotteryService.verifyLotteryPaymentInDB(
    req.user,
    req.query.tran_id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Lottery payment verified successfully!',
    data: result,
  });
});

// joinLottery
const joinLottery = asyncHandler(async (req, res) => {
  const result = await LotteryService.joinLotteryInDB(
    req.user,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Lottery joined successfully!',
    data: result,
  });
});

// getMySummary
const getMySummary = asyncHandler(async (req, res) => {
  const result = await LotteryService.getMySummaryFromDB(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Lottery summary retrieved successfully!',
    data: result,
  });
});

// getMyUpcoming
const getMyUpcoming = asyncHandler(async (req, res) => {
  const result = await LotteryService.getMyUpcomingFromDB(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Upcoming draws retrieved successfully!',
    data: result,
  });
});

// getMyRewards
// const getMyRewards = asyncHandler(async (req, res) => {
//   const result = await LotteryService.getMyRewardsFromDB(req.user);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     message: 'Reward history retrieved successfully!',
//     data: result,
//   });
// });

// redeemReward
// const redeemReward = asyncHandler(async (req, res) => {
//   const result = await LotteryService.redeemRewardInDB(req.user, req.body);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     message: 'Reward redeemed successfully!',
//     data: result,
//   });
// });

// adminCreateLottery
const adminCreateLottery = asyncHandler(async (req, res) => {
  const result = await LotteryService.adminCreateLotteryInDB(
    req.body,
    req.file,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Lottery created successfully!',
    data: result,
  });
});

// adminUpdateLottery
const adminUpdateLottery = asyncHandler(async (req, res) => {
  const result = await LotteryService.adminUpdateLotteryInDB(
    req.params.id as string,
    req.body,
    req.file,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Lottery updated successfully!',
    data: result,
  });
});

// adminListLotteries
const adminListLotteries = asyncHandler(async (req, res) => {
  const result = await LotteryService.adminListLotteriesFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Lotteries retrieved successfully!',
    data: result.data,
    meta: result.meta,
  });
});

// adminUpdateLotteryStatus
// const adminUpdateLotteryStatus = asyncHandler(async (req, res) => {
//   const result = await LotteryService.adminUpdateLotteryStatusInDB(
//     req.params.id as string,
//     req.body,
//   );

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     message: 'Lottery status updated successfully!',
//     data: result,
//   });
// });

// adminRunDraw
const adminRunDraw = asyncHandler(async (req, res) => {
  const result = await LotteryService.adminRunDrawInDB(
    req.params.id as string,
    req?.query?.winningToken as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Draw completed successfully!',
    data: result,
  });
});

// getMyTokens
const getMyTokens = asyncHandler(async (req, res) => {
  const result = await LotteryService.getMyTokensForLotteryFromDB(
    req.user,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Tokens retrieved successfully!',
    data: result,
  });
});

export const LotteryController = {
  listLotteries,
  getLotteryById,
  joinLottery,
  getMySummary,
  getMyUpcoming,
  // getMyRewards,
  getMyTokens,
  // redeemReward,
  verifyLotteryPayment,
  adminCreateLottery,
  adminUpdateLottery,
  adminListLotteries,
  // adminUpdateLotteryStatus,
  adminRunDraw,
};
