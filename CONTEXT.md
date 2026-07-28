# Project Context

Last reviewed: 2026-07-25

This document gives a new engineer or AI agent enough context to work on the
current repository without inferring architecture from screenshots or stale
setup notes. It describes behavior observed in the source tree.

## System Overview

AtomX Portal is an npm-workspaces/Turborepo monorepo with three independently
buildable Next.js applications:

```text
Google auth
    |
    v
Access Portal ---- role/workspace selection ----> Dashboard
      |                                          /   |   \
      +--------------------------------------> Tag Series

Browser applications ---- credentials + optional Bearer/API key ----> AtomX API
```

All applications are static exports. There is no Next.js backend-for-frontend
in this repository. Runtime data fetching, token storage, analytics, Excel
generation, and navigation happen in the browser.

## Workspace Structure

```text
apps/
  access_portal/  Authentication and workspace selection
  dashboard/      Main event operations application
  tag_series/     Tag series generation and administration
packages/
  api/            Generic API-client foundation
  auth/           Generic in-memory/mock auth foundation
  global-components/ Cross-app login, token gate, shell, and analytics
  lib/            Environment metadata and JWT/general helpers
  public-assets/  Canonical shared fonts/logos/assets
  shared-ui/      Small UI primitives
  utils/          Formatting and feature flags
scripts/
  export-all.js           Combined static export
  sync-public-assets.js   Canonical-to-app public asset copy
```

## Rendering And Deployment

| App | Next router | Export path | Notes |
| --- | --- | --- | --- |
| Access Portal | Pages Router | Root access routes | Also overlaid as the combined root index |
| Dashboard | App Router | Root/dashboard routes | Optional `NEXT_PUBLIC_DASHBOARD_BASEPATH` |
| Tag Series | App Router | `/tag_series` | Fixed basePath/assetPrefix |

`scripts/export-all.js` removes generated output, builds each app with Next's
webpack build, and combines the exports into root `out/`. The static host must
support direct navigation to exported route directories.

## Client And Server Components

The product is primarily client-side, but App Router terminology still matters:

- Files with `"use client"` are interactive client components.
- Layouts/pages without `"use client"` are build-time/server component
  wrappers.
- Static export means those server components do not require a production
  Next.js server.
- There are no route handlers or server actions in the current apps.

## State Management

| Area | Mechanism | Persistence |
| --- | --- | --- |
| Dashboard shared state | Zustand `persist` | `localStorage`: `atomx.dashboard.store` |
| Dashboard temporary UI/forms | React state | Usually none |
| Access Portal | React state | localStorage, sessionStorage, cookie |
| Tag Series | React state | localStorage and sessionStorage |
| Analytics consent | Shared browser helper | `localStorage`: `atomx.analytics.consent.v1` |

The dashboard store currently owns:

- selected service token and decoded profile
- event metadata and event details
- selected service
- vendor lists keyed by event ID
- stall lists keyed by event ID

The repository does not use Redux, MobX, Recoil, or React Query.

An IndexedDB draft helper and `useFormAutosave` hook exist in the dashboard,
but no current screen imports them. Do not assume form autosave is active.

## Authentication And Session Flow

1. Access Portal starts Google login using the configured AtomX auth endpoint.
2. A token returned in the URL is decoded and stored as the portal/bootstrap
   token. The URL token is removed.
3. `/access` decodes available roles and groups Admin, Event, and App choices.
4. Selecting a role sends `POST /auth/select` with either:
   - `{ type, eventId }`, or
   - `{ type, adminId }`.
5. Requests include credentials. A bootstrap token may also be sent as Bearer.
6. The selected token is written to app-specific localStorage keys and the user
   is redirected to the selected app.
7. Apps read token context from URL/storage and communicate with the API.

Important storage keys:

| Key | Purpose |
| --- | --- |
| `atomx.portal.token` | Access portal/bootstrap token |
| `atomx.dashboard.token` | Dashboard token handoff |
| `atomx.auth.<service>` | Service-specific selected token |
| `atomx.portal.reauth` | Reauthentication return context |
| `atomx_bootstrap_token` | Short-lived bootstrap cookie |
| `atomx.auth.tag-series` | Canonical Tag Series token |
| `atomx.auth.tag_series` | Legacy Tag Series token migrated on read |

The applications warn shortly before JWT expiry and can route through
reauthentication. There is no automatic refresh-token loop in this frontend.
The dashboard API uses both browser credentials and Bearer when available.

## Dashboard Application

### Routes

| Route | Purpose | Data status |
| --- | --- | --- |
| `/` | Dashboard shell/entry | Minimal |
| `/admin` | Event list and selection | API-backed |
| `/admin/Create_event` | Link admin/operator roles | API-backed |
| `/Config` | Vendor and stall configuration | Mostly API-backed |
| `/Config/menu` | Menu/category/item editor | Client-side prototype |
| `/event-edit` | Event settings editor | API-backed |
| `/Reports` | Report filter/download UI | UI only |
| `/transactions` | Transaction filters/results | Filter API-backed |
| `/device` | Event devices | API-backed |
| `/device_masterlist` | Device master search/edit | API-backed |
| `/Blocked` | Blocked ID management | Static data |
| `/apk_upload` | APK upload experience | Client-side/static |
| `/timeline` | Timeline empty state | Static |

### Dashboard API Module

`apps/dashboard/src/lib/dashboardApi.js` centralizes requests. It uses:

- `NEXT_PUBLIC_BASE_URL` through `@atomx/lib`
- `NEXT_PUBLIC_DASHBOARD_API_KEY`
- `credentials: "include"`
- Bearer authorization when a token exists
- GET in-flight de-duplication
- one cookie-only GET retry when a Bearer request fails

Current endpoint helpers:

| Method | Endpoint | Use |
| --- | --- | --- |
| `POST` | `/v1/Operators/Link` | Link operator/admin |
| `GET` | `/v1/Events/Details/:eventId` | Event details |
| `GET` | `/v1/Events/List` | Event list |
| `PATCH` | `/v1/Events/Edit/:eventId` | Edit event |
| `POST` | `/v1/Vendors/Create` | Create vendor |
| `GET` | `/v1/Vendors/List/:eventId` | Event vendors |
| `PATCH` | `/v1/Vendors/Edit/:vendorId` | Edit vendor |
| `POST` | `/v1/Stalls/Create` | Create stall |
| `GET` | `/v1/Stalls/List/Eventwise/:eventId` | Event stalls |
| `GET` | `/v1/Devices/List?code=:eventId&type=:type` | Event devices |
| `GET` | `/v1/Devices/Masterlist/Search?search=...` | Search master devices |
| `POST` | `/v1/Devices/Masterlist/edit` | Edit master device |
| `POST` | `/v1/Devices/AddToStall` | Attach devices to stall |
| `POST` | `/v1/Devices/Perso/Add?code=:eventId` | Personalize/add device |
| `POST` | `/v1/Devices/Perso/Remove?code=:eventId` | Remove device |
| `POST` | `/v1/EventTransactions/Filter` | Search transactions |
| `GET` | `/v1/EventTransactions/Details/:txId` | Fetch expanded transaction details |
| `POST` | `/v1/EventTransactions/UpdateStatus` | Toggle completed/void transaction status |
| `POST` | `/v1/Events/day-close` | Close the selected event day |
| `POST` | `/v1/Events/update-balance-setting` | Update event balance |

Known dashboard gaps:

- Edit Stall currently logs the submitted data and has no update endpoint.
- Reports, Blocked IDs, APK Upload, Menu, and Timeline are not fully API-backed.
- A fallback dashboard API-key value exists in source. This should be removed
  in favor of deployment configuration; never reproduce it in documentation.

## Access Portal Application

Routes:

- `/`: AtomX login screen and token capture
- `/access`: workspace/role selection and cross-app redirect

The access portal owns token selection and handoff, not dashboard business
state. It stores a short-lived bootstrap context, resolves a selected service
token via `/auth/select`, optionally fetches event details, and redirects.

Reauthentication can communicate with an opener using `postMessage`:

```js
{ type: "atomx.auth", service, token, eventId }
```

Signout clears portal/dashboard/auth storage keys and session storage.

## Tag Series Application

Routes:

- `/`: event/client/year-series selection
- `/generate`: ID generation, logging, records, and XLSX export
- `/Admin/View`: records/admin view
- `/Admin/AddFormFactor`: demo form
- `/Admin/AddProduct`: demo form
- `/login`: login entry

All deployed routes are under `/tag_series`.

Current API calls:

| Method | Endpoint |
| --- | --- |
| `GET` | `/v1/TagSeries/CardClients` |
| `GET` | `/v1/TagSeries/Series` |
| `POST` | `/v1/TagSeries/Logs` |
| `GET` | `/v1/TagSeries/BatchRecords` |
| `GET` | `/v1/TagSeries/Events` |

The API helper reads a service token but currently does not add an Authorization
header; it sends the Tag Series API key and browser credentials. `TokenGate`
normalizes/removes URL tokens but currently does not enforce authenticated
access. These are known implementation gaps, not intended security guidance.

Step-one form context is persisted in `sessionStorage` as
`atomx.tag_series.step1`. Excel files are generated in the browser.

## Shared Packages

| Package | Current role |
| --- | --- |
| `@atomx/lib` | Environment metadata, base URL, JWT decode, initials |
| `@atomx/api-client` | Generic GET/POST client with mock-friendly defaults |
| `@atomx/auth` | In-memory/mock auth foundation |
| `@atomx/global-components` | Login/token gate/shell and browser analytics |
| `@atomx/shared-ui` | Basic button/card/heading primitives |
| `@atomx/utils` | Formatting and in-memory feature flags |
| `@atomx/public-assets` | Canonical logo/font/asset manifest |

The generic auth/API packages are not complete replacements for the app-local
production flows. Confirm actual imports before refactoring.

## Analytics

`@atomx/global-components` initializes PostHog and GA4 only after consent stored
at `atomx.analytics.consent.v1`. GA event properties are filtered to avoid
email-like values. New events should follow `docs/analytics-schema.md`.

`posthog-setup-report.md` is historical and contains assumptions from an older
setup. Current source uses browser `posthog-js`, not a server analytics layer.

## Design System In Practice

The current interface uses:

- Poppins for product UI where shared fonts are loaded
- orange `#E04420`
- black `#1C1C1C`
- electric blue `#341CD6`
- light blue `#00A9F2`
- purple `#D5B7FF`
- light gray `#EBEBEB`

Operational screens favor compact white surfaces, subtle borders/shadows,
dark action buttons, gradient icon tiles, a fixed header, and a dark
hover-expanding side drawer. Most icons are inline SVGs; Lucide is not currently
a dependency.

## Change Checklist

Before completing a feature:

- Confirm whether the screen is API-backed or prototype-only.
- Keep event IDs dynamic from query/store/profile.
- Preserve token and cookie behavior.
- Check route case and static-export compatibility.
- Keep localStorage migrations backward compatible.
- Build every affected app.
- Update the relevant README/CONTEXT files when routes, storage, APIs, or
  implementation status change.
