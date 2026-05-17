import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { ContactValidation } from './contact.validation';
import { ContactController } from './contact.controller';

const router = Router();

// adminGetAllContacts
router.get(
  '/',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  ContactController.adminGetAllContacts,
);

// createContact
router.post(
  '/',
  validateRequest(ContactValidation.createContactValidation),
  ContactController.createContact,
);

// adminSendEmailToUser
router.post(
  '/send-email',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(ContactValidation.sendEmailValidation),
  ContactController.adminSendEmailToUser,
);

export const ContactRoutes = router;
