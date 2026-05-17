import httpStatus from 'http-status';
import { asyncHandler } from '../../utils';
import { sendResponse } from '../../utils';
import { PageService } from './page.service';

const createPageOrUpdate = asyncHandler(async (req, res) => {
  const result = await PageService.createOrUpdatePage(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Page created successfully!',
    data: result,
  });
});

const getAllPage = asyncHandler(async (req, res) => {
  const result = await PageService.getAllPage();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Pages retrieved successfully!',
    data: result,
  });
});

const getPageByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const result = await PageService.getPageByType(type as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Page retrieved successfully!',
    data: result,
  });
});

export const PageController = {
  createPageOrUpdate,
  getAllPage,
  getPageByType,
};
