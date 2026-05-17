import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { Router } from 'express';
import { pageZodValidation } from './page.validation';
import { PageController } from './page.controller';

const router = Router();

// createPageOrUpdate
router.put(
  '/create-or-update',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(pageZodValidation.createOrUpdatePageSchema),
  PageController.createPageOrUpdate
);

// getAllPage
router.get('/retrieve', PageController.getAllPage);

// getPageByType
router.get('/retrieve/:type', PageController.getPageByType);

export const PageRoutes = router;
