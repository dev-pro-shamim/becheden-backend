import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { ExtraDataService } from './extraData.service';

// upsertExtraData
const upsertExtraData = asyncHandler(async (req, res) => {
  const file = req.file as Express.Multer.File | undefined;
  const imageKeyRaw = (req.body.imageKey as string | undefined) ?? '';

  const result = await ExtraDataService.updateExtraDataImageInDB(
    imageKeyRaw,
    file,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Extra data updated successfully!',
    data: result,
  });
});

// getExtraData
const getExtraData = asyncHandler(async (req, res) => {
  const result = await ExtraDataService.getExtraDataFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Extra data retrieved successfully!',
    data: result,
  });
});

const updateWebsiteLogo = asyncHandler(async (req, res) => {
  const file = req.file as Express.Multer.File | undefined;
  const result = await ExtraDataService.updateWebsiteLogoInDB(file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Website logo updated successfully!',
    data: result,
  });
});

// updateExtraDataLink
const updateExtraDataLink = asyncHandler(async (req, res) => {
  const { linkKey, link } = req.body;

  const result = await ExtraDataService.updateExtraDataLinkInDB(linkKey, link);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Link updated successfully!',
    data: result,
  });
});

// updateExtraDataHeading
const updateExtraDataHeading = asyncHandler(async (req, res) => {
  const { heading } = req.body;

  const result = await ExtraDataService.updateExtraDataHeadingInDB(heading);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Heading updated successfully!',
    data: result,
  });
});

export const ExtraDataController = {
  upsertExtraData,
  updateWebsiteLogo,
  updateExtraDataLink,
  updateExtraDataHeading,
  getExtraData,
};
