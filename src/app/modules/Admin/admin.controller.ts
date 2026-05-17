import { asyncHandler, sendResponse } from '../../utils';
import { AdminService } from './admin.service';
import httpStatus from 'http-status';

// getAllAdmins
const getAllAdmins = asyncHandler(async (req, res) => {
  const result = await AdminService.getAllAdminsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Admins fetched successfully!',
    data: result,
  });
});

// createAdmin
const createAdmin = asyncHandler(async (req, res) => {
  const result = await AdminService.createAdminInDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Admin created successfully!',
    data: result,
  });
});

// updateAdmin
const updateAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await AdminService.updateAdminInDB(req.body, id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Admin updated successfully!',
    data: result,
  });
});

// superAdminDeleteAdmin
const superAdminDeleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await AdminService.superAdminDeleteAdminFromDB(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Admin deleted successfully!',
    data: result,
  });
});

// getDashboardStats
const getDashboardStats = asyncHandler(async (req, res) => {
  const result = await AdminService.getDashboardStatsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Dashboard stats retrieved successfully!',
    data: result,
  });
});

const toggleUserBlock = asyncHandler(async (req, res) => {
  const result = await AdminService.toggleUserBlockInDB(
    req.user,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User status updated successfully!',
    data: result,
  });
});

export const AdminController = {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  superAdminDeleteAdmin,
  getDashboardStats,
  toggleUserBlock,
};
