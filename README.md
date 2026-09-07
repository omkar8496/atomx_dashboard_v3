# AtomX Portal Monorepo

AtomX Portal is a browser-first operations suite built as three independent
Next.js static exports. The access portal authenticates a user and selects a
workspace, the dashboard manages event operations, and Tag Series generates
and exports tag batches. Shared packages provide assets, UI, analytics, and
small browser-safe helpers.

This file is the human entry point. Before changing code, also read
[AGENTS.md](./AGENTS.md), [CONTEXT.md](./CONTEXT.md), and the three matching
files inside the app or package being changed.

Last code/documentation audit: **20 August 2026**.

## Repository Map

| Path | Purpose | Router | Dev port |
| --- | --- | --- | --- |
| `apps/access_portal` | Google sign-in, role/workspace selection, token handoff | Pages Router | `3003` |
| `apps/dashboard` | Event, vendor, device, AccessX, transaction, and report operations | App Router | `3000` |
| `apps/tag_series` | Tag-series setup, generation, records, and XLSX export | App Router | `3002` |
| `packages` | Shared assets, UI, analytics, auth/API foundations, and utilities | N/A | N/A |
| `scripts` | Shared-asset synchronization and combined static export | N/A | N/A |
| `docs` | Cross-project analytics and architecture notes | N/A | N/A |

## Technology

- Next.js `16.2.6` and React `19.2.0`
- npm workspaces (`npm@10.9.0`) and Turborepo
- JavaScript/JSX
- Tailwind CSS 4 plus route/component CSS
- Zustand persist in the dashboard only
- PostHog and GA through `@atomx/global-components`
- SheetJS (`xlsx`) for browser workbook generation

All apps use `output: "export"`. They have no Next.js runtime server after
build; browser code calls the AtomX API directly.

## Setup And Commands

Use Node.js compatible with Next.js 16 and run commands from the repository
root:

```bash
npm install
npm run dev
```

Common commands:

```bash
npm run dev:dashboard
npm run dev:access
npm run dev:tag_series
npm run build
npm run build:dashboard
npm run build:access
npm run build:tag_series
npm run build:out
npm run lint
npm run sync:public
```

`npm run build:out` rebuilds all apps and assembles the deployable static site
in root `out/`. It removes generated app/root `out/` directories first; never
keep hand-authored files there.

## Environment

Each app loads the root `.env`. Variable names currently used include:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_BASE_URL` | AtomX API base URL |
| `NEXT_PUBLIC_DASHBOARD_API_KEY` | Dashboard `x-api-key` value |
| `NEXT_PUBLIC_TAG_SERIES_API_KEY` | Tag Series `x-api-key` value |
| `NEXT_PUBLIC_DASHBOARD_BASEPATH` | Optional dashboard static base path |
| `NEXT_PUBLIC_ACCESS_PORTAL_URL` | Access portal destination |
| `NEXT_PUBLIC_ACCESS_ADMIN_URL` | Admin dashboard destination |
| `NEXT_PUBLIC_DASHBOARD_URL` | Dashboard destination |
| `NEXT_PUBLIC_TAG_SERIES_URL` | Tag Series destination |
| `NEXT_PUBLIC_PORTAL_URL` | General portal destination |
| `NEXT_PUBLIC_LIVELINK_URL` | LiveLink destination |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | PostHog browser config |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 browser config |
| `NEXT_PUBLIC_DEV_PORTAL_TOKEN` | Optional local bootstrap token |
| `NEXT_PUBLIC_DEV_TOKEN_BUTTON` | Enables the local token control |

Every `NEXT_PUBLIC_*` value is bundled into public browser JavaScript. Do not
put private secrets there or copy environment values into documentation.

## State And Session Model

The dashboard uses a persisted Zustand store named `atomx.dashboard.store`.
The access portal and Tag Series use React state plus browser storage. There is
no Redux store and no React Query cache.

The session flow is:

1. Access Portal captures a Google/bootstrap token.
2. Workspace selection calls `POST /auth/select`.
3. The selected token is stored under destination-specific localStorage keys.
4. The destination reads URL/storage context and sends browser API requests.
5. All live API clients use `credentials: "include"`; the dashboard also adds
   a Bearer token when its persisted token exists.
6. Dashboard GET requests may retry once without Bearer after `401`/`403`,
   allowing the cookie session to authenticate. Mutations do not retry.

Cookies are attached by the browser; Bearer headers are still built by the
frontend. There is expiry warning and reauthentication, but no silent refresh
loop in this repository.

## Shared Assets

Canonical assets live in `packages/public-assets`. `npm run sync:public`
replaces generated `apps/*/public/shared` copies. Edit the package source, not
the generated app copies.

## Verification

There is no automated unit/integration test suite. Build each affected app and
manually verify browser behavior, direct static navigation, loading/error/empty
states, responsive layouts, and authentication handoff. For shared changes run:

```bash
npm run build
```

## Documentation Index

- [Repository agent rules](./AGENTS.md)
- [Repository architecture/context](./CONTEXT.md)
- [Dashboard guide](./apps/dashboard/README.md)
- [Dashboard implementation context](./apps/dashboard/CONTEXT.md)
- [Access Portal guide](./apps/access_portal/README.md)
- [Tag Series guide](./apps/tag_series/README.md)
- [Shared packages guide](./packages/README.md)
- [Analytics schema](./docs/analytics-schema.md)

`posthog-setup-report.md` is historical and is not the source of truth for the
current shared browser analytics implementation.
