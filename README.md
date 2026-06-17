# Beche Den APIs

Base URL: `/api/v1`

This README is derived from the **authoritative route registry**: 

- `src/app/routes/index.ts` (mounted at `app.use('/api/v1', routes)` in `src/app.ts`)

---

## Runtime entry points

- **Express app**: `src/app.ts`
  - Mounts all routes at: `app.use('/api/v1', routes)`
- **Server bootstrap**: `src/server.ts`
  - DB connect + `seedSuperAdmin()` + starts HTTP server

---

# Cross-cutting middlewares / helpers

## Auth (`auth(...roles)`)

File: `src/app/middlewares/auth.ts`

- Reads `Authorization: Bearer <accessToken>`
- Validates token via `verifyToken(token, config.jwt.access_secret)`
- Loads user: `UserModel.findById(_id)`
- Enforces:
  - `user.isActive === true`
  - `user.isDeleted === false`
  - `user.isVerifiedByOTP === true`
  - Password-change invalidation: `user.isJWTIssuedBeforePasswordChanged(iat)`
- Role guard:
  - If `requiredRoles` provided and `user.role` not included → 401
- Attaches: `req.user = user`

## Token utilities

File: `src/app/lib/token.ts`

- `createAccessToken(payload)`
- `createRefreshToken({ email })`
- `verifyToken(token, secret)`

## Request validation

Middleware: `validateRequest(zodSchema)` (imported from `src/app/middlewares`)

## Upload

- `multerUpload` from `src/app/lib/upload`
- Used for:
  - User signup (vendor documents)
  - User profile photo
  - Ad images

---

# Route Inventory (authoritative)

Mounted under `/api/v1` from `src/app/routes/index.ts`:

- `/user` → `src/app/modules/User/user.route.ts`
- `/admin` → `src/app/modules/Admin/admin.routes.ts`
- `/contact` → `src/app/modules/Contact/contact.routes.ts`
- `/category` → `src/app/modules/Category/category.routes.ts`
- `/vendor` → `src/app/modules/Vendor/vendor.routes.ts`
- `/page` → `src/app/modules/Page/page.route.ts`
- `/ad` → `src/app/modules/Ad/ad.routes.ts`
- `/location` → `src/app/modules/Location/location.routes.ts`
- `/alert` → `src/app/modules/Alert/alert.routes.ts`
- `/favourite` → `src/app/modules/Favourite/favourite.routes.ts`
- `/lottery` → `src/app/modules/Lottery/lottery.routes.ts`
- `/subscription` → `src/app/modules/Subscription/subscription.routes.ts`
- `/payment` → `src/app/modules/Payment/payment.routes.ts`

---

# Module: User (`/api/v1/user`)

Route: `src/app/modules/User/user.route.ts`

- Controller: `src/app/modules/User/user.controller.ts`
- Service: `src/app/modules/User/user.service.ts`

## End-to-end User Account Flow (Buyer + Vendor)

### Signup → OTP → Verify

1.  `POST /api/v1/user/signup`

- Middleware:
  - `multerUpload.fields([{ name: 'storeImage' }, { name: 'tradeLicense' }])`
  - `validateRequest(UserValidation.createUserSchema)`
- Controller: `UserController.createUser`
- Service: `UserService.createUserInDB(payload, files)`

2.  `POST /api/v1/user/send-signup-otp-again`

- Middleware: `validateRequest(UserValidation.sendSignupOtpAgainSchema)`
- Controller: `UserController.sendSignupOtpAgain`
- Service: `UserService.sendSignupOtpAgain(userEmail)`

3.  `POST /api/v1/user/verify-signup-otp`

- Middleware: `validateRequest(UserValidation.verifySignupOtpSchema)`
- Controller: `UserController.verifySignupOtp`
- Service: `UserService.verifySignupOtpInDB(userEmail, otp)`
- Returns: `{ accessToken, refreshToken }`

### Signin

4.  `POST /api/v1/user/signin`

- Middleware: `validateRequest(UserValidation.signinSchema)`
- Controller: `UserController.signin`
- Service: `UserService.signinInDB({ email, password })`
- Returns: `{ accessToken, refreshToken }`

### Access token refresh

5.  `GET /api/v1/user/access-token`

- Controller: `UserController.getNewAccessToken`
- Service: `UserService.getNewAccessTokenFromServer(refreshToken)`
- Note: refresh token is read from `Authorization: Bearer <refreshToken>`
- Returns: `{ accessToken }`

### Profile / Settings

6.  `GET /api/v1/user/profile`

- Middleware: `auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN)`
- Controller: `UserController.fetchProfile`
- Service: `UserService.fetchProfileFromDB(req.user)`

7.  `PUT /api/v1/user/update-profile-photo`

- Middleware:
  - `auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN)`
  - `multerUpload.single('user')`
- Controller: `UserController.updateProfilePhoto`
- Service: `UserService.updateProfilePhotoInDB(req.user, req.file)`
- Returns: `{ accessToken }`

8.  `PATCH /api/v1/user/update-user-data`

- Middleware:
  - `auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN)`
  - `validateRequest(UserValidation.updateUserDataSchema)`
- Controller: `UserController.updateUserData`
- Service: `UserService.updateUserDataInDB(payload, req.user)`
- Returns: `{ accessToken }`

9.  `PATCH /api/v1/user/change-password`

- Middleware:
  - `auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN)`
  - `validateRequest(UserValidation.changePasswordSchema)`
- Controller: `UserController.changePassword`
- Service: `UserService.changePasswordInDB(payload, req.user)`
- Returns: `{ accessToken }`

### Forgot password

10. `POST /api/v1/user/forgot-password`

- Middleware: `validateRequest(UserValidation.forgotPasswordSchema)`
- Controller: `UserController.forgotPassword`
- Service: `UserService.forgotPassword(email)`
- Returns: `{ token }` (OTP token)

11. `POST /api/v1/user/send-forgot-password-otp-again`

- Middleware: `validateRequest(UserValidation.sendForgotPasswordOtpAgainSchema)`
- Controller: `UserController.sendForgotPasswordOtpAgain`
- Service: `UserService.sendForgotPasswordOtpAgain(token)`

12. `POST /api/v1/user/verify-forgot-password-otp`

- Middleware: `validateRequest(UserValidation.verifyOtpForForgotPasswordSchema)`
- Controller: `UserController.verifyOtpForForgotPassword`
- Service: `UserService.verifyOtpForForgotPassword({ token, otp })`
- Returns: `{ resetPasswordToken }`

13. `POST /api/v1/user/reset-password`

- Middleware: `validateRequest(UserValidation.resetPasswordSchema)`
- Controller: `UserController.resetPassword`
- Service: `UserService.resetPasswordInDB({ resetPasswordToken, newPassword })`

### Account deactivation / deletion

14. `PATCH /api/v1/user/deactive-account`

- Middleware:
  - `auth(ROLE.BUYER, ROLE.VENDOR)`
  - `validateRequest(UserValidation.deactivateUserAccountSchema)`
- Controller: `UserController.deactivateUserAccount`
- Service: `UserService.deactivateUserAccountFromDB(req.user, payload)`

15. `DELETE /api/v1/user/delete-account`

- Middleware: `auth(ROLE.BUYER, ROLE.VENDOR)`
- Controller: `UserController.deleteSpecificUserAccount`
- Service: `UserService.deleteSpecificUserAccount(req.user)`

## Admin user endpoints

16. `GET /api/v1/user/admin-get-all`

- Middleware: `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`
- Controller: `UserController.adminGetAllUsers`
- Service: `UserService.adminGetAllUsersFromDB(req.query)`

17. `GET /api/v1/user/users`

- Controller: `UserController.getAllUser`
- Service: `UserService.getAllUserFromDB(req.query)`

---

# Module: Vendor (`/api/v1/vendor`)

Route: `src/app/modules/Vendor/vendor.routes.ts`

Vendor profile can be created:

- During signup when `role === VENDOR` (inside `UserService.createUserInDB`)
- Or via vendor self-service register

## Vendor self-service

1.  `POST /api/v1/vendor/register`

- Middleware: `auth(ROLE.VENDOR)` + `multerUpload.fields(...)` + `validateRequest(VendorValidation.registerVendor)`
- Controller: `VendorController.registerVendor`
- Service: `VendorService.registerVendorInDB(userId, payload, files)`

2.  `PATCH /api/v1/vendor/me`

- Middleware: `auth(ROLE.VENDOR)` + `multerUpload.fields(...)` + `validateRequest(VendorValidation.updateVendor)`
- Controller: `VendorController.updateVendorProfile`
- Service: `VendorService.updateVendorProfileInDB(userId, payload, files)`

3.  `GET /api/v1/vendor/me`

- Middleware: `auth(ROLE.VENDOR)`
- Controller: `VendorController.getMyVendorProfile`
- Service: `VendorService.getMyVendorProfileFromDB(userId)`

4.  `GET /api/v1/vendor/me/usage`

- Middleware: `auth(ROLE.VENDOR)`
- Controller: `VendorController.getMyUsage`
- Service: `VendorService.getMyUsageFromDB(userId)`

## Admin / Super Admin moderation

5.  `GET /api/v1/vendor/admin`

- Middleware: `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` + `validateRequest(VendorValidation.adminGetVendors)`
- Controller: `VendorController.adminGetVendors`
- Service: `VendorService.adminGetVendorsFromDB(req.query)`

6.  `PATCH /api/v1/vendor/:id/approve`

- Middleware: `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` + `validateRequest(VendorValidation.approveVendor)`
- Controller: `VendorController.approveVendor`
- Service: `VendorService.approveVendorInDB(vendorId, adminId, payload)`

7.  `PATCH /api/v1/vendor/:id/reject`

- Middleware: `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` + `validateRequest(VendorValidation.rejectVendor)`
- Controller: `VendorController.rejectVendor`
- Service: `VendorService.rejectVendorInDB(vendorId, adminId, { reason })`

8.  `PATCH /api/v1/vendor/:id/block`

- Middleware: `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` + `validateRequest(VendorValidation.blockVendor)`
- Controller: `VendorController.blockVendor`
- Service: `VendorService.blockVendorInDB(vendorId, adminId, { reason })`

9.  `PATCH /api/v1/vendor/:id/unblock`

- Middleware: `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`
- Controller: `VendorController.unblockVendor`
- Service: `VendorService.unblockVendorInDB(vendorId, adminId)`

---

# Module: Admin (`/api/v1/admin`)

Route: `src/app/modules/Admin/admin.routes.ts`

- `GET /api/v1/admin/` → `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` → `AdminController.getAllAdmins` → `AdminService.getAllAdminsFromDB`
- `POST /api/v1/admin/` → `auth(ROLE.SUPER_ADMIN)` + `validateRequest(AdminValidation.createAdminValidation)` → `AdminController.createAdmin` → `AdminService.createAdminInDB`
- `PATCH /api/v1/admin/:id` → `auth(ROLE.SUPER_ADMIN)` + `validateRequest(AdminValidation.updateAdminValidation)` → `AdminController.updateAdmin` → `AdminService.updateAdminInDB`
- `DELETE /api/v1/admin/:id` → `auth(ROLE.SUPER_ADMIN)` → `AdminController.superAdminDeleteAdmin` → `AdminService.superAdminDeleteAdminFromDB`

---

# Module: Category (`/api/v1/category`)

Route: `src/app/modules/Category/category.routes.ts`

Public:

- `GET /api/v1/category/` → `CategoryController.getAllCategories` → `CategoryService.getAllCategoriesFromDB`
- `GET /api/v1/category/tree` → `CategoryController.getCategoryTree` → `CategoryService.getCategoryTreeFromDB`
- `GET /api/v1/category/:categoryId/subcategory` → `CategoryController.getSubCategories` → `CategoryService.getSubCategoriesFromDB`

Admin:

- `POST /api/v1/category/` → `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` + `validateRequest(CategoryValidation.createCategorySchema)` → `CategoryController.createCategory` → `CategoryService.createCategoryInDB`
- `PUT /api/v1/category/:id` → `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` + `validateRequest(CategoryValidation.updateCategorySchema)` → `CategoryController.updateCategory` → `CategoryService.updateCategoryInDB`
- `DELETE /api/v1/category/:id` → `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` → `CategoryController.deleteCategory` → `CategoryService.deleteCategoryFromDB`
- `POST /api/v1/category/:categoryId/subcategory` → `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` + `validateRequest(CategoryValidation.createSubCategorySchema)` → `CategoryController.createSubCategory` → `CategoryService.createSubCategoryInDB`
- `PATCH /api/v1/category/subcategory/:id` → `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` + `validateRequest(CategoryValidation.updateSubCategorySchema)` → `CategoryController.updateSubCategory` → `CategoryService.updateSubCategoryInDB`
- `DELETE /api/v1/category/subcategory/:id` → `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` → `CategoryController.deleteSubCategory` → `CategoryService.deleteSubCategoryFromDB`

---

# Module: Page (`/api/v1/page`)

Route: `src/app/modules/Page/page.route.ts`

- `PUT /api/v1/page/create-or-update` → `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` + `validateRequest(pageZodValidation.createOrUpdatePageSchema)` → `PageController.createPageOrUpdate` → `PageService.createOrUpdatePage`
- `GET /api/v1/page/retrieve` → `PageController.getAllPage` → `PageService.getAllPage`
- `GET /api/v1/page/retrieve/:type` → `PageController.getPageByType` → `PageService.getPageByType`

---

# Module: Contact (`/api/v1/contact`)

Route: `src/app/modules/Contact/contact.routes.ts`

- `POST /api/v1/contact/` → `validateRequest(ContactValidation.createContactValidation)` → `ContactController.createContact` → `ContactService.createContactInDB`
- `GET /api/v1/contact/` → `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` → `ContactController.adminGetAllContacts` → `ContactService.adminGetAllContactsFromDB`

---

# Module: Location (`/api/v1/location`)

Route: `src/app/modules/Location/location.routes.ts`

- `GET /api/v1/location/` → `validateRequest(LocationValidation.listLocationSchema)` → `LocationController.getLocations` → `LocationService.getLocationsFromDB`
- `GET /api/v1/location/admin` → `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` → `LocationController.adminGetLocations` → `LocationService.adminGetLocationsFromDB`
- `POST /api/v1/location/` → `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` + `validateRequest(LocationValidation.createLocationSchema)` → `LocationController.createLocation` → `LocationService.createLocationInDB`
- `PATCH /api/v1/location/:id` → `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` + `validateRequest(LocationValidation.updateLocationSchema)` → `LocationController.updateLocation` → `LocationService.updateLocationInDB`
- `DELETE /api/v1/location/:id` → `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` → `LocationController.deleteLocation` → `LocationService.deleteLocationFromDB`

---

# Module: Ad (`/api/v1/ad`)

Route: `src/app/modules/Ad/ad.routes.ts`

Public:

- `GET /api/v1/ad/` → `AdController.getAllAds` → `AdService.getAllAdsFromDB`
- `GET /api/v1/ad/:id` → `AdController.getAdById` → `AdService.getAdByIdFromDB`
- `POST /api/v1/ad/:id/view` → `AdController.trackView` → `AdService.trackAdViewInDB`
- `POST /api/v1/ad/:id/report` → `rateLimit(...)` + `validateRequest(AdValidation.reportAdSchema)` → `AdController.reportAd` → `AdService.reportAdInDB`

Vendor/Admin:

- `GET /api/v1/ad/my` → `auth(ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN)` → `AdController.getMyAds` → `AdService.getMyAdsFromDB`
- `POST /api/v1/ad/` → `auth(...)` + `multerUpload.array('images', 5)` + `validateRequest(AdValidation.createAdSchema)` → `AdController.createAd` → `AdService.createAdInDB`
- `PATCH /api/v1/ad/:id` → `auth(...)` + `validateRequest(AdValidation.updateAdSchema)` → `AdController.updateAd` → `AdService.updateAdInDB`
- `DELETE /api/v1/ad/:id` → `auth(...)` → `AdController.deleteAd` → `AdService.deleteAdFromDB`
- `POST /api/v1/ad/:id/boost` → `auth(...)` + `validateRequest(AdValidation.boostAdSchema)` → `AdController.boostAd` → `AdService.boostAdInDB`

Admin moderation:

- `GET /api/v1/ad/admin` → `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` → `AdController.adminGetAllAds` → `AdService.adminGetAllAdsFromDB`
- `GET /api/v1/ad/admin/summary` → `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` → `AdController.adminGetSummary` → `AdService.adminGetSummaryFromDB`
- `PATCH /api/v1/ad/:id/approve` → `auth(...)` + `validateRequest(AdValidation.approveAdSchema)` → `AdController.approveAd` → `AdService.approveAdInDB`
- `PATCH /api/v1/ad/:id/reject` → `auth(...)` + `validateRequest(AdValidation.rejectAdSchema)` → `AdController.rejectAd` → `AdService.rejectAdInDB`
- `PATCH /api/v1/ad/:id/expire` → `auth(...)` → `AdController.expireAd` → `AdService.expireAdInDB`
- `GET /api/v1/ad/admin/reports` → `rateLimit(...)` + `auth(...)` → `AdController.adminListReports` → `AdService.adminListReportsFromDB`
- `PATCH /api/v1/ad/admin/reports/:id/resolve` → `rateLimit(...)` + `auth(...)` → `AdController.adminResolveReport` → `AdService.adminResolveReportInDB`

---

# Module: Favourite (`/api/v1/favourite`)

Route: `src/app/modules/Favourite/favourite.routes.ts`

- `GET /api/v1/favourite/my` → `auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN)` + `validateRequest(FavouriteValidation.listMyFavouritesSchema)` → `FavouriteController.getMyFavourites` → `FavouriteService.getMyFavouritesFromDB`
- `POST /api/v1/favourite/:adId` → `auth(...)` → `FavouriteController.addFavourite` → `FavouriteService.addFavouriteInDB`
- `DELETE /api/v1/favourite/:adId` → `auth(...)` → `FavouriteController.removeFavourite` → `FavouriteService.removeFavouriteFromDB`

Note: Ad module also has `/api/v1/ad/:id/favourite` endpoints.

---

# Module: Alert (`/api/v1/alert`)

Route: `src/app/modules/Alert/alert.routes.ts`

All endpoints require: `auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN)`.

- `POST /api/v1/alert/` → `validateRequest(AlertValidation.createAlertSchema)` → `AlertController.createAlert` → `AlertService.createAlertInDB`
- `GET /api/v1/alert/my` → `AlertController.listMyAlerts` → `AlertService.listMyAlertsFromDB`
- `PATCH /api/v1/alert/:id` → `validateRequest(AlertValidation.updateAlertSchema)` → `AlertController.updateAlert` → `AlertService.updateAlertInDB`
- `DELETE /api/v1/alert/:id` → `AlertController.deleteAlert` → `AlertService.deleteAlertFromDB`
- `POST /api/v1/alert/saved-search` → `validateRequest(AlertValidation.createSavedSearchSchema)` → `AlertController.createSavedSearch` → `AlertService.createSavedSearchInDB`
- `GET /api/v1/alert/saved-search/my` → `AlertController.listMySavedSearches` → `AlertService.listMySavedSearchesFromDB`
- `DELETE /api/v1/alert/saved-search/:id` → `AlertController.deleteSavedSearch` → `AlertService.deleteSavedSearchFromDB`

---

# Module: Lottery (`/api/v1/lottery`)

Route: `src/app/modules/Lottery/lottery.routes.ts`

Public:

- `GET /api/v1/lottery/` → `validateRequest(LotteryValidation.listLotteriesSchema)` → `LotteryController.listLotteries` → `LotteryService.listLotteriesFromDB`
- `GET /api/v1/lottery/:id` → `LotteryController.getLotteryById` → `LotteryService.getLotteryByIdFromDB`

Authenticated:

- `POST /api/v1/lottery/:id/join` → `auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN)` + `validateRequest(LotteryValidation.joinLotterySchema)` → `LotteryController.joinLottery` → `LotteryService.joinLotteryInDB`
- `GET /api/v1/lottery/my/summary` → `auth(...)` → `LotteryController.getMySummary` → `LotteryService.getMySummaryFromDB`
- `GET /api/v1/lottery/my/upcoming` → `auth(...)` → `LotteryController.getMyUpcoming` → `LotteryService.getMyUpcomingFromDB`
- `GET /api/v1/lottery/my/rewards` → `auth(...)` → `LotteryController.getMyRewards` → `LotteryService.getMyRewardsFromDB`
- `POST /api/v1/lottery/reward/redeem` → `auth(...)` + `validateRequest(LotteryValidation.redeemRewardSchema)` → `LotteryController.redeemReward` → `LotteryService.redeemRewardInDB`

Admin:

- `GET /api/v1/lottery/admin` → `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` → `LotteryController.adminListLotteries` → `LotteryService.adminListLotteriesFromDB`
- `POST /api/v1/lottery/` → `auth(...)` + `validateRequest(LotteryValidation.createLotterySchema)` → `LotteryController.adminCreateLottery` → `LotteryService.adminCreateLotteryInDB`
- `PATCH /api/v1/lottery/:id` → `auth(...)` + `validateRequest(LotteryValidation.updateLotterySchema)` → `LotteryController.adminUpdateLottery` → `LotteryService.adminUpdateLotteryInDB`
- `PATCH /api/v1/lottery/:id/status` → `auth(...)` + `validateRequest(LotteryValidation.updateLotteryStatusSchema)` → `LotteryController.adminUpdateLotteryStatus` → `LotteryService.adminUpdateLotteryStatusInDB`
- `POST /api/v1/lottery/:id/draw` → `auth(...)` → `LotteryController.adminRunDraw` → `LotteryService.adminRunDrawInDB`

---

# Module: Subscription (`/api/v1/subscription`)

Route: `src/app/modules/Subscription/subscription.routes.ts`

Public:

- `GET /api/v1/subscription/plans` → `SubscriptionController.listPlans` → `SubscriptionService.listPlansFromDB`

Authenticated:

- `GET /api/v1/subscription/my` → `auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN)` → `SubscriptionController.getMySubscription` → `SubscriptionService.getMySubscriptionFromDB`
- `POST /api/v1/subscription/change` → `auth(...)` + `validateRequest(SubscriptionValidation.changePlanSchema)` → `SubscriptionController.changePlan` → `SubscriptionService.changePlanInDB`
- `POST /api/v1/subscription/cancel` → `auth(...)` → `SubscriptionController.cancelSubscription` → `SubscriptionService.cancelSubscriptionInDB`
- `GET /api/v1/subscription/invoice/my` → `auth(...)` → `SubscriptionController.getMyInvoices` → `SubscriptionService.getMyInvoicesFromDB`
- `POST /api/v1/subscription/payment-method` → `auth(...)` → `SubscriptionController.updatePaymentMethod` → `SubscriptionService.updatePaymentMethodInDB`
- `POST /api/v1/subscription/wallet/topup` → `auth(...)` + `validateRequest(SubscriptionValidation.walletTopupSchema)` → `SubscriptionController.walletTopup` → `SubscriptionService.walletTopupInDB`
- `GET /api/v1/subscription/wallet` → `auth(...)` → `SubscriptionController.getWalletBalance` → `SubscriptionService.getWalletBalanceFromDB`

Admin:

- `GET /api/v1/subscription/admin` → `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` → `SubscriptionController.adminListSubscriptions` → `SubscriptionService.adminListSubscriptionsFromDB`
- `POST /api/v1/subscription/plans` → `auth(...)` + `validateRequest(SubscriptionValidation.createPlanSchema)` → `SubscriptionController.adminCreatePlan` → `SubscriptionService.adminCreatePlanInDB`
- `PATCH /api/v1/subscription/plans/:id` → `auth(...)` + `validateRequest(SubscriptionValidation.updatePlanSchema)` → `SubscriptionController.adminUpdatePlan` → `SubscriptionService.adminUpdatePlanInDB`

---

# Module: Payment (`/api/v1/payment`)

Route: `src/app/modules/Payment/payment.routes.ts`

- `POST /api/v1/payment/init` → `auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN)` + `validateRequest(PaymentValidation.initPaymentSchema)` → `PaymentController.initPayment` → `PaymentService.initPaymentInDB`
- `GET /api/v1/payment/validate` → `validateRequest(PaymentValidation.validatePaymentSchema)` → `PaymentController.validatePayment` → `PaymentService.validatePaymentFromGateway`

---

# Role-based flows summary

## Buyer

- Signup/login via **User**
- Browse and view ads via **Ad**
- Save favourites via **Favourite** (or `/api/v1/ad/:id/favourite`)
- Saved search & alerts via **Alert**
- Join lotteries via **Lottery**
- Subscription & wallet via **Subscription**
- Payments via **Payment**

## Vendor

- Signup with role `VENDOR` via **User** (requires store image + trade license)
- Vendor profile pending in **Vendor**
- Admin approves via **Vendor approve** route
- Create/manage ads via **Ad**
- Subscription/usage via **Subscription** + `GET /api/v1/vendor/me/usage`

## Admin

- Moderate vendors via **Vendor**
- Moderate ads + reports via **Ad**
- Manage categories/locations via **Category** + **Location**
- View users via **User admin endpoints**
- Manage plans/subscriptions via **Subscription**

## Super Admin

- Everything Admin can do
- Manage admins via **Admin module**
