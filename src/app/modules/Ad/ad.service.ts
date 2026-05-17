import httpStatus from 'http-status';
import { AppError } from '../../utils';
import { Types } from 'mongoose';
import { IUser } from '../User/user.interface';
import { ROLE } from '../User/user.constant';
import CategoryModel from '../Category/category.model';
import { AdModel } from './ad.model';
import { FavouriteModel } from '../Favourite/favourite.model';
import { sendImageToCloudinary } from '../../lib';
import { AdReportModel } from './adReport.model';
import VendorModel from '../Vendor/vendor.model';
// import { VENDOR_STATUS } from '../Vendor/vendor.constant';
// import { UserSubscriptionModel } from '../Subscription/subscription.model';

type TAdListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

const isAdminUser = (user: IUser) => {
  return user.role === ROLE.ADMIN || user.role === ROLE.SUPER_ADMIN;
};

const parseBoolean = (v: unknown): boolean | undefined => {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    if (v.toLowerCase() === 'true') return true;
    if (v.toLowerCase() === 'false') return false;
  }
  return undefined;
};

// getLatestAdsFromDB
const getLatestAdsFromDB = async (query: Record<string, unknown>) => {
  return getAllAdsFromDB({ ...query });
};

// getTopAdsFromDB
const getTopAdsFromDB = async (query: Record<string, unknown>) => {
  return getAllAdsFromDB({ ...query, sortBy: 'popular' });
};

// getFeaturedAdsFromDB
const getFeaturedAdsFromDB = async (query: Record<string, unknown>) => {
  return getAllAdsFromDB({ ...query, featured: 'true' });
};

// getAllAdsFromDB
const getAllAdsFromDB = async (query: Record<string, unknown>) => {
  const {
    searchTerm,
    category,
    location,
    minPrice,
    maxPrice,
    condition,
    featured,
    urgent,
    sortBy,
    page = 1,
    limit = 20,
  } = query as Record<string, unknown>;

  const filter: Record<string, unknown> = {
    status: { $in: ['ACTIVE', 'APPROVED'] },
  };

  if (searchTerm && typeof searchTerm === 'string') {
    filter.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  if (category && typeof category === 'string') {
    const categoryDoc = await CategoryModel.findOne({
      slug: { $regex: new RegExp(`^${category}$`, 'i') },
    })
      .select('_id')
      .lean();
    if (categoryDoc) {
      filter.categoryId = categoryDoc._id;
    } else {
      const meta: TAdListMeta = {
        page: Number(page),
        limit: Number(limit),
        total: 0,
        totalPage: 0,
      };
      return { data: [], meta };
    }
  }

  if (location && typeof location === 'string') {
    filter.location = { $regex: location, $options: 'i' };
  }

  if (condition && typeof condition === 'string') {
    filter.condition = condition;
  }

  const featuredBool = parseBoolean(featured);
  if (typeof featuredBool === 'boolean') {
    filter.isFeatured = featuredBool;
  }

  const urgentBool = parseBoolean(urgent);
  if (typeof urgentBool === 'boolean') {
    filter.isUrgent = urgentBool;
  }

  if (minPrice || maxPrice) {
    const priceFilter: Record<string, unknown> = {};
    if (minPrice) priceFilter.$gte = Number(minPrice);
    if (maxPrice) priceFilter.$lte = Number(maxPrice);
    filter.price = priceFilter;
  }

  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  if (sortBy === 'price_low') sort = { price: 1 };
  if (sortBy === 'price_high') sort = { price: -1 };
  if (sortBy === 'popular') sort = { views: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    AdModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .select('title price location createdAt images isFeatured isUrgent'),
    AdModel.countDocuments(filter),
  ]);

  const meta: TAdListMeta = {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPage: total ? Math.ceil(total / Number(limit)) : 0,
  };

  const formatted = data.map((ad) => ({
    id: ad._id,
    title: ad.title,
    price: ad.price,
    location: ad.location,
    postedAt: ad.createdAt,
    coverImage: ad.images?.[0] ?? null,
    isFeatured: ad.isFeatured,
    isUrgent: ad.isUrgent,
  }));

  return { data: formatted, meta };
};

// getMyAdsFromDB
const getMyAdsFromDB = async (user: IUser, query: Record<string, unknown>) => {
  const {
    status,
    page = 1,
    limit = 20,
  } = query as {
    status?: string;
    page?: string | number;
    limit?: string | number;
  };

  const filter: Record<string, unknown> = { user: user._id };
  if (status && typeof status === 'string') {
    filter.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    AdModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    AdModel.countDocuments(filter),
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

// getAdByIdFromDB
const getAdByIdFromDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid ad id!');
  }

  const ad = await AdModel.findById(id).populate('categoryId').populate('user');
  if (!ad) {
    throw new AppError(httpStatus.NOT_FOUND, 'Ad not found!');
  }

  // Fetch related ads: up to 5 approved ads from same category, excluding current ad
  const relatedAds = await AdModel.find({
    categoryId: ad.categoryId,
    _id: { $ne: ad._id },
    status: 'ACTIVE',
  })
    .populate('categoryId')
    .populate('user')
    .limit(10);

  return {
    ...ad.toObject(),
    relatedAds: relatedAds.map((r) => r.toObject()),
  };
};

// createAdInDB
const createAdInDB = async (
  user: IUser,
  payload: Record<string, unknown>,
  imageFiles: Express.Multer.File[],
) => {
  // Check Ad Limit for Non-Admin Users
  // if (!isAdminUser(user)) {
  //   // 1. Check Vendor Profile first
  //   const vendor = await VendorModel.findOne({ user: user._id });

  //   if (user.role === ROLE.VENDOR) {
  //     if (!vendor) {
  //       throw new AppError(
  //         httpStatus.FORBIDDEN,
  //         'Vendor profile not found. Please complete your vendor profile and wait for admin approval.',
  //       );
  //     }

  //     if (vendor.blocked) {
  //       throw new AppError(
  //         httpStatus.FORBIDDEN,
  //         'Your vendor account is blocked. Please contact support.',
  //       );
  //     }

  //     if (vendor.status !== VENDOR_STATUS.APPROVED) {
  //       throw new AppError(
  //         httpStatus.FORBIDDEN,
  //         'Your vendor account is not approved yet. Please wait for admin approval.',
  //       );
  //     }

  //     const activeSubscription = await UserSubscriptionModel.findOne({
  //       user: user._id,
  //       status: 'ACTIVE',
  //       renewsAt: { $gte: new Date() },
  //     }).populate('plan');

  //     const FREE_ADS_LIMIT = 5;
  //     const planAdsLimit =
  //       activeSubscription &&
  //       (activeSubscription.plan as { adsLimit?: number } | null)?.adsLimit !==
  //         undefined
  //         ? Number((activeSubscription.plan as { adsLimit?: number }).adsLimit)
  //         : null;

  //     const allowedLimit =
  //       typeof planAdsLimit === 'number'
  //         ? planAdsLimit + FREE_ADS_LIMIT
  //         : FREE_ADS_LIMIT;

  //     const usedListings = Number(vendor.cycleListingsUsed ?? 0);

  //     // If allowedLimit is 0, treat it as unlimited.
  //     if (allowedLimit > 0 && usedListings >= allowedLimit) {
  //       throw new AppError(
  //         httpStatus.FORBIDDEN,
  //         allowedLimit === FREE_ADS_LIMIT
  //           ? 'You have reached the free limit of 5 ads. Please upgrade your subscription to post more.'
  //           : 'You have reached your subscription ads limit. Please upgrade your plan to post more.',
  //       );
  //     }
  //   }
  // }

  const categoryId = payload.categoryId as string | undefined;
  // const subCategoryId = payload.subCategoryId as string | undefined;

  // if (!subCategoryId || !Types.ObjectId.isValid(subCategoryId)) {
  //   throw new AppError(httpStatus.BAD_REQUEST, 'Invalid subCategoryId!');
  // }

  const imageUrls: string[] = [];
  const multerFiles = Array.isArray(imageFiles)
    ? (imageFiles as Express.Multer.File[])
    : [];

  // if (user.role === ROLE.VENDOR) {
  if (multerFiles.length < 3 || multerFiles.length > 5) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please upload a minimum of 3 and a maximum of 5 images.',
    );
  }
  // }

  for (const file of multerFiles) {
    const uploaded = await sendImageToCloudinary(file);
    if (uploaded?.secure_url) {
      imageUrls.push(uploaded.secure_url);
    }
  }

  const created = await AdModel.create({
    user: user._id,
    categoryId: new Types.ObjectId(categoryId),
    // subCategoryId: new Types.ObjectId(subCategoryId),

    condition: payload.condition,
    title: payload.title,
    description: payload.description,
    price: payload.price,
    negotiable: Boolean(payload.negotiable),
    location: payload.location,
    contactName: payload.contactName,
    contactPhone: payload.contactPhone,
    contactEmail: payload.contactEmail,
    images: imageUrls,
    status: isAdminUser(user) ? 'ACTIVE' : 'PENDING',
  });

  // Increment listingsUsed for Vendors
  if (!isAdminUser(user)) {
    await VendorModel.findOneAndUpdate(
      { user: user._id },
      { $inc: { listingsUsed: 1, cycleListingsUsed: 1 } },
    );
  }

  return created;
};

// updateAdInDB
const updateAdInDB = async (
  user: IUser,
  id: string,
  payload: Record<string, unknown>,
) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid ad id!');
  }

  const ad = await AdModel.findById(id);
  if (!ad) {
    throw new AppError(httpStatus.NOT_FOUND, 'Ad not found!');
  }

  if (!isAdminUser(user) && String(ad.user) !== String(user._id)) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'You have no access to this ad!',
    );
  }

  const payloadToUpdate: Record<string, unknown> = { ...payload };
  delete payloadToUpdate.status;
  delete payloadToUpdate.rejectReason;
  delete payloadToUpdate.rejectNote;

  if (!isAdminUser(user)) {
    const majorFields = [
      'categoryId',
      'subCategoryId',
      'condition',
      'title',
      'description',
      'price',
      'negotiable',
      'location',
    ] as const;

    const hasMajorChange = majorFields.some((field) => {
      if (!Object.prototype.hasOwnProperty.call(payloadToUpdate, field)) {
        return false;
      }

      const nextValue = payloadToUpdate[field];
      const currentValue = (ad as unknown as Record<string, unknown>)[field];

      // if (field === 'categoryId' || field === 'subCategoryId') {
      //   return String(nextValue) !== String(currentValue);
      // }

      if (field === 'categoryId') {
        return String(nextValue) !== String(currentValue);
      }

      if (field === 'price') {
        return Number(nextValue) !== Number(currentValue);
      }

      if (field === 'negotiable') {
        return Boolean(nextValue) !== Boolean(currentValue);
      }

      return String(nextValue ?? '') !== String(currentValue ?? '');
    });

    if (hasMajorChange) {
      payloadToUpdate.status = 'PENDING';
      payloadToUpdate.rejectReason = null;
      payloadToUpdate.rejectNote = null;
    }
  }

  const updated = await AdModel.findByIdAndUpdate(id, payloadToUpdate, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    throw new AppError(httpStatus.NOT_FOUND, 'Ad not found!');
  }

  return updated;
};

// trackAdViewInDB
const trackAdViewInDB = async (id: string, _ip?: string) => {
  void _ip;
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid ad id!');
  }

  const updated = await AdModel.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true },
  );

  if (!updated) {
    throw new AppError(httpStatus.NOT_FOUND, 'Ad not found!');
  }

  return { views: updated.views };
};

// deleteAdFromDB
const deleteAdFromDB = async (user: IUser, id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid ad id!');
  }

  const ad = await AdModel.findById(id);
  if (!ad) {
    throw new AppError(httpStatus.NOT_FOUND, 'Ad not found!');
  }

  if (!isAdminUser(user) && String(ad.user) !== String(user._id)) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'You have no access to this ad!',
    );
  }

  const updated = await AdModel.findByIdAndUpdate(
    id,
    { status: 'ARCHIVED' },
    { new: true },
  );

  return updated;
};

// approveAdInDB
const approveAdInDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid ad id!');
  }

  const updated = await AdModel.findByIdAndUpdate(
    id,
    { status: 'ACTIVE' },
    { new: true },
  );

  if (!updated) {
    throw new AppError(httpStatus.NOT_FOUND, 'Ad not found!');
  }

  return updated;
};

// rejectAdInDB
const rejectAdInDB = async (id: string, payload?: Record<string, unknown>) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid ad id!');
  }

  const rejectReason = payload?.reason as string | undefined;
  const rejectNote = payload?.note as string | undefined;

  const updatedFromPending = await AdModel.findOneAndUpdate(
    { _id: id, status: 'PENDING' },
    {
      status: 'REJECTED',
      rejectReason: rejectReason ?? null,
      rejectNote: rejectNote ?? null,
    },
    { new: true },
  );

  if (updatedFromPending) {
    await VendorModel.findOneAndUpdate({ user: updatedFromPending.user }, [
      {
        $set: {
          listingsUsed: {
            $cond: [
              { $gt: ['$listingsUsed', 0] },
              { $subtract: ['$listingsUsed', 1] },
              0,
            ],
          },
        },
      },
    ]);

    return updatedFromPending;
  }

  const updated = await AdModel.findByIdAndUpdate(
    id,
    {
      status: 'REJECTED',
      rejectReason: rejectReason ?? null,
      rejectNote: rejectNote ?? null,
    },
    { new: true },
  );

  if (!updated) {
    throw new AppError(httpStatus.NOT_FOUND, 'Ad not found!');
  }

  return updated;
};

// expireAdInDB
const expireAdInDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid ad id!');
  }

  const updated = await AdModel.findByIdAndUpdate(
    id,
    { status: 'EXPIRED' },
    { new: true },
  );

  if (!updated) {
    throw new AppError(httpStatus.NOT_FOUND, 'Ad not found!');
  }

  return updated;
};

// boostAdInDB
const boostAdInDB = async (
  user: IUser,
  id: string,
  payload: Record<string, unknown>,
) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid ad id!');
  }

  const ad = await AdModel.findById(id);
  if (!ad) {
    throw new AppError(httpStatus.NOT_FOUND, 'Ad not found!');
  }

  if (!isAdminUser(user) && String(ad.user) !== String(user._id)) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'You have no access to this ad!',
    );
  }

  const type = (payload.type as string | undefined)?.toUpperCase();
  const update: Record<string, unknown> = {};
  if (type === 'FEATURED') update.isFeatured = true;
  if (type === 'URGENT') update.isUrgent = true;

  const updated = await AdModel.findByIdAndUpdate(id, update, { new: true });

  return updated;
};

// reportAdInDB
const reportAdInDB = async (
  id: string,
  payload: Record<string, unknown>,
  user?: IUser,
) => {
  const adId = id;

  if (!Types.ObjectId.isValid(adId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid ad id!');
  }

  const ad = await AdModel.findById(adId).select('_id').lean();
  if (!ad) {
    throw new AppError(httpStatus.NOT_FOUND, 'Ad not found!');
  }

  const reporterId = user?._id ? new Types.ObjectId(user._id) : null;

  const created = await AdReportModel.create({
    ad: ad._id,
    reporter: reporterId,
    reason: payload.reason,
    details: payload.details ?? null,
  });

  return created;
};

// addFavouriteInDB
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

  if (existing) return existing;

  const created = await FavouriteModel.create({ user: user._id, ad: ad._id });
  return created;
};

// removeFavouriteFromDB
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

// adminGetAllAdsFromDB
const adminGetAllAdsFromDB = async (query: Record<string, unknown>) => {
  const {
    status,
    categoryId,
    location,
    searchTerm,
    page = 1,
    limit = 20,
  } = query as {
    status?: string;
    categoryId?: string;
    location?: string;
    searchTerm?: string;
    page?: string | number;
    limit?: string | number;
  };

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status.toUpperCase();
  if (categoryId && Types.ObjectId.isValid(categoryId)) {
    filter.categoryId = new Types.ObjectId(categoryId);
  }
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (searchTerm) {
    filter.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    AdModel.find(filter)
      .populate('user')
      .populate('categoryId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    AdModel.countDocuments(filter),
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

// adminGetSummaryFromDB
const adminGetSummaryFromDB = async () => {
  const [pending, approved, rejected, expired] = await Promise.all([
    AdModel.countDocuments({ status: 'PENDING' }),
    AdModel.countDocuments({ status: 'ACTIVE' }),
    AdModel.countDocuments({ status: 'REJECTED' }),
    AdModel.countDocuments({ status: 'EXPIRED' }),
  ]);

  return {
    pending,
    approved,
    rejected,
    expired,
  };
};

// adminListReportsFromDB
const adminListReportsFromDB = async (query: Record<string, unknown>) => {
  const {
    resolved,
    page = 1,
    limit = 20,
  } = query as {
    resolved?: string | boolean;
    page?: string | number;
    limit?: string | number;
  };

  const filter: Record<string, unknown> = {};
  if (typeof resolved !== 'undefined') {
    const resolvedBool =
      typeof resolved === 'boolean'
        ? resolved
        : String(resolved).toLowerCase() === 'true';
    filter.resolved = resolvedBool;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    AdReportModel.find(filter)
      .populate('ad')
      .populate('reporter')
      .populate('resolvedBy')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    AdReportModel.countDocuments(filter),
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

// adminResolveReportInDB
const adminResolveReportInDB = async (admin: IUser, reportId: string) => {
  if (!Types.ObjectId.isValid(reportId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid report id!');
  }

  const updated = await AdReportModel.findByIdAndUpdate(
    reportId,
    {
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy: admin._id,
    },
    { new: true },
  );

  if (!updated) {
    throw new AppError(httpStatus.NOT_FOUND, 'Report not found!');
  }

  return updated;
};

export const AdService = {
  getAllAdsFromDB,
  getLatestAdsFromDB,
  getTopAdsFromDB,
  getFeaturedAdsFromDB,
  getMyAdsFromDB,
  getAdByIdFromDB,

  createAdInDB,
  updateAdInDB,
  trackAdViewInDB,
  deleteAdFromDB,

  approveAdInDB,
  rejectAdInDB,

  expireAdInDB,
  boostAdInDB,
  reportAdInDB,
  addFavouriteInDB,
  removeFavouriteFromDB,

  adminGetAllAdsFromDB,
  adminGetSummaryFromDB,
  adminListReportsFromDB,
  adminResolveReportInDB,
};
