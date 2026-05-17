import httpStatus from 'http-status';
import type { Express } from 'express';
import { FilterQuery, Types } from 'mongoose';
import { AppError } from '../../utils';
import { IMeta } from '../../types';
import { sendImageToCloudinary } from '../../lib';
import VendorModel from './vendor.model';
import { VENDOR_STATUS } from './vendor.constant';
import { IVendor } from './vendor.interface';
import UserModel from '../User/user.model';
import { AdModel } from '../Ad/ad.model';

export type VendorFileMap = Partial<
  Record<'storeImage' | 'tradeLicense', Express.Multer.File[]>
>;

export type VendorAssetPayload = Partial<
  Record<'storeImageUrl' | 'tradeLicenseUrl', string>
>;

const vendorStatuses = Object.values(VENDOR_STATUS) as IVendor['status'][];

const getSingleFile = (
  files: VendorFileMap | undefined,
  field: keyof VendorFileMap
) => {
  const fileList = files?.[field];
  if (!fileList || fileList.length === 0) {
    return undefined;
  }

  return fileList[0];
};

const castObjectId = (value?: string | null) => {
  if (!value) {
    return null;
  }

  if (!Types.ObjectId.isValid(value)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid identifier provided');
  }

  return new Types.ObjectId(value);
};

// const registerVendorInDB = async (
//   userId: Types.ObjectId,
//   payload: {
//     storeName: string;
//     storeLocation: string;
//     tradeLicenseNumber: string;
//   },
//   files?: VendorFileMap,
//   assets?: VendorAssetPayload
// ) => {
//   const existingVendor = await VendorModel.findOne({ user: userId });

//   if (existingVendor) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'Vendor profile already exists!'
//     );
//   }

//   const trimmedStoreName = payload.storeName.trim();
//   const trimmedStoreLocation = payload.storeLocation.trim();
//   const trimmedTradeLicenseNumber = payload.tradeLicenseNumber.trim();

//   if (!trimmedStoreName) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Store name is required');
//   }

//   if (!trimmedStoreLocation) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Store location is required');
//   }

//   if (!trimmedTradeLicenseNumber) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'Trade license number is required'
//     );
//   }

//   let storeImageUrl = assets?.storeImageUrl ?? null;
//   let tradeLicenseUrl = assets?.tradeLicenseUrl ?? null;

//   const storeImageFile = !storeImageUrl
//     ? getSingleFile(files, 'storeImage')
//     : undefined;
//   const tradeLicenseFile = !tradeLicenseUrl
//     ? getSingleFile(files, 'tradeLicense')
//     : undefined;

//   if (!storeImageUrl && !storeImageFile) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Store image is required');
//   }

//   if (!tradeLicenseUrl && !tradeLicenseFile) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'Trade license document is required'
//     );
//   }

//   if (storeImageFile) {
//     const upload = await sendImageToCloudinary(storeImageFile);
//     storeImageUrl = upload.secure_url;
//   }

//   if (tradeLicenseFile) {
//     const upload = await sendImageToCloudinary(tradeLicenseFile);
//     tradeLicenseUrl = upload.secure_url;
//   }

//   if (!storeImageUrl || !tradeLicenseUrl) {
//     throw new AppError(
//       httpStatus.INTERNAL_SERVER_ERROR,
//       'Failed to upload vendor documents'
//     );
//   }

//   const vendor = await VendorModel.create({
//     user: userId,
//     storeName: trimmedStoreName,
//     storeLocation: trimmedStoreLocation,
//     tradeLicense: tradeLicenseUrl,
//     tradeLicenseNumber: trimmedTradeLicenseNumber,
//     storeImage: storeImageUrl,
//     status: VENDOR_STATUS.PENDING,
//     blocked: false,
//     listingsUsed: 0,
//   });

//   return vendor;
// };

const updateVendorProfileInDB = async (
  userId: Types.ObjectId,
  payload: {
    storeName?: string;
    storeLocation?: string;
    tradeLicenseNumber?: string;
    resubmitForReview?: boolean | string;
  },
  files?: VendorFileMap
) => {
  const vendor = await VendorModel.findOne({ user: userId });

  if (!vendor) {
    throw new AppError(httpStatus.NOT_FOUND, 'Vendor profile not found!');
  }

  if (typeof payload.storeName === 'string') {
    const trimmed = payload.storeName.trim();

    if (!trimmed) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Store name cannot be empty');
    }

    vendor.storeName = trimmed;
  }
  if (typeof payload.storeLocation === 'string') {
    const trimmed = payload.storeLocation.trim();

    if (!trimmed) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Store location cannot be empty'
      );
    }

    vendor.storeLocation = trimmed;
  }

  if (typeof payload.tradeLicenseNumber === 'string') {
    const trimmed = payload.tradeLicenseNumber.trim();

    if (!trimmed) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Trade license number cannot be empty'
      );
    }

    vendor.tradeLicenseNumber = trimmed;
  }

  const storeImageFile = getSingleFile(files, 'storeImage');
  if (storeImageFile) {
    const upload = await sendImageToCloudinary(storeImageFile);

    if (!upload.secure_url) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to upload store image'
      );
    }

    vendor.storeImage = upload.secure_url;
  }

  const tradeLicenseFile = getSingleFile(files, 'tradeLicense');
  if (tradeLicenseFile) {
    const upload = await sendImageToCloudinary(tradeLicenseFile);

    if (!upload.secure_url) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to upload trade license document'
      );
    }

    vendor.tradeLicense = upload.secure_url;
  }

  if (!vendor.storeName || !vendor.storeLocation) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Vendor profile missing essential store information'
    );
  }
  if (!vendor.tradeLicense || !vendor.tradeLicenseNumber) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Vendor profile missing required documents'
    );
  }

  const resubmitForReview =
    typeof payload.resubmitForReview === 'string'
      ? payload.resubmitForReview.toLowerCase() === 'true'
      : payload.resubmitForReview;

  if (resubmitForReview) {
    vendor.status = VENDOR_STATUS.PENDING;
    vendor.approvalNote = null;
    vendor.approvedAt = null;
    vendor.approvedBy = null;
  }

  await vendor.save();

  return vendor;
};

const getMyVendorProfileFromDB = async (userId: Types.ObjectId) => {
  const vendor = await VendorModel.findOne({ user: userId }).populate(
    'currentPlanId'
  );

  if (!vendor) {
    throw new AppError(httpStatus.NOT_FOUND, 'Vendor profile not found!');
  }

  return vendor;
};

const getMyUsageFromDB = async (userId: Types.ObjectId) => {
  const vendor = await VendorModel.findOne({ user: userId }).populate(
    'currentPlanId'
  );

  if (!vendor) {
    throw new AppError(httpStatus.NOT_FOUND, 'Vendor profile not found!');
  }

  return {
    status: vendor.status,
    blocked: vendor.blocked,
    listingsUsed: vendor.listingsUsed,
    planExpiresAt: vendor.planExpiresAt,
    currentPlan: vendor.currentPlanId,
  };
};

const adminGetVendorsFromDB = async (query: Record<string, unknown>) => {
  const {
    status,
    blocked,
    searchTerm,
    planId,
    page = 1,
    limit = 10,
  } = query as Record<string, string>;

  const filter: FilterQuery<IVendor> = {};

  if (status) {
    if (!vendorStatuses.includes(status as IVendor['status'])) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid vendor status');
    }

    filter.status = status as IVendor['status'];
  }

  if (typeof blocked !== 'undefined') {
    if (blocked === 'true') filter.blocked = true;
    if (blocked === 'false') filter.blocked = false;
  }

  if (planId) {
    filter.currentPlanId = castObjectId(planId);
  }

  if (searchTerm) {
    filter.$or = [
      { storeName: { $regex: searchTerm, $options: 'i' } },
      { storeLocation: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const [vendors, total] = await Promise.all([
    VendorModel.find(filter)
      .populate('user', 'name email phone role')
      .populate('approvedBy', 'name email')
      .populate('blockedBy', 'name email')
      .populate('currentPlanId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber),
    VendorModel.countDocuments(filter),
  ]);

  const meta: IMeta = {
    page: pageNumber,
    limit: limitNumber,
    total,
    totalPage: Math.ceil(total / limitNumber) || 0,
  };

  return { data: vendors, meta };
};

const approveVendorInDB = async (
  vendorId: string,
  adminId: Types.ObjectId,
  payload: {
    note?: string;
    assignedPlanId?: string;
    planExpiresAt?: string;
    resetListings?: boolean;
  }
) => {
  const vendor = await VendorModel.findById(vendorId);

  if (!vendor) {
    throw new AppError(httpStatus.NOT_FOUND, 'Vendor not found!');
  }

  vendor.status = VENDOR_STATUS.APPROVED;
  vendor.approvalNote = payload.note ?? null;
  vendor.approvedAt = new Date();
  vendor.approvedBy = adminId;

  if (payload.assignedPlanId) {
    vendor.currentPlanId = castObjectId(payload.assignedPlanId);
  }

  if (payload.planExpiresAt) {
    vendor.planExpiresAt = new Date(payload.planExpiresAt);
  }

  if (payload.resetListings) {
    vendor.listingsUsed = 0;
  }

  await vendor.save();

  return vendor;
};

const rejectVendorInDB = async (
  vendorId: string,
  adminId: Types.ObjectId,
  payload: { reason: string }
) => {
  const vendor = await VendorModel.findById(vendorId);

  if (!vendor) {
    throw new AppError(httpStatus.NOT_FOUND, 'Vendor not found!');
  }

  vendor.status = VENDOR_STATUS.REJECTED;
  vendor.approvalNote = payload.reason;
  vendor.approvedAt = null;
  vendor.approvedBy = adminId;

  await vendor.save();

  return vendor;
};

const blockVendorInDB = async (
  vendorId: string,
  adminId: Types.ObjectId,
  payload: { reason?: string }
) => {
  const vendor = await VendorModel.findById(vendorId);

  if (!vendor) {
    throw new AppError(httpStatus.NOT_FOUND, 'Vendor not found!');
  }

  vendor.blocked = true;
  vendor.blockedAt = new Date();
  vendor.blockedBy = adminId;
  vendor.blockReason = payload.reason ?? null;

  await vendor.save();

  return vendor;
};

const unblockVendorInDB = async (vendorId: string, adminId: Types.ObjectId) => {
  const vendor = await VendorModel.findById(vendorId);

  if (!vendor) {
    throw new AppError(httpStatus.NOT_FOUND, 'Vendor not found!');
  }

  vendor.blocked = false;
  vendor.blockedAt = null;
  vendor.blockedBy = adminId;
  vendor.blockReason = null;

  await vendor.save();

  return vendor;
};

const deleteVendorInDB = async (vendorId: string, adminId: Types.ObjectId) => {
  if (!Types.ObjectId.isValid(vendorId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid vendor id!');
  }

  const vendor = await VendorModel.findById(vendorId);

  if (!vendor) {
    throw new AppError(httpStatus.NOT_FOUND, 'Vendor not found!');
  }

  if (String(vendor.user) === String(adminId)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You cannot delete your own vendor account!',
    );
  }

  const [deletedVendor, deletedUser] = await Promise.all([
    VendorModel.findByIdAndDelete(vendor._id),
    UserModel.findByIdAndUpdate(
      vendor.user,
      {
        isDeleted: true,
        isActive: false,
        deactivationReason: 'Deleted by admin',
      },
      { new: true, select: 'name email role isDeleted' },
    ),
    AdModel.updateMany({ user: vendor.user }, { status: 'ARCHIVED' }),
  ]);

  return {
    vendor: deletedVendor,
    user: deletedUser,
  };
};

export const VendorService = {
  // registerVendorInDB,
  updateVendorProfileInDB,
  getMyVendorProfileFromDB,
  getMyUsageFromDB,
  adminGetVendorsFromDB,
  approveVendorInDB,
  rejectVendorInDB,
  blockVendorInDB,
  unblockVendorInDB,
  deleteVendorInDB,
};
