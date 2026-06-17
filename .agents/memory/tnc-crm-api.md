---
name: TNC CRM API pattern
description: How to query the TNC CRM backend — POST pattern, table names, CORS workaround, no Replit DB needed
---

## Rule
All data for TNC Nursing Classes comes from the live CRM at `https://crm.tncnursing.in/`. The CRM has no CORS headers, so all requests must be proxied server-side through the Express API server.

## API pattern
POST `https://crm.tncnursing.in/common/` with body:
```json
{"payload": "{\"fn\":\"common_fn\",\"se\":\"fe\",\"sch\":\"t_co\",\"data\":{\"json\":\"*\"},\"cond\":{}}"}
```
- `fn`: always `"common_fn"` for reads, or the appropriate function
- `se`: `"fe"` for fetch/read, `"in"` for insert
- `sch`: table name
- `data`: fields to fetch (use `{"json":"*"}` for all)
- `cond`: filter conditions (empty `{}` for all rows)

## Tables
- `t_co` — courses (confirmed working)
- `t_se` — sessions/videos/PDFs (may return `false` without correct conditions, fallback to no-cond fetch)
- `t_sl` — slider images (confirmed working)
- `t_us` — users (confirmed working, fields: `_us_id`, `_us_na`, `_mo`, `_us_pa`, `_em`, `_cl`, `_st`, `_ci`, `_ge`, `_dob`)
- `t_cu` — purchases/enrollments
- `t_ad` — admins
- `t_wa` — wallet (unverified)

## Media URLs
Media files are at `https://crm.tncnursing.in/uploads/...` and are publicly accessible (no auth required).

**Why:** CRM has no CORS headers so browser can't call it directly. No Replit DB is needed — the CRM is the source of truth.
