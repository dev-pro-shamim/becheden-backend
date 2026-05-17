import httpStatus from 'http-status';
import { AppError } from '../../utils';
import { PipelineStage, Types } from 'mongoose';
import { IUser } from '../User/user.interface';
import CategoryModel from '../Category/category.model';
import { FavouriteModel } from './favourite.model';
import { AdModel } from '../Ad/ad.model';

const getMyFavouritesFromDB = async (
  user: IUser,
  query: Record<string, unknown>,
) => {
  const {
    category,
    page = 1,
    limit = 20,
  } = query as {
    category?: string;
    page?: string | number;
    limit?: string | number;
  };

  const userId = new Types.ObjectId(user._id);

  let categoryId: Types.ObjectId | undefined;
  if (category) {
    const categoryDoc = await CategoryModel.findOne({
      slug: { $regex: new RegExp(`^${category}$`, 'i') },
    })
      .select('_id')
      .lean();

    if (!categoryDoc) {
      return {
        data: [],
        meta: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          totalPage: 0,
        },
      };
    }

    categoryId = categoryDoc._id as Types.ObjectId;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const pipeline: PipelineStage[] = [
    { $match: { user: userId } },
    {
      $lookup: {
        from: 'ads',
        localField: 'ad',
        foreignField: '_id',
        as: 'ad',
      },
    },
    {
      $unwind: {
        path: '$ad',
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  if (categoryId) {
    pipeline.push({ $match: { 'ad.categoryId': categoryId } });
  }

  pipeline.push(
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        meta: [{ $count: 'total' }],
        data: [
          { $skip: skip },
          { $limit: Number(limit) },
          {
            $project: {
              _id: 1,
              adId: '$ad._id',
              title: '$ad.title',
              price: '$ad.price',
              location: '$ad.location',
              postedAt: '$ad.createdAt',
              imageUrl: { $arrayElemAt: ['$ad.images', 0] },
              isFeatured: '$ad.isFeatured',
              isUrgent: '$ad.isUrgent',
            },
          },
        ],
      },
    },
  );

  const result = await FavouriteModel.aggregate(pipeline as PipelineStage[]);
  const total = result?.[0]?.meta?.[0]?.total ?? 0;
  const totalPage = total ? Math.ceil(total / Number(limit)) : 0;

  return {
    data: result?.[0]?.data ?? [],
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage,
    },
  };
};

const addFavouriteInDB = async (user: IUser, adId: string) => {
  if (!Types.ObjectId.isValid(adId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid adId!');
  }

  const ad = await AdModel.findById(adId).select('_id').lean();
  if (!ad) {
    throw new AppError(httpStatus.NOT_FOUND, 'Ad not found!');
  }

  const existing = await FavouriteModel.findOne({
    user: user._id,
    ad: ad._id,
  }).lean();

  if (existing) {
    return existing;
  }

  const created = await FavouriteModel.create({
    user: user._id,
    ad: ad._id,
  });

  return created;
};

const removeFavouriteFromDB = async (user: IUser, adId: string) => {
  if (!Types.ObjectId.isValid(adId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid adId!');
  }

  const deleted = await FavouriteModel.findOneAndDelete({
    user: user._id,
    ad: adId,
  });

  if (!deleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Favourite not found!');
  }

  return deleted;
};

export const FavouriteService = {
  getMyFavouritesFromDB,
  addFavouriteInDB,
  removeFavouriteFromDB,
};
