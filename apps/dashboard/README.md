# AtomX Dashboard

The Dashboard is the main event-operations application. It manages events,
roles, vendors, stalls, menus, AccessX configuration, devices, transactions,
whitelists, reports, blocked IDs, and event settings.

Read the root docs first, then [AGENTS.md](./AGENTS.md) and
[CONTEXT.md](./CONTEXT.md). The context file is the detailed source of truth for
route/API status.

Last code/documentation audit: **20 August 2026**.

## Run

From the repository root:

```bash
npm run dev:dashboard
npm run build:dashboard
```

Development uses `http://localhost:3000`. The app is an App Router static
export with an optional `NEXT_PUBLIC_DASHBOARD_BASEPATH`.

## Stack And Architecture

- Next.js App Router and React 19
- Zustand persist for cross-route dashboard state
- React state for forms, filters, modals, view controls, and drag ordering
- Tailwind CSS 4 plus route/component CSS
- Shared AtomX header, drawer, assets, Poppins fonts, loader, and analytics
- `xlsx` for browser-generated menu workbooks

API requests belong in `src/lib/dashboardApi.js` and use the common client in
`src/lib/apiClient.js`. Do not add raw production endpoint calls to visual
components.

## Active Navigation

The current SideDrawer exposes:

| Order | Label | Route |
| --- | --- | --- |
| 1 | Device Master | `/device_masterlist` |
| 2 | Configuration | `/Config` |
| 3 | Whitelist | `/whitelist` |
| 4 | Admin | `/admin/Create_event` |
| 5 | Reports | `/Reports` |
| 6 | Transactions | `/transactions` |
| 7 | Devices | `/device` |
| 8 | Blocked | `/Blocked` |

Analytics, APK Uploads, TapX-Transactions, and Patcha-NY-Track are commented
out in the drawer. Their route files may still build. Route casing is part of
the static URL contract.

## State

`src/store/dashboardStore.js` persists under:

```text
atomx.dashboard.store
```

It stores token/profile, event metadata/details, selected service, and vendor
and stall caches keyed by event ID. `atomx.dashboard.token` remains part of the
Access Portal handoff contract. There is no Redux or React Query.

## Authentication And API

Every request defaults to `credentials: "include"`, so the browser sends
matching cookies. When Zustand has a token, the frontend also sends Bearer
authorization. Tokenized GET requests can retry once cookie-only after
`401`/`403`; mutations cannot. There is no silent refresh.

The API client adds `x-api-key` from public dashboard configuration and wraps
failures in `ApiError` with normalized user-facing messages. Never hardcode an
event/stall/transaction/whitelist ID.

## Key Live Workflows

- Event selection and event detail editing
- Admin/operator linking plus API-backed grouped history
- Vendor/stall lists, creation, vendor editing, device attachment
- AccessX category and gate-master configuration
- Stall menu loading with category/item matching and local drag reordering
- Device list/personalization and Device Master List add/edit
- Transaction filtering, lazy row details, and completed/void status changes
- Whitelist search and per-record history
- Report request creation, list refresh, and linked report downloads
- Event balance-setting update and day close

Some routes and controls are still local-only prototypes. See
[CONTEXT.md](./CONTEXT.md) before extending them.

## Verification

There is no automated test suite. Run:

```bash
npm run build:dashboard
```

Manually check the changed route, both compact card/list modes where present,
API loading/error/empty states, dynamic ID selection, drawer navigation,
reauthentication, and narrow/wide layouts.
