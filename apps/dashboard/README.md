# AtomX Dashboard

The Dashboard is the main event-operations application. It contains event
selection and editing, vendor/stall configuration, device operations,
transactions, reports, blocked IDs, APK uploads, menu setup, and related admin
screens.

Read the root `README.md`, `AGENTS.md`, and `CONTEXT.md`, then this app's
[CONTEXT.md](./CONTEXT.md) before changing behavior.

## Run

From the repository root:

```bash
npm run dev:dashboard
npm run build:dashboard
```

The development server uses port `3000`.

## Stack

- Next.js App Router
- React 19
- Static export with optional dashboard base path
- Zustand with persisted localStorage state
- Tailwind CSS 4 plus page/component CSS
- `xlsx` where browser workbook support is needed
- Shared AtomX components, helpers, fonts, logos, and analytics

## Routes

| Route | Screen |
| --- | --- |
| `/admin` | Event list and selection |
| `/admin/Create_event` | Admin/operator role linking |
| `/Config` | Vendor and stall configuration |
| `/Config/menu` | Menu/category/item editor |
| `/event-edit` | Event settings |
| `/Reports` | Report filters |
| `/transactions` | Transaction filters/results with on-demand row details |
| `/device` | Event device list |
| `/device_masterlist` | Device Master List |
| `/Blocked` | Blocked IDs |
| `/apk_upload` | APK uploads |
| `/timeline` | Timeline |

Route casing is part of the static URL contract.

## State Management

The app uses Zustand `persist` in `src/store/dashboardStore.js`.

Storage key:

```text
atomx.dashboard.store
```

Persisted state includes the selected token/profile, event metadata/details,
selected service, and vendor/stall caches keyed by event ID. Component-only
state stays in React.

An IndexedDB draft utility exists, but current screens do not use it.

## API

Use `src/lib/dashboardApi.js` for dashboard API calls. Requests use:

- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_DASHBOARD_API_KEY`
- `credentials: "include"`
- a Bearer token when present

The API module includes GET de-duplication and a cookie-only GET retry. Do not
hardcode event IDs in components.

See [CONTEXT.md](./CONTEXT.md) for the endpoint inventory and live/prototype
status of each screen.

## UI Shell

The app shell uses:

- a fixed AtomX header
- profile/session controls
- a dark hover-expanding side drawer
- responsive content below the header
- Poppins and the shared AtomX palette

Reuse these components rather than creating route-specific shells.

## Verification

There is no automated test suite. Build the app and manually verify affected
routes:

```bash
npm run build:dashboard
```
