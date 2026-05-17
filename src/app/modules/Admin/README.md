# Admin API (Docs)

Base path: `/api/v1/admin`

This module supports dashboard pages:

- `recycle_mart_dashboard/src/app/roles/page.tsx` (admins/roles)
- `recycle_mart_dashboard/src/app/users/page.tsx` (admin actions on users)

Roles:

- Super-admin-only actions should use `auth(ROLE.SUPER_ADMIN)`

---

## Existing endpoints (from code)

### 1) Get all admins

**Method**: `GET`
**Path**: `/api/v1/admin/`
**Auth**: Required (`auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`)

### 2) Create admin

**Method**: `POST`
**Path**: `/api/v1/admin/`
**Auth**: Required (`auth(ROLE.SUPER_ADMIN)`)

### 3) Update admin

**Method**: `PATCH`
**Path**: `/api/v1/admin/:id`
**Auth**: Required (`auth(ROLE.SUPER_ADMIN)`)

### 4) Delete admin

**Method**: `DELETE`
**Path**: `/api/v1/admin/:id`
**Auth**: Required (`auth(ROLE.SUPER_ADMIN)`)

---

## Planned dashboard extensions

### A) Admin role management (optional)

If you want dashboard roles separate from user roles:

- `GET /api/v1/admin/roles`
- `POST /api/v1/admin/roles`
- `PATCH /api/v1/admin/roles/:id`
- `DELETE /api/v1/admin/roles/:id`

Auth: `auth(ROLE.SUPER_ADMIN)`

Notes:

- Your current project uses fixed `ROLE` constants; this section is only needed if you introduce dynamic roles/permissions.
