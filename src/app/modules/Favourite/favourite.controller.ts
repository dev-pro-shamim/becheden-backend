import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { FavouriteService } from './favourite.service';

const getMyFavourites = asyncHandler(async (req, res) => {
  const result = await FavouriteService.getMyFavouritesFromDB(
    req.user,
    req.query
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Favourites retrieved successfully!',
    data: result.data,
    meta: result.meta,
  });
});

const addFavourite = asyncHandler(async (req, res) => {
  const result = await FavouriteService.addFavouriteInDB(
    req.user,
    req.params.adId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Favourite added successfully!',
    data: result,
  });
});

const removeFavourite = asyncHandler(async (req, res) => {
  const result = await FavouriteService.removeFavouriteFromDB(
    req.user,
    req.params.adId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Favourite removed successfully!',
    data: result,
  });
});

export const FavouriteController = {
  getMyFavourites,
  addFavourite,
  removeFavourite,
};
