import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { LocationService } from './location.service';

const getLocations = asyncHandler(async (req, res) => {
  const result = await LocationService.getLocationsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Locations retrieved successfully!',
    data: result,
  });
});

const adminGetLocations = asyncHandler(async (req, res) => {
  const result = await LocationService.adminGetLocationsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Locations retrieved successfully!',
    data: result,
  });
});

const createLocation = asyncHandler(async (req, res) => {
  const result = await LocationService.createLocationInDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Location created successfully!',
    data: result,
  });
});

const updateLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await LocationService.updateLocationInDB(
    id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Location updated successfully!',
    data: result,
  });
});

const deleteLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await LocationService.deleteLocationFromDB(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Location deleted successfully!',
    data: result,
  });
});

export const LocationController = {
  getLocations,
  adminGetLocations,
  createLocation,
  updateLocation,
  deleteLocation,
};
