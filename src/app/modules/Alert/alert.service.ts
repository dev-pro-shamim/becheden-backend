import httpStatus from 'http-status';
import { AppError } from '../../utils';
import { Types } from 'mongoose';
import { IUser } from '../User/user.interface';
import { AlertModel, SavedSearchModel } from './alert.model';
import { TAlertFrequency } from './alert.interface';

const createAlertInDB = async (
  user: IUser,
  payload: {
    title: string;
    filters: Record<string, unknown>;
    frequency: TAlertFrequency;
  }
) => {
  const created = await AlertModel.create({
    user: user._id,
    title: payload.title,
    filters: payload.filters,
    frequency: payload.frequency,
    paused: false,
  });

  return created;
};

const listMyAlertsFromDB = async (user: IUser) => {
  const data = await AlertModel.find({ user: user._id }).sort({
    createdAt: -1,
  });
  return data;
};

const updateAlertInDB = async (
  user: IUser,
  id: string,
  payload: Partial<{ paused: boolean; frequency: TAlertFrequency }>
) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid alert id!');
  }

  const updated = await AlertModel.findOneAndUpdate(
    { _id: new Types.ObjectId(id), user: user._id },
    payload,
    { new: true, runValidators: true }
  );

  if (!updated) {
    throw new AppError(httpStatus.NOT_FOUND, 'Alert not found!');
  }

  return updated;
};

const deleteAlertFromDB = async (user: IUser, id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid alert id!');
  }

  const deleted = await AlertModel.findOneAndDelete({
    _id: new Types.ObjectId(id),
    user: user._id,
  });

  if (!deleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Alert not found!');
  }

  return deleted;
};

const createSavedSearchInDB = async (
  user: IUser,
  payload: Record<string, unknown>
) => {
  const created = await SavedSearchModel.create({
    user: user._id,
    payload,
  });

  return created;
};

const listMySavedSearchesFromDB = async (user: IUser) => {
  const data = await SavedSearchModel.find({ user: user._id }).sort({
    createdAt: -1,
  });
  return data;
};

const deleteSavedSearchFromDB = async (user: IUser, id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid saved search id!');
  }

  const deleted = await SavedSearchModel.findOneAndDelete({
    _id: new Types.ObjectId(id),
    user: user._id,
  });

  if (!deleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Saved search not found!');
  }

  return deleted;
};

export const AlertService = {
  createAlertInDB,
  listMyAlertsFromDB,
  updateAlertInDB,
  deleteAlertFromDB,
  createSavedSearchInDB,
  listMySavedSearchesFromDB,
  deleteSavedSearchFromDB,
};
