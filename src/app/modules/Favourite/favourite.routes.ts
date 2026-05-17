import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { FavouriteController } from './favourite.controller';
import { FavouriteValidation } from './favourite.validation';

const router = Router();

router.get(
  '/my',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(FavouriteValidation.listMyFavouritesSchema),
  FavouriteController.getMyFavourites
);

router.post(
  '/:adId',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  FavouriteController.addFavourite
);

router.delete(
  '/:adId',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  FavouriteController.removeFavourite
);

export const FavouriteRoutes = router;
