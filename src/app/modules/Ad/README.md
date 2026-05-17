# Ad (Marketplace Listings) API (Planned)

Base path: `/api/v1/ad`

Roles used in this project:

- `BUYER`
- `VENDOR`
- `ADMIN`
- `SUPER_ADMIN`

This document defines the **planned** endpoints required by the website pages:

- `src/app/(main-route)/ads/page.tsx` (browse/list)
- `src/app/(main-route)/ads/[id]/page.tsx` (details)
- `src/app/(main-route)/ads/create/page.tsx` (create)
- `src/app/(main-route)/profile/my-ads/page.tsx` (my ads management)
- `src/app/(main-route)/profile/favourites/page.tsx` (save/unsave)

---

## 1) Create an Ad

**Method**: `POST`
**Path**: `/api/v1/ad`
**Auth**: Required (`auth(ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN)`)
**Content-Type**: `multipart/form-data` (images)

### Form fields

- `categoryId` (string, required)
<!-- - `subCategoryId` (string, optional) -->
- `condition` ("used" | "new", required)
- `title` (string, required)
- `description` (string, required)
- `price` (number, required)
- `negotiable` (boolean, optional)
- `location` (string, required)
- `contactName` (string, required)
- `contactPhone` (string, required)
- `contactEmail` (string, required)
- `images` (file[], max 5, optional)

### Response (201)

```json
{
  "success": true,
  "message": "Ad created successfully",
  "data": {
    "id": "ad_123",
    "status": "ACTIVE",
    "title": "...",
    "price": 58000,
    "currency": "BDT"
  }
}
```

---

## 2) Get all ads (browse/search/filter)

**Method**: `GET`
**Path**: `/api/v1/ad`
**Auth**: Public

### Query params (optional)

- `searchTerm` (string)
- `category` (string | categorySlug)
- `location` (string)
- `minPrice` (number)
- `maxPrice` (number)
- `condition` ("used" | "new")
- `featured` (boolean)
- `urgent` (boolean)
- `sortBy` ("newest" | "price_low" | "price_high" | "popular")
- `page` (number)
- `limit` (number)

### Response (200)

```json
{
  "success": true,
  "message": "Ads retrieved successfully",
  "meta": { "page": 1, "limit": 20, "total": 200 },
  "data": [
    {
      "id": "ad_123",
      "title": "...",
      "price": 58000,
      "location": "Dhaka",
      "postedAt": "2025-12-16T10:00:00.000Z",
      "coverImage": "https://...",
      "isFeatured": true,
      "isUrgent": false
    }
  ]
}
```

---

## 2.1) Admin: Get all ads (moderation table)

Required for dashboard: `recycle_mart_dashboard/src/app/ads/page.tsx`

**Method**: `GET`
**Path**: `/api/v1/ad/admin`
**Auth**: Required (`auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`)

### Query params (optional)

- `status` ("pending" | "approved" | "rejected" | "expired" | "active" | "inactive")
- `categoryId` (string)
- `location` (string)
- `searchTerm` (string)
- `sortBy` ("newest" | "most_viewed")
- `page` (number)
- `limit` (number)

### Response (200)

Return rows compatible with the dashboard table:

- `id`, `title`, `seller`, `category`, `location`, `price`, `condition`, `status`, `postedDate`, `views`

---

## 2.2) Admin: Approve an ad

**Method**: `PATCH`
**Path**: `/api/v1/ad/:id/approve`
**Auth**: Required (`auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`)

### Body (optional)

```json
{ "note": "Looks good" }
```

---

## 2.3) Admin: Reject an ad

**Method**: `PATCH`
**Path**: `/api/v1/ad/:id/reject`
**Auth**: Required (`auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`)

### Body

```json
{ "reason": "Policy violation", "note": "Add real photos" }
```

---

## 2.4) Admin: Mark ad as expired / inactive

**Method**: `PATCH`
**Path**: `/api/v1/ad/:id/expire`
**Auth**: Required (`auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`)

---

## 2.5) Admin: Ad analytics (optional)

**Method**: `GET`
**Path**: `/api/v1/ad/admin/summary`
**Auth**: Required (`auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`)

### Response (example)

```json
{
  "success": true,
  "message": "Ad summary retrieved successfully",
  "data": {
    "pending": 120,
    "approved": 980,
    "rejected": 40,
    "expired": 60,
    "totalViews30d": 42800
  }
}
```

---

## 3) Get ad details

**Method**: `GET`
**Path**: `/api/v1/ad/:id`
**Auth**: Public

### Notes

- Should include seller info (name, phone masked/unmasked rules), gallery images, specifications, view count.
- Should return `notFound`/404 if ad does not exist or is removed.

---

## 4) Track a view

**Method**: `POST`
**Path**: `/api/v1/ad/:id/view`
**Auth**: Public

### Behavior

- Increment view counter.
- Optional anti-spam: ignore repeated views from same IP/session within a time window.

---

## 5) Update an ad

**Method**: `PATCH`
**Path**: `/api/v1/ad/:id`
**Auth**: Required (`auth(ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN)`)

### Rules

- Vendor can only update own ads.
- Admin can update any.

---

## 6) Delete/Archive an ad

**Method**: `DELETE`
**Path**: `/api/v1/ad/:id`
**Auth**: Required (`auth(ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN)`)

### Suggestion

Prefer soft-delete:

- `status`: `ARCHIVED` / `DELETED`

---

## 7) Get my ads (profile → my-ads)

**Method**: `GET`
**Path**: `/api/v1/ad/my`
**Auth**: Required (`auth(ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN)`)

### Query params

- `status` ("ACTIVE" | "DRAFT" | "ARCHIVED")
- `page`, `limit`

---

## 8) Promote/Boost an ad (featured / urgent)

**Method**: `POST`
**Path**: `/api/v1/ad/:id/boost`
**Auth**: Required (`auth(ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN)`)

### Body

```json
{
  "type": "FEATURED",
  "durationDays": 7
}
```

### Notes

- If payment required, integrate with `/api/v1/payment` (existing module) or create promotion payment flow.

---

## 9) Report an ad

**Method**: `POST`
**Path**: `/api/v1/ad/:id/report`
**Auth**: Optional (allow public, but rate-limit)

### Body

```json
{
  "reason": "SCAM",
  "details": "..."
}
```

---

## 10) Favourite (save/unsave) an ad

These endpoints are also referenced by the profile favourites feature.

### Add favourite

**Method**: `POST`
**Path**: `/api/v1/ad/:id/favourite`
**Auth**: Required (`auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN)`)

### Remove favourite

**Method**: `DELETE`
**Path**: `/api/v1/ad/:id/favourite`
**Auth**: Required

---

## Error format (recommended)

Use the same error format used by your global error handler.
Minimum recommended:

```json
{ "success": false, "message": "Validation error", "errorDetails": [] }
```
