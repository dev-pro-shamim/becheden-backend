import { Router } from 'express';
import { UserRoutes } from '../modules/User/user.route';
import { CategoryRoutes } from '../modules/Category/category.routes';
import { PageRoutes } from '../modules/Page/page.route';
import { AdminRoutes } from '../modules/Admin/admin.routes';
import { ContactRoutes } from '../modules/Contact/contact.routes';
import { VendorRoutes } from '../modules/Vendor/vendor.routes';
import { AdRoutes } from '../modules/Ad/ad.routes';
import { AlertRoutes } from '../modules/Alert/alert.routes';
import { FavouriteRoutes } from '../modules/Favourite/favourite.routes';
import { LotteryRoutes } from '../modules/Lottery/lottery.routes';
import { SubscriptionRoutes } from '../modules/Subscription/subscription.routes';
import { PaymentRoutes } from '../modules/Payment/payment.routes';
import { ChatRoutes } from '../modules/Chat/chat.routes';
import { ExtraDataRoutes } from '../modules/ExtraData/extraData.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
  {
    path: '/contact',
    route: ContactRoutes,
  },
  {
    path: '/category',
    route: CategoryRoutes,
  },
  {
    path: '/vendor',
    route: VendorRoutes,
  },
  {
    path: '/page',
    route: PageRoutes,
  },
  {
    path: '/ad',
    route: AdRoutes,
  },
  {
    path: '/alert',
    route: AlertRoutes,
  },
  {
    path: '/favourite',
    route: FavouriteRoutes,
  },
  {
    path: '/lottery',
    route: LotteryRoutes,
  },
  {
    path: '/subscription',
    route: SubscriptionRoutes,
  },
  {
    path: '/payment',
    route: PaymentRoutes,
  },
  {
    path: '/chat',
    route: ChatRoutes,
  },
  {
    path: '/extra-data',
    route: ExtraDataRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
