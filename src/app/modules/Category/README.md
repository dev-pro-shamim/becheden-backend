# Category API – Marketplace version

Base path: `/api/v1/category`

Used by:

- Dashboard: `recycle_mart_dashboard/src/app/categories/page.tsx`
- Website filters: category navigation & `/ads?category=<slug>`

---

## Public endpoints

| Purpose                                        | Method | Path                    | Auth   |
| ---------------------------------------------- | ------ | ----------------------- | ------ |
| List categories (flat)                         | `GET`  | `/api/v1/category`      | Public |
| Category tree with subcategories (for filters) | `GET`  | `/api/v1/category/tree` | Public |

## Admin endpoints

| Purpose                            | Method   | Path                                       | Auth                                 |
| ---------------------------------- | -------- | ------------------------------------------ | ------------------------------------ |
| Create category                    | `POST`   | `/api/v1/category`                         | `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` |
| Update category                    | `PUT`    | `/api/v1/category/:id`                     | `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` |
| Delete category                    | `DELETE` | `/api/v1/category/:id`                     | `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` |
| Get subcategories under a category | `GET`    | `/api/v1/category/:categoryId/subcategory` | Public                               |
| Create subcategory                 | `POST`   | `/api/v1/category/:categoryId/subcategory` | `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` |
| Update subcategory                 | `PATCH`  | `/api/v1/category/subcategory/:id`         | `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` |
| Delete subcategory                 | `DELETE` | `/api/v1/category/subcategory/:id`         | `auth(ROLE.ADMIN, ROLE.SUPER_ADMIN)` |

### Payload guidelines

**Category**

```json
{
  "name": "Laptop",
  "slug": "laptop",
  "icon": "https://...",
  "order": 1,
  "isActive": true
}
```

**Subcategory**

```json
{
  "name": "Laptop Accessories",
  "slug": "laptop-accessories",
  "icon": "https://...",
  "order": 2,
  "isActive": true
}
```

---

## Notes

- All slugs are auto-normalised when not provided.
- Soft-disable categories/subcategories via `isActive` to hide them from public filters.
- Future ideas: support drag & drop ordering (`PATCH /reorder`) or expose ad counts per category for richer filters.
