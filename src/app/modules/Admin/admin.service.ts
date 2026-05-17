import httpStatus from 'http-status';
import { IUser } from '../User/user.interface';
import UserModel from '../User/user.model';
import { AppError } from '../../utils';
import { ROLE } from '../User/user.constant';
import VendorModel from '../Vendor/vendor.model';
import { AdModel } from '../Ad/ad.model';
import { SubscriptionPaymentModel } from '../Payment/payment.model';
// import { defaultUserImage } from '../User/user.constant';

// getAllAdminsFromDB
const getAllAdminsFromDB = async () => {
  const admins = await UserModel.find({ role: ROLE.ADMIN }).select(
    'name email phone role image isActive isDeleted',
  );

  return admins;
};

// createAdminInDB
const createAdminInDB = async (
  adminData: Pick<IUser, 'name' | 'email' | 'password'>,
) => {
  const admin = await UserModel.findOne({
    role: ROLE.ADMIN,
    email: adminData.email,
  });

  if (admin) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Admin already exists!');
  }

  const createdAdmin = await UserModel.create({
    name: adminData.name,
    // address: 'N/A',
    phone: 'N/A',
    // image: defaultUserImage,
    email: adminData.email,
    password: adminData.password,
    otp: '000000',
    otpExpiry: new Date(),
    isVerifiedByOTP: true,
    role: ROLE.ADMIN,
  });

  const result = await UserModel.findById(createdAdmin._id).select(
    'name email role image',
  );

  return result;
};

// updateAdminInDB
const updateAdminInDB = async (
  adminData: Pick<IUser, 'name' | 'phone' | 'email' | 'password'>,
  id: string,
) => {
  const admin = await UserModel.findById(id).select('+password');

  if (!admin) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Admin not found!');
  }

  if (adminData.name) {
    admin.name = adminData.name;
  }
  if (adminData.phone) {
    admin.phone = adminData.phone;
  }

  if (adminData.email) {
    admin.email = adminData.email;
  }

  if (adminData.password) {
    admin.password = adminData.password;
    admin.passwordChangedAt = new Date();
  }

  await admin.save();

  return null;
};

// superAdminDeleteAdminFromDB
const superAdminDeleteAdminFromDB = async (id: string) => {
  const admin = await UserModel.find({ _id: id, role: ROLE.ADMIN });

  if (!admin) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Admin not found!');
  }

  const result = await UserModel.findByIdAndUpdate(id, {
    isDeleted: true,
  }).select('name email role image');

  return result;
};

// getDashboardStatsFromDB
const getDashboardStatsFromDB = async () => {
  const [totalUsers, totalVendors, totalAds, totalSalesData] =
    await Promise.all([
      UserModel.countDocuments({ role: ROLE.BUYER }),
      VendorModel.countDocuments(),
      AdModel.countDocuments({ status: { $ne: 'ARCHIVED' } }),
      SubscriptionPaymentModel.aggregate([
        { $match: { status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

  const totalSales = totalSalesData[0]?.total || 0;

  return {
    totalUsers,
    totalVendors,
    totalAds,
    totalSales,
  };
};

const toggleUserBlockInDB = async (
  adminUser: IUser,
  userId: string,
  payload: { reason?: string },
) => {
  if (!userId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User id is required!');
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  // if (user.role === ROLE.ADMIN || user.role === ROLE.SUPER_ADMIN) {
  //   throw new AppError(
  //     httpStatus.FORBIDDEN,
  //     'You cannot block/unblock an admin user!',
  //   );
  // }

  if (String(user._id) === String(adminUser._id)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You cannot block/unblock your own account!',
    );
  }

  const willBlock = user.isActive;

  user.isActive = !user.isActive;
  user.deactivationReason = willBlock ? (payload?.reason ?? '') : '';

  await user.save();

  const result = await UserModel.findById(user._id).select(
    'name email phone role image isActive isDeleted deactivationReason',
  );

  return result;
};

export const AdminService = {
  getAllAdminsFromDB,
  createAdminInDB,
  updateAdminInDB,
  superAdminDeleteAdminFromDB,
  getDashboardStatsFromDB,
  toggleUserBlockInDB,
};
