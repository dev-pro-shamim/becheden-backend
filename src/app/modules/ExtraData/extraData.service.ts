import httpStatus from 'http-status';
import { AppError } from '../../utils';
import { ExtraDataModel } from './extraData.model';
import { deleteImageFromCloudinary, sendImageToCloudinary } from '../../lib';

// updateExtraDataImageInDB
const updateExtraDataImageInDB = async (
  imageKeyRaw: string,
  file: Express.Multer.File | undefined,
) => {
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Image file is required!');
  }

  const uploaded = await sendImageToCloudinary(file);

  const payload: {
    adImage1?: string | null;
    adImage2?: string | null;
    adImage3?: string | null;
    adImage4?: string | null;
    adImage5?: string | null;
    adImage6?: string | null;
    adImage7?: string | null;
  } = {};

  if (imageKeyRaw === 'adImage1') {
    payload.adImage1 = uploaded.secure_url;
  }
  if (imageKeyRaw === 'adImage2') {
    payload.adImage2 = uploaded.secure_url;
  }
  if (imageKeyRaw === 'adImage3') {
    payload.adImage3 = uploaded.secure_url;
  }
  if (imageKeyRaw === 'adImage4') {
    payload.adImage4 = uploaded.secure_url;
  }
  if (imageKeyRaw === 'adImage5') {
    payload.adImage5 = uploaded.secure_url;
  }
  if (imageKeyRaw === 'adImage6') {
    payload.adImage6 = uploaded.secure_url;
  }
  if (imageKeyRaw === 'adImage7') {
    payload.adImage7 = uploaded.secure_url;
  }

  const updated = await ExtraDataModel.findOneAndUpdate(
    {},
    { ...payload },
    { new: true, upsert: true, runValidators: true },
  ).select(
    'adImage1 adImage2 adImage3 adImage4 adImage5 adImage6 adImage7 -_id',
  );

  if (!updated) {
    await deleteImageFromCloudinary(uploaded.secure_url);
    throw new AppError(httpStatus.NOT_MODIFIED, 'Extra data not updated!');
  }

  return updated;
};

// updateExtraDataLinkInDB
const updateExtraDataLinkInDB = async (linkKey: string, link: string) => {
  const payload: {
    link1?: string | null;
    link2?: string | null;
  } = {};

  if (linkKey === 'link1') {
    payload.link1 = link;
  } else if (linkKey === 'link2') {
    payload.link2 = link;
  } else {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid linkKey!');
  }

  const updated = await ExtraDataModel.findOneAndUpdate(
    {},
    { ...payload },
    { new: true, upsert: true, runValidators: true },
  ).select('link1 link2 -_id');

  if (!updated) {
    throw new AppError(httpStatus.NOT_MODIFIED, 'Extra data not updated!');
  }

  return updated;
};

// updateExtraDataHeadingInDB
const updateExtraDataHeadingInDB = async (heading: string[]) => {
  const updated = await ExtraDataModel.findOneAndUpdate(
    {},
    { heading },
    { new: true, upsert: true, runValidators: true },
  ).select('heading -_id');

  if (!updated) {
    throw new AppError(httpStatus.NOT_MODIFIED, 'Extra data not updated!');
  }

  return updated;
};

const getExtraDataFromDB = async () => {
  const doc = await ExtraDataModel.findOne({}).select(
    'adImage1 adImage2 adImage3 adImage4 adImage5 adImage6 adImage7 link1 link2 heading -_id',
  );

  if (!doc) {
    return {
      adImage1: null,
      adImage2: null,
      adImage3: null,
      adImage4: null,
      adImage5: null,
      adImage6: null,
      adImage7: null,
      link1: null,
      link2: null,
      heading: null,
    };
  }

  return doc;
};

export const ExtraDataService = {
  updateExtraDataImageInDB,
  updateExtraDataLinkInDB,
  updateExtraDataHeadingInDB,
  getExtraDataFromDB,
};
