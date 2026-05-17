import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { AlertService } from './alert.service';

const createAlert = asyncHandler(async (req, res) => {
  const result = await AlertService.createAlertInDB(req.user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Alert created successfully!',
    data: result,
  });
});

const listMyAlerts = asyncHandler(async (req, res) => {
  const result = await AlertService.listMyAlertsFromDB(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Alerts retrieved successfully!',
    data: result,
  });
});

const updateAlert = asyncHandler(async (req, res) => {
  const result = await AlertService.updateAlertInDB(
    req.user,
    req.params.id  as string,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Alert updated successfully!',
    data: result,
  });
});

const deleteAlert = asyncHandler(async (req, res) => {
  const result = await AlertService.deleteAlertFromDB(req.user, req.params.id  as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Alert deleted successfully!',
    data: result,
  });
});

const createSavedSearch = asyncHandler(async (req, res) => {
  const result = await AlertService.createSavedSearchInDB(req.user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Saved search created successfully!',
    data: result,
  });
});

const listMySavedSearches = asyncHandler(async (req, res) => {
  const result = await AlertService.listMySavedSearchesFromDB(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Saved searches retrieved successfully!',
    data: result,
  });
});

const deleteSavedSearch = asyncHandler(async (req, res) => {
  const result = await AlertService.deleteSavedSearchFromDB(
    req.user,
    req.params.id  as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Saved search deleted successfully!',
    data: result,
  });
});

export const AlertController = {
  createAlert,
  listMyAlerts,
  updateAlert,
  deleteAlert,
  createSavedSearch,
  listMySavedSearches,
  deleteSavedSearch,
};
