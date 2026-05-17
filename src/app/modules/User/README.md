# User API (Docs)

Base path: `/api/v1/user`

This module covers authentication, profile, and admin user management.

Dashboard feature reference:

- `recycle_mart_dashboard/src/app/users/page.tsx`

Website reference:

- Auth pages under `recycle_mart_website/src/app/auth/*`

---

## Auth & account endpoints (from code)

(See `src/app/modules/User/user.route.ts`)

### 1) Signup

`POST /api/v1/user/signup`

### 2) Send signup OTP again

`POST /api/v1/user/send-signup-otp-again`

### 3) Verify signup OTP

`POST /api/v1/user/verify-signup-otp`

### 4) Signin

`POST /api/v1/user/signin`

### 5) Update profile photo

`PUT /api/v1/user/update-profile-photo`
Auth: `auth(ROLE.BUYER, ROLE.VENDOR, ROLE.ADMIN, ROLE.SUPER_ADMIN)`

### 6) Change password

`PATCH /api/v1/user/change-password`
Auth: required

### 7) Forgot password

`POST /api/v1/user/forgot-password`

### 8) Send forgot password OTP again

`POST /api/v1/user/send-forgot-password-otp-again`

### 9) Verify OTP for forgot password

`POST /api/v1/user/verify-forgot-password-otp`

### 10) Reset password

`POST /api/v1/user/reset-password`

### 11) Fetch profile

`GET /api/v1/user/profile`
Auth: required

### 12) Deactivate account

`PATCH /api/v1/user/deactive-account`
Auth: `auth(ROLE.BUYER, ROLE.VENDOR)`

### 13) Delete account

`DELETE /api/v1/user/delete-account`
Auth: `auth(ROLE.BUYER, ROLE.VENDOR)`

### 14) Get new access token

`GET /api/v1/user/access-token`

### 15) Update user data

`PATCH /api/v1/user/update-user-data`
Auth: required

---

## Admin endpoints (from code)

### 16) Admin get all users

`GET /api/v1/user/admin-get-all`
Auth: `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`

### 17) Admin get all metadata

`GET /api/v1/user/meta-data`
Auth: `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`

### 18) Get all users (public)

`GET /api/v1/user/users`

---

## Planned dashboard extensions (recommended)

To fully support `dashboard/src/app/users/page.tsx` you will likely need:

### A) Admin: update user status (ban/unban)

`PATCH /api/v1/user/:id/status`
Auth: `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`

Body:

```json
{ "status": "banned", "reason": "Scam reports" }
```

### B) Admin: change user role (buyer/vendor/admin)

`PATCH /api/v1/user/:id/role`
Auth: `auth(ROLE.SUPER_ADMIN)`

Body:

```json
{ "role": "ADMIN" }
```
