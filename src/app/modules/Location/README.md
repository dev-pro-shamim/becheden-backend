# Location API (Planned)

Base path: `/api/v1/location`

Dashboard feature reference:

- `recycle_mart_dashboard/src/app/locations/page.tsx`

This module manages divisions/cities/areas used for ad location filters.

---

## 1) Public: list locations

**Method**: `GET`
**Path**: `/api/v1/location`
**Auth**: Public

### Query params

- `division` (string, optional)
- `searchTerm` (string, optional)

---

## 2) Admin: list locations (dashboard)

**Method**: `GET`
**Path**: `/api/v1/location/admin`
**Auth**: Required (`auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`)

---

## 3) Admin: create location

**Method**: `POST`
**Path**: `/api/v1/location`
**Auth**: Required (`auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`)

### Body

```json
{
  "division": "Dhaka",
  "area": "Dhanmondi"
}
```

---

## 4) Admin: update location

**Method**: `PATCH`
**Path**: `/api/v1/location/:id`
**Auth**: Required (`auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`)

---

## 5) Admin: delete location

**Method**: `DELETE`
**Path**: `/api/v1/location/:id`
**Auth**: Required (`auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`)
