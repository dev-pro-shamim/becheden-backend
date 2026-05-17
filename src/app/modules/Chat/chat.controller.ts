import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { ChatService } from './chat.service';

const uploadImageAttachment = asyncHandler(async (req, res) => {
  const result = await ChatService.uploadImageAttachmentIntoDB(req.file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Attachment uploaded successfully!',
    data: result,
  });
});

export const ChatController = {
  uploadImageAttachment,
};
