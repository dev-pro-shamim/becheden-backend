import httpStatus from 'http-status';
import { AppError } from '../../utils';
import LocationModel from './location.model';

const getLocationsFromDB = async (query: Record<string, unknown>) => {
  const { division, searchTerm } = query as {
    division?: string;
    searchTerm?: string;
  };

  const filter: Record<string, unknown> = { isActive: true };

  if (division) {
    filter.division = { $regex: new RegExp(`^${division}$`, 'i') };
  }

  if (searchTerm) {
    filter.$or = [
      { division: { $regex: searchTerm, $options: 'i' } },
      { area: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  const data = await LocationModel.find(filter).sort({ division: 1, area: 1 });
  return data;
};

const adminGetLocationsFromDB = async () => {
  return await LocationModel.find().sort({ division: 1, area: 1 });
};

const createLocationInDB = async (payload: {
  division: string;
  area: string;
  isActive?: boolean;
}) => {
  return await LocationModel.create({
    division: payload.division,
    area: payload.area,
    isActive: payload.isActive ?? true,
  });
};

const updateLocationInDB = async (
  id: string,
  payload: Partial<{ division: string; area: string; isActive: boolean }>
) => {
  const updated = await LocationModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    throw new AppError(httpStatus.NOT_FOUND, 'Location not found!');
  }

  return updated;
};

const deleteLocationFromDB = async (id: string) => {
  const deleted = await LocationModel.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Location not found!');
  }
  return deleted;
};

export const LocationService = {
  getLocationsFromDB,
  adminGetLocationsFromDB,
  createLocationInDB,
  updateLocationInDB,
  deleteLocationFromDB,
};
