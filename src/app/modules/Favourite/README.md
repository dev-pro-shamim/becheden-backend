# Favourite (Saved Ads) API (Planned)

Base path: `/api/v1/favourite`

Website feature reference:

- `src/app/(main-route)/profile/favourites/page.tsx`

This module manages the user’s saved ads and optional collections.

---

## 1) Get my favourite ads

**Method**: `GET`
**Path**: `/api/v1/favourite/my`
**Auth**: Required (`auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN)`)

### Query params

- `category` (string, optional)
- `page`, `limit`

### Response (200)

```json
{
  "success": true,
  "message": "Favourites retrieved successfully",
  "meta": { "page": 1, "limit": 20, "total": 100 },
  "data": [
    {
      "adId": "ad_123",
      "title": "...",
      "price": 38000,
      "location": "Dhaka",
      "postedAt": "...",
      "imageUrl": "...",
      "isFeatured": false,
      "isUrgent": false
    }
  ]
}
```

---

## 2) Add an ad to favourites

**Method**: `POST`
**Path**: `/api/v1/favourite/:adId`
**Auth**: Required

---

## 3) Remove an ad from favourites

**Method**: `DELETE`
**Path**: `/api/v1/favourite/:adId`
**Auth**: Required

---

## 4) Collections (optional future)

The UI shows “Saved collections”. If you implement it:

### Create collection

**Method**: `POST`
**Path**: `/api/v1/favourite/collection`

### List collections

**Method**: `GET`
**Path**: `/api/v1/favourite/collection/my`

### Add/remove ad to collection

**Method**: `POST` / `DELETE`
**Path**: `/api/v1/favourite/collection/:collectionId/ad/:adId`
