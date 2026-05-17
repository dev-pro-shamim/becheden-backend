import ContactModel from './contact.model';
import { IContact } from './contact.interface';
import { AppError } from '../../utils';
import httpStatus from 'http-status';
import { IMeta } from '../../types';
import sendCustomEmail from '../../utils/sendCustomEmail';

// adminGetAllContactsFromDB
const adminGetAllContactsFromDB = async (
  query: Record<string, unknown>,
): Promise<{ data: IContact[]; meta: IMeta }> => {
  const { page, limit } = query;

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const [contacts, total] = await Promise.all([
    ContactModel.find()
      .select('-updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber),
    ContactModel.countDocuments(),
  ]);

  const meta: IMeta = {
    page: pageNumber,
    limit: limitNumber,
    total,
    totalPage: Math.ceil(total / limitNumber) || 0,
  };

  return { data: contacts, meta };
};

// createContactInDB
const createContactInDB = async (contactData: IContact) => {
  const contact = await ContactModel.create(contactData);

  if (!contact) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create message!');
  }

  return null;
};

// adminSendEmailToUserFromDB
const adminSendEmailToUserFromDB = async (payload: {
  email: string;
  subject: string;
  message: string;
}) => {
  await sendCustomEmail({
    email: payload.email,
    subject: payload.subject,
    message: payload.message,
  });

  await ContactModel.findOneAndUpdate(
    { email: payload.email, isReplied: false },
    { isReplied: true },
    { sort: { createdAt: -1 } },
  );

  return null;
};

export const ContactService = {
  adminGetAllContactsFromDB,
  createContactInDB,
  adminSendEmailToUserFromDB,
};
