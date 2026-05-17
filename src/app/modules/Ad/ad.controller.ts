import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { AdService } from './ad.service';

// getAllAds
const getAllAds = asyncHandler(async (req, res) => {
  const result = await AdService.getAllAdsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Ads retrieved successfully!',
    data: result.data,
    meta: result.meta,
  });
});

// getLatestAds
const getLatestAds = asyncHandler(async (req, res) => {
  const result = await AdService.getLatestAdsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Latest ads retrieved successfully!',
    data: result.data,
    meta: result.meta,
  });
});

// getTopAds
const getTopAds = asyncHandler(async (req, res) => {
  const result = await AdService.getTopAdsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Top ads retrieved successfully!',
    data: result.data,
    meta: result.meta,
  });
});

// getFeaturedAds
const getFeaturedAds = asyncHandler(async (req, res) => {
  const result = await AdService.getFeaturedAdsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Featured ads retrieved successfully!',
    data: result.data,
    meta: result.meta,
  });
});

// getMyAds
const getMyAds = asyncHandler(async (req, res) => {
  const result = await AdService.getMyAdsFromDB(req.user, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'My ads retrieved successfully!',
    data: result.data,
    meta: result.meta,
  });
});

// getAdById
const getAdById = asyncHandler(async (req, res) => {
  const result = await AdService.getAdByIdFromDB(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Ad retrieved successfully!',
    data: result,
  });
});

// createAd
const createAd = asyncHandler(async (req, res) => {
  const result = await AdService.createAdInDB(
    req.user,
    req.body,
    req.files as Express.Multer.File[],
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Ad created successfully!',
    data: result,
  });
});

// updateAd
const updateAd = asyncHandler(async (req, res) => {
  const result = await AdService.updateAdInDB(
    req.user,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Ad updated successfully!',
    data: result,
  });
});

// trackView
const trackView = asyncHandler(async (req, res) => {
  const result = await AdService.trackAdViewInDB(
    req.params.id as string,
    req.ip,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'View tracked successfully!',
    data: result,
  });
});

// deleteAd
const deleteAd = asyncHandler(async (req, res) => {
  const result = await AdService.deleteAdFromDB(
    req.user,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Ad deleted successfully!',
    data: result,
  });
});

// approveAd
const approveAd = asyncHandler(async (req, res) => {
  const result = await AdService.approveAdInDB(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Ad approved successfully!',
    data: result,
  });
});

// rejectAd
const rejectAd = asyncHandler(async (req, res) => {
  const result = await AdService.rejectAdInDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Ad rejected successfully!',
    data: result,
  });
});

// expireAd
const expireAd = asyncHandler(async (req, res) => {
  const result = await AdService.expireAdInDB(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Ad expired successfully!',
    data: result,
  });
});

// boostAd
const boostAd = asyncHandler(async (req, res) => {
  const result = await AdService.boostAdInDB(
    req.user,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Ad boosted successfully!',
    data: result,
  });
});

// reportAd
const reportAd = asyncHandler(async (req, res) => {
  const result = await AdService.reportAdInDB(
    req.params.id as string,
    req.body,
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Ad reported successfully!',
    data: result,
  });
});

// addFavourite
const addFavourite = asyncHandler(async (req, res) => {
  const result = await AdService.addFavouriteInDB(
    req.user,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Favourite added successfully!',
    data: result,
  });
});

// removeFavourite
const removeFavourite = asyncHandler(async (req, res) => {
  const result = await AdService.removeFavouriteFromDB(
    req.user,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Favourite removed successfully!',
    data: result,
  });
});

// adminGetAllAds
const adminGetAllAds = asyncHandler(async (req, res) => {
  const result = await AdService.adminGetAllAdsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Ads retrieved successfully!',
    data: result.data,
    meta: result.meta,
  });
});

// adminGetSummary
const adminGetSummary = asyncHandler(async (_req, res) => {
  const result = await AdService.adminGetSummaryFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Ad summary retrieved successfully!',
    data: result,
  });
});

// adminListReports
const adminListReports = asyncHandler(async (req, res) => {
  const result = await AdService.adminListReportsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Reports retrieved successfully!',
    data: result.data,
    meta: result.meta,
  });
});

// adminResolveReport
const adminResolveReport = asyncHandler(async (req, res) => {
  const result = await AdService.adminResolveReportInDB(
    req.user,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Report resolved successfully!',
    data: result,
  });
});

export const AdController = {
  getAllAds,
  getLatestAds,
  getTopAds,
  getFeaturedAds,
  getMyAds,
  getAdById,

  createAd,
  updateAd,
  trackView,
  deleteAd,

  approveAd,
  rejectAd,

  expireAd,
  boostAd,
  reportAd,
  addFavourite,
  removeFavourite,

  adminGetAllAds,
  adminGetSummary,
  adminListReports,
  adminResolveReport,
};
