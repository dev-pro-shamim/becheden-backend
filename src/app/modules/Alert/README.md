# Alerts & Saved Searches API (Planned)

Base path: `/api/v1/alert`

Website feature reference:

- `src/app/(main-route)/profile/alerts/page.tsx`

This module covers:

- Alerts (notify user when new ads match criteria)
- Saved searches (quickly replay filters)

---

## 1) Create alert

**Method**: `POST`
**Path**: `/api/v1/alert`
**Auth**: Required

### Body

```json
{
  "title": "Used motorcycle within 50k BDT",
  "filters": {
    "category": "vehicles",
    "location": "Dhaka",
    "minPrice": 0,
    "maxPrice": 50000
  },
  "frequency": "DAILY"
}
```

### `frequency`

- `INSTANT`
- `DAILY`
- `WEEKLY`

---

## 2) List my alerts

**Method**: `GET`
**Path**: `/api/v1/alert/my`
**Auth**: Required

---

## 3) Update alert (frequency / pause)

**Method**: `PATCH`
**Path**: `/api/v1/alert/:id`
**Auth**: Required

### Body examples

```json
{ "paused": true }
```

```json
{ "frequency": "INSTANT" }
```

---

## 4) Delete alert

**Method**: `DELETE`
**Path**: `/api/v1/alert/:id`
**Auth**: Required

---

## 5) Saved searches

### Create saved search

**Method**: `POST`
**Path**: `/api/v1/alert/saved-search`
**Auth**: Required

### List saved searches

**Method**: `GET`
**Path**: `/api/v1/alert/saved-search/my`
**Auth**: Required

### Delete saved search

**Method**: `DELETE`
**Path**: `/api/v1/alert/saved-search/:id`
**Auth**: Required

---

## Notification delivery (future)

- Email (SMTP / provider)
- Push notifications (FCM)
- SMS (gateway)

A recommended approach:

- A scheduled worker scans new ads and matches against alert filters.
- Store a `lastNotifiedAt` per alert to avoid duplicates.
