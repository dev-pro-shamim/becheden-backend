# Page (Static Content) API (Docs)

Base path: `/api/v1/page`

Dashboard feature reference:

- `recycle_mart_dashboard/src/app/about-us/page.tsx`
- `recycle_mart_dashboard/src/app/privacy-policy/page.tsx`
- `recycle_mart_dashboard/src/app/content/page.tsx`

Existing route file: `src/app/modules/Page/page.route.ts`

---

## Existing endpoints (from code)

### 1) Create or update a page by type

**Method**: `PUT`
**Path**: `/api/v1/page/create-or-update`
**Auth**: Required (`auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`)

#### Body (suggested)

```json
{
  "type": "about-us",
  "content": "<p>...</p>"
}
```

### 2) Get all pages

**Method**: `GET`
**Path**: `/api/v1/page/retrieve`
**Auth**: Public

### 3) Get page by type

**Method**: `GET`
**Path**: `/api/v1/page/retrieve/:type`
**Auth**: Public

---

## Planned dashboard UX mapping

- About Us editor should call:

  - `GET /api/v1/page/retrieve/about-us`
  - `PUT /api/v1/page/create-or-update`

- Privacy Policy editor should call:

  - `GET /api/v1/page/retrieve/privacy-policy`
  - `PUT /api/v1/page/create-or-update`

- Content Management can reuse pages with types like:
  - `home-banners`
  - `footer-links`
  - `terms-and-conditions`

---

## Page type conventions (recommended)

Use lowercase kebab-case strings:

- `about-us`
- `privacy-policy`
- `terms`
- `home-banners`
- `footer`
