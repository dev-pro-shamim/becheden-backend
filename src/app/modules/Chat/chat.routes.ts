import { Router } from 'express';
import { auth } from '../../middlewares';
import { multerUpload } from '../../lib';
import { ROLE } from '../User/user.constant';
import { ChatController } from './chat.controller';

const router = Router();

router.post(
  '/attachment/image',
  auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  multerUpload.single('image'),
  ChatController.uploadImageAttachment,
);

export const ChatRoutes = router;
