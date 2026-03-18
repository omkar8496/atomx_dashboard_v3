# Dashboard App (AtomX)

This app is the main AtomX Dashboard that handles configuration, admin flows, and module-level operations. It is a **static export** (Next.js `output: "export"`) and is intended to be served from a base path like `/dashboard`.

**Overview**
- Framework: Next.js (App Router)
- Build target: Static export (`out/`)
- Base path: `NEXT_PUBLIC_DASHBOARD_BASEPATH` (default `/`)
- Assets path: same as base path via `assetPrefix`

**Local Dev**
- Start dev server:
```
npm run dev
```
- Open:
```
http://localhost:3000
```

**Environment (Shared Root `.env`)**
This app loads the **repo root** `.env` file via `dotenv` in `apps/dashboard/next.config.mjs`.

Common keys used by the dashboard:
- `NEXT_PUBLIC_BASE_URL` (API base; falls back to `https://dapi.atomx.in`)
- `NEXT_PUBLIC_DASHBOARD_API_KEY` (API key used in requests)
- `NEXT_PUBLIC_DASHBOARD_BASEPATH` (default `/`)
- `NEXT_PUBLIC_ACCESS_PORTAL_URL` or `NEXT_PUBLIC_PORTAL_URL` (for re-login flow)

**Build & Export**
- Dashboard only:
```
npm run build:dashboard
```
- Combined export for all apps:
```
npm run build:out
```
- Combined output:
```
out/
```
- Dashboard output (inside combined):
```
out/dashboard/
```

**Routing & Page Flow**
Key routes:
- `/admin` (Admin event selector)
- `/Config/operations` (Configuration operations)
- `/Config/profile` (Profile settings)
- `/Config/role_assign_event` ("+ Operator" flow)

Access portal → dashboard flow:
- Access portal sends users to `/admin?token=...` for admin roles
- Access portal sends users to `/Config/operations?token=...&service=...` for event roles

**Auth & Session**
Token handling:
- Tokens come from URL query (`token`) or from the dashboard store
- Header reads URL params on the client and updates store

Session re-login:
- `apps/dashboard/src/app/components/Session/SessionGuard.js`
- Reads JWT `exp`, warns 10 minutes before expiry
- Opens the Access Portal login and posts back updated token
- Uses `localStorage` key `atomx.portal.reauth` for reauth context

**State Management (Zustand)**
Store file:
- `apps/dashboard/src/store/dashboardStore.js`

Persisted keys (`localStorage`, `atomx.dashboard.store`):
- `token`
- `profile` (decoded JWT)
- `eventMeta` (eventId, eventName, venue, city)
- `eventDetails`
- `selectedService`
- `vendorsByEventId`
- `stallsByEventId`

**Storage**
LocalStorage keys used:
- `atomx.dashboard.store` (Zustand persist)
- `atomx.portal.reauth` (reauth context for session flow)

IndexedDB drafts:
- Database: `atomx.drafts`
- Store: `drafts`
- Autosave helper: `apps/dashboard/src/lib/useFormAutosave.js`

Draft keys currently used:
- `dashboard:profile:<userId>:<eventId>`
- `dashboard:vendor:<userId>:<eventId>:<vendorId|new>`
- `dashboard:stall:<userId>:<eventId>:<stallId|new>`
- `dashboard:create-event:about:<userId>`
- `dashboard:create-event:pos:<userId>`
- `dashboard:create-event:cashless:<userId>`

**API Layer**
API helpers:
- `apps/dashboard/src/lib/dashboardApi.js`

API base URL:
- Uses `@atomx/lib` → `getBaseUrl()`
- `NEXT_PUBLIC_BASE_URL` or default `https://dapi.atomx.in`

API key:
- `apps/dashboard/src/lib/apiConfig.js`
- Env: `NEXT_PUBLIC_DASHBOARD_API_KEY` (fallback value is present in code)

Headers:
- `Authorization: Bearer <token>` when available
- `x-api-key` when configured

**Important Notes**
- `/admin` is **client-only** (no SSR) to avoid static export errors
- `basePath` and `assetPrefix` must be set correctly for assets to load under `/dashboard`
- If assets 404, verify `NEXT_PUBLIC_DASHBOARD_BASEPATH` and rebuild

**Key Files**
- `apps/dashboard/next.config.mjs`
- `apps/dashboard/src/app/components/Header.js`
- `apps/dashboard/src/app/components/Session/SessionGuard.js`
- `apps/dashboard/src/lib/dashboardApi.js`
- `apps/dashboard/src/store/dashboardStore.js`
- `apps/dashboard/src/lib/useFormAutosave.js`
- `apps/dashboard/src/lib/idb.js`
