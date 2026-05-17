import { asyncHandler, sendResponse } from '../../utils';
import { ContactService } from './contact.service';
import httpStatus from 'http-status';

// adminGetAllContacts
const adminGetAllContacts = asyncHandler(async (req, res) => {
  const result = await ContactService.adminGetAllContactsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Contacts fetched successfully!',
    data: result.data,
    meta: result.meta,
  });
});

// createContact
const createContact = asyncHandler(async (req, res) => {
  const result = await ContactService.createContactInDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Message created successfully!',
    data: result,
  });
});

// adminSendEmailToUser
const adminSendEmailToUser = asyncHandler(async (req, res) => {
  const result = await ContactService.adminSendEmailToUserFromDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Email sent successfully!',
    data: result,
  });
});

export const ContactController = {
  adminGetAllContacts,
  createContact,
  adminSendEmailToUser,
};
