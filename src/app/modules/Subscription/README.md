# Subscription & Billing API (Planned)

Base path: `/api/v1/subscription`

Website feature reference:

- `src/app/(main-route)/profile/subscription/page.tsx`

This module manages:

- Current plan
- Upgrades/downgrades
- Payment method updates
- Wallet top-up
- Invoices/billing history

Note: You already have a `Payment` module folder, but it is not wired in `src/app/routes/index.ts` yet. You can either:

- keep payment flows under `/api/v1/payment` and reference them from subscription, or
- implement minimal payment actions inside this module.

---

## 1) Get my current subscription

**Method**: `GET`
**Path**: `/api/v1/subscription/my`
**Auth**: Required

### Response fields

- `planId`, `planName`, `status`, `renewsAt`, `price`
- `paymentMethodSummary` (e.g. "Visa ending ••18")
- `autoRenew` (boolean)
- `credits` (promotion credits)

---

## 2) List available plans

**Method**: `GET`
**Path**: `/api/v1/subscription/plans`
**Auth**: Public

### Notes

This is used by dashboard "Packages / Membership Plans":
`recycle_mart_dashboard/src/app/packages/page.tsx`

---

## 3) Upgrade/downgrade plan

**Method**: `POST`
**Path**: `/api/v1/subscription/change`
**Auth**: Required

### Body

```json
{
  "planId": "gold_business",
  "billingCycle": "MONTHLY"
}
```

### Notes

- If payment is required, create a payment intent and return a redirect URL or payment session.

---

## 4) Cancel subscription

**Method**: `POST`
**Path**: `/api/v1/subscription/cancel`
**Auth**: Required

---

## 5) Billing history (invoices)

**Method**: `GET`
**Path**: `/api/v1/subscription/invoice/my`
**Auth**: Required

### Response

- `invoiceNo`, `date`, `plan`, `amount`, `status`, optional `downloadUrl`

---

## 6) Update payment method

**Method**: `POST`
**Path**: `/api/v1/subscription/payment-method`
**Auth**: Required

### Notes

- Usually involves tokenization via payment gateway.

---

## 7) Wallet

### Add wallet funds

**Method**: `POST`
**Path**: `/api/v1/subscription/wallet/topup`
**Auth**: Required

### Get wallet balance

**Method**: `GET`
**Path**: `/api/v1/subscription/wallet`
**Auth**: Required

---

## Admin endpoints (optional)

- Create/Update plans: `POST /api/v1/subscription/plans`, `PATCH /api/v1/subscription/plans/:id`
- View all subscriptions: `GET /api/v1/subscription/admin`
  Auth: `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`

---

## Admin: Packages/Plans CRUD (dashboard)

Required for dashboard: `recycle_mart_dashboard/src/app/packages/page.tsx`

### 1) Create plan/package

**Method**: `POST`
**Path**: `/api/v1/subscription/plans`
**Auth**: Required (`auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`)

### Body

```json
{
  "name": "Pro",
  "price": 799,
  "currency": "BDT",
  "durationUnit": "MONTH",
  "durationValue": 1,
  "adsLimit": 15,
  "features": ["priority_support", "boost_credits"],
  "isActive": true
}
```

### 2) List plans/packages

**Method**: `GET`
**Path**: `/api/v1/subscription/plans`
**Auth**: Required (`auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`) or Public (your choice)

### 3) Update plan/package

**Method**: `PATCH`
**Path**: `/api/v1/subscription/plans/:id`
**Auth**: Required (`auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`)

### 4) Delete/Deactivate plan/package

**Method**: `DELETE` or `PATCH`
**Path**: `/api/v1/subscription/plans/:id`
**Auth**: Required (`auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`)
