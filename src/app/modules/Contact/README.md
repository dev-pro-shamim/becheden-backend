# Contact / Support API (Docs)

Base path: `/api/v1/contact`

Dashboard feature reference:

- `recycle_mart_dashboard/src/app/support/page.tsx`

Existing route file: `src/app/modules/Contact/contact.routes.ts`

---

## Existing endpoints (from code)

### 1) Admin: get all contacts

**Method**: `GET`
**Path**: `/api/v1/contact/`
**Auth**: Required (`auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`)

### 2) Create contact

**Method**: `POST`
**Path**: `/api/v1/contact/`
**Auth**: Public

---

## Planned dashboard extensions (recommended)

To support a support-ticket dashboard, you may extend Contact into Ticketing.

### A) Admin: update ticket status / assign

**Method**: `PATCH`
**Path**: `/api/v1/contact/:id`
**Auth**: Required (`auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)`)

#### Body

```json
{
  "status": "Closed",
  "assignedTo": "Tech Support",
  "note": "Resolved by clearing cache"
}
```

### B) Admin: filter tickets

Use query params on `GET /api/v1/contact`:

- `status`
- `category`
- `searchTerm`
- `page`, `limit`

---

## Suggested contact/ticket fields

- `subject`
- `message`
- `category` ("Ad Problem" | "Payment Issue" | ...)
- `status` ("Pending" | "In Progress" | "Closed")
- `assignedTo` (string)
- `userName`, `userEmail`
