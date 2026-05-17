# Vendor Onboarding & Management API (Planned)

Base path: `/api/v1/vendor`

Used by dashboard pages:

- `recycle_mart_dashboard/src/app/vendors/page.tsx`
- `recycle_mart_dashboard/src/app/users/page.tsx`

This module manages the full vendor lifecycle: registration, document review, approval, plan assignment, and block/unblock actions.

---

## 1) Vendor self-registration

**Method**: `POST`
**Path**: `/api/v1/vendor/register`
**Auth**: Public

### Payload

```json
{
  "name": "Tech Bazaar",
  "ownerName": "Rahim Ahmed",
  "email": "vendor@example.com",
  "phone": "+8801xxxxxxxxx",
  "address": "House 12, Road 4, Dhaka",
  "tradeLicenseNumber": "TL/2025/00123",
  "storeImage": "https://...",
  "tradeLicense": "https://..."
}
```

### Behavior

- Creates a vendor profile with `status = "PENDING"`.
- Links to a `User` account (`role = VENDOR`).
- Sends email/notification to admin for review.

---

## 2) Admin: pending vendor list

**Method**: `GET`
**Path**: `/api/v1/vendor/admin`
**Auth**: `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`

Query params: `status`, `searchTerm`, `planId`, `blocked`, `page`, `limit`.

Returns vendor rows with document URLs, plan info, item counts, and quick actions.

---

## 3) Approve or reject vendor

**Method**: `PATCH`
**Path**: `/api/v1/vendor/:id/approve`
**Auth**: `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`

**Method**: `PATCH`
**Path**: `/api/v1/vendor/:id/reject`
**Auth**: `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`

```json
{
  "note": "Verified trade license, approved",
  "assignedPlanId": "free_starter"
}
```

Behavior:

- Approval sets `status = "APPROVED"`, `approvedAt`, `approvedBy`, `currentPlanId`.
- Rejection stores reason and prevents ad creation until re-submitted.

---

## 4) Block / unblock vendor

**Method**: `PATCH`
**Path**: `/api/v1/vendor/:id/block`
**Auth**: `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`

**Method**: `PATCH`
**Path**: `/api/v1/vendor/:id/unblock`
**Auth**: `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`

Payload supports optional `reason`.

Blocked vendors cannot log in or create ads.

---

## 5) My vendor profile

**Method**: `GET`
**Path**: `/api/v1/vendor/me`
**Auth**: `auth(ROLE.VENDOR)`

Returns profile, approval status, current plan, remaining listings, and document review notes.

**Method**: `PATCH`
**Path**: `/api/v1/vendor/me`
**Auth**: `auth(ROLE.VENDOR)`

Allows updating store info or re-uploading documents while pending/rejected.

---

## 6) Plan usage counters

**Method**: `GET`
**Path**: `/api/v1/vendor/me/usage`
**Auth**: `auth(ROLE.VENDOR)`

Response example:

```json
{
  "currentPlan": {
    "id": "free_starter",
    "name": "Free Starter",
    "maxListings": 10,
    "expiresAt": null
  },
  "listingsUsed": 3,
  "listingsRemaining": 7
}
```

---

## 7) Admin: vendor plans overview

**Method**: `GET`
**Path**: `/api/v1/vendor/admin/plans`
**Auth**: `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`

Used by dashboard to see which vendors are on which plan, renewal status, and usage.

---

## Data model notes

- Add fields to `Vendor` schema: `status`, `approvedAt`, `approvedBy`, `blocked`, `blockedAt`, `blockedBy`, `blockReason`, `currentPlanId`, `planExpiresAt`, `listingsUsed`.
- Tie into `Subscription` module for plan activation.
- Ads module must enforce `status === APPROVED` and plan limits before allowing `POST /api/v1/ad`.

---

## Notifications (future)

- Notify vendor on approval/rejection.
- Remind before plan expiry or when listings quota is near the limit.
