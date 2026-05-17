import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { asyncHandler, sendResponse } from '../../utils';
import { VendorService, VendorFileMap } from './vendor.service';

// const registerVendor = asyncHandler(async (req, res) => {
//   const userId = new Types.ObjectId(req.user._id);
//   const files = req.files as VendorFileMap | undefined;

//   const result = await VendorService.registerVendorInDB(
//     userId,
//     req.body,
//     files
//   );

//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     message: 'Vendor profile submitted for review!',
//     data: result,
//   });
// });

const updateVendorProfile = asyncHandler(async (req, res) => {
  const userId = new Types.ObjectId(req.user._id);
  const files = req.files as VendorFileMap | undefined;

  const result = await VendorService.updateVendorProfileInDB(
    userId,
    req.body,
    files
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Vendor profile updated successfully!',
    data: result,
  });
});

const getMyVendorProfile = asyncHandler(async (req, res) => {
  const userId = new Types.ObjectId(req.user._id);
  const result = await VendorService.getMyVendorProfileFromDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Vendor profile retrieved successfully!',
    data: result,
  });
});

const getMyUsage = asyncHandler(async (req, res) => {
  const userId = new Types.ObjectId(req.user._id);
  const result = await VendorService.getMyUsageFromDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Vendor usage data retrieved successfully!',
    data: result,
  });
});

const adminGetVendors = asyncHandler(async (req, res) => {
  const result = await VendorService.adminGetVendorsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Vendors retrieved successfully!',
    data: result.data,
    meta: result.meta,
  });
});

const approveVendor = asyncHandler(async (req, res) => {
  const adminId = new Types.ObjectId(req.user._id);
  const result = await VendorService.approveVendorInDB(
    req.params.id  as string,
    adminId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Vendor approved successfully!',
    data: result,
  });
});

const rejectVendor = asyncHandler(async (req, res) => {
  const adminId = new Types.ObjectId(req.user._id);
  const result = await VendorService.rejectVendorInDB(
    req.params.id  as string,
    adminId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Vendor rejected successfully!',
    data: result,
  });
});

const blockVendor = asyncHandler(async (req, res) => {
  const adminId = new Types.ObjectId(req.user._id);
  const result = await VendorService.blockVendorInDB(
    req.params.id  as string,
    adminId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Vendor blocked successfully!',
    data: result,
  });
});

const unblockVendor = asyncHandler(async (req, res) => {
  const adminId = new Types.ObjectId(req.user._id);
  const result = await VendorService.unblockVendorInDB(req.params.id  as string, adminId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Vendor unblocked successfully!',
    data: result,
  });
});

const deleteVendor = asyncHandler(async (req, res) => {
  const adminId = new Types.ObjectId(req.user._id);
  const result = await VendorService.deleteVendorInDB(
    req.params.id as string,
    adminId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Vendor deleted successfully!',
    data: result,
  });
});

export const VendorController = {
  // registerVendor,
  updateVendorProfile,
  getMyVendorProfile,
  getMyUsage,
  adminGetVendors,
  approveVendor,
  rejectVendor,
  blockVendor,
  unblockVendor,
  deleteVendor,
};
