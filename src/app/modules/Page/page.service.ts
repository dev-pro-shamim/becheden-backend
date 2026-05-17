import { IPagePayload } from './page.interface';
import { Page } from './page.model';

const createOrUpdatePage = async (payload: IPagePayload) => {
  const result = await Page.findOneAndUpdate({ type: payload.type }, payload, {
    upsert: true,
    new: true,
  });

  return result;
};

const getPageByType = async (type: string) => {
  const result = await Page.findOne({ type });

  return result;
};

const getAllPage = async () => {
  const result = await Page.find();

  return result;
};

export const PageService = {
  createOrUpdatePage,
  getPageByType,
  getAllPage,
};
