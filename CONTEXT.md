# Project Context

This is the code-oriented handoff for AtomX Portal. It records current behavior
as of **20 August 2026**. App-level files contain deeper implementation details.

## System Overview

AtomX Portal is an npm-workspaces/Turborepo monorepo with three separately
exported Next.js applications:

1. `access_portal`: browser login and workspace/service selection.
2. `dashboard`: event administration and operational tools.
3. `tag_series`: tag-series setup, generation, records, and XLSX export.

All apps are static exports. They call the AtomX backend from the browser and
share assets/analytics through workspace packages.

## Workspace Structure

```text
apps/
  access_portal/       Pages Router, port 3003
  dashboard/           App Router, port 3000
  tag_series/          App Router, /tag_series, port 3002
packages/
  api/                 generic/mock-oriented API foundation
  auth/                generic/mock-oriented auth foundation
  global-components/   loader, token gate, shell, analytics
  lib/                 URL, JWT, initials, metadata helpers
  public-assets/       canonical logos, fonts, shared assets
  shared-ui/           small UI primitives
  utils/               formatting and in-memory feature flags
scripts/
  export-all.js
  sync-public-assets.js
```

## Rendering And Deployment

- Next.js `16.2.6`, React `19.2.0`, JavaScript/JSX.
- Every app uses `output: "export"`.
- Dashboard may use `NEXT_PUBLIC_DASHBOARD_BASEPATH`.
- Tag Series always uses `/tag_series` as basePath/assetPrefix.
- `build:out` builds all apps and assembles root `out/`.
- Browser-only modules must avoid executing `window`/storage logic at build
  time.

## State Ownership

Dashboard persists Zustand store `atomx.dashboard.store` with:

- token and decoded profile
- selected event metadata/details
- selected service
- vendor and stall lists keyed by event ID

Dashboard token handoff also uses `atomx.dashboard.token`. Access Portal and
Tag Series use React state plus localStorage/sessionStorage. There is no Redux
or React Query.

## Authentication And Request Flow

1. Access Portal captures a Google/bootstrap token from the URL and removes it
   from browser history.
2. The token is stored as `atomx.portal.token` and app-specific aliases.
3. `/access` decodes roles and calls `POST /auth/select` with either
   `{type, adminId}` or `{type, eventId}`.
4. The returned service token is stored under `atomx.auth.<service>` and the
   dashboard compatibility key when relevant.
5. The destination receives context by redirect or popup `postMessage`.

Reauthentication uses `atomx.portal.reauth` with a 24-hour TTL. Apps warn ten
minutes before JWT expiry and clear portal/dashboard/auth storage on logout.
There is no silent refresh.

All live requests include browser credentials. This lets the browser attach
cookies automatically, but it does not mean the browser creates Authorization
headers. Dashboard code explicitly adds `Authorization: Bearer <token>` when a
token exists; failed GETs can retry cookie-only once after `401`/`403`.
Mutations do not retry without Bearer. Tag Series currently reads its token but
does not add it to API headers.

## Dashboard Summary

The dashboard shell has a fixed 58px header, event/profile context, persisted
light/dark theme (`atomx.theme`), and a dark SideDrawer that expands from 60px
to 248px on hover.

Active drawer destinations, in order:

1. Device Master (`/device_masterlist`)
2. Configuration (`/Config`)
3. Whitelist (`/whitelist`)
4. Admin (`/admin/Create_event`)
5. Reports (`/Reports`)
6. Transactions (`/transactions`)
7. Devices (`/device`)
8. Blocked (`/Blocked`)

Analytics, APK Uploads, TapX-Transactions, and Patcha-NY-Track entries are
currently commented out. Their route files may still exist.

Live dashboard domains include event list/edit, role linking/history,
vendor/stall configuration, AccessX categories/gates, menu loading, event and
master devices, transaction filter/detail/status, whitelist search/history,
report list/build, balance settings, and day close. Blocked IDs and several
hidden routes remain local prototypes.

Dashboard API traffic goes through:

```text
apps/dashboard/src/lib/apiClient.js
apps/dashboard/src/lib/dashboardApi.js
```

See [apps/dashboard/CONTEXT.md](./apps/dashboard/CONTEXT.md) for the complete
route/endpoint matrix and known gaps.

## Access Portal Summary

Routes:

- `/`: login, Google auth start, URL-token capture.
- `/access`: grouped role/workspace cards, `/auth/select`, token storage, and
  destination redirect/popup return.

The app uses the Pages Router and no global state library. It owns token handoff
and signout cleanup, not dashboard business data.

## Tag Series Summary

Tag Series is exported under `/tag_series`. The primary flow loads events/card
clients, selects event/client/year-series context, stores step-one state in
`atomx.tag_series.step1`, generates IDs, posts logs, reads batch records, and
downloads XLSX workbooks.

Its app-local API calls:

- `GET /v1/TagSeries/CardClients`
- `GET /v1/TagSeries/Series`
- `POST /v1/TagSeries/Logs`
- `GET /v1/TagSeries/BatchRecords`
- `GET /v1/TagSeries/Events`

Admin product/form-factor routes retain prototype behavior.

## Shared Packages

- `@atomx/lib`: browser-safe URL, JWT, initials, and metadata helpers.
- `@atomx/global-components`: login/shell primitives, loader, TokenGate, and
  consent-aware PostHog/GA setup.
- `@atomx/shared-ui`: generic buttons/cards/headings.
- `@atomx/utils`: formatting and in-memory feature flags.
- `@atomx/public-assets`: canonical logos, Poppins fonts, and manifests.
- `@atomx/api-client` / `@atomx/auth`: foundations with mock-oriented behavior;
  not the production dashboard/access implementation.

Shared assets are synchronized into generated `apps/*/public/shared` folders.
Edit only `packages/public-assets` and run `npm run sync:public`.

## Analytics

Shared analytics is browser-only and consent-aware. Consent is stored under
`atomx.analytics.consent.v1`. Follow `docs/analytics-schema.md`; do not add a
second PostHog/GA initializer in an app.

## Known Risks And Debt

- No automated test suite.
- Public dashboard API-key fallback exists in client source.
- Device bank defaults include sensitive client-side credentials.
- Some dashboard screens/controls remain local-only prototypes.
- API response-envelope normalization is not fully centralized.
- Repeated inline icon code and route-specific CSS remain.
- Tag Series does not send its stored token as Bearer authorization.

## Change Checklist

1. Read the nearest docs and current source.
2. Inspect dirty worktree changes and preserve unrelated edits.
3. Keep IDs dynamic and use the owning API module.
4. Preserve cookie/Bearer and storage-key contracts.
5. Add loading/error/empty/success handling.
6. Verify route casing and static-export compatibility.
7. Build affected apps and run `git diff --check`.
8. Update the relevant README/AGENTS/CONTEXT when architecture or behavior
   changes materially.
