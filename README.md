# AtomX Portal Monorepo

AtomX Portal is a client-facing web monorepo containing the access portal, the
main event dashboard, and the Tag Series application. The applications are
separate Next.js static exports that share branding, authentication helpers,
analytics, assets, and utility packages.

This file is the entry point for people. AI agents and automation should also
read [AGENTS.md](./AGENTS.md) and [CONTEXT.md](./CONTEXT.md), followed by the
matching files inside the app being changed.

## Repository Map

| Path | Purpose | Router | Local port |
| --- | --- | --- | --- |
| `apps/access_portal` | Google sign-in, role/workspace selection, token handoff | Pages Router | `3003` |
| `apps/dashboard` | Event operations dashboard and configuration tools | App Router | `3000` |
| `apps/tag_series` | Tag-series generation, records, and browser Excel export | App Router | `3002` |
| `packages` | Shared UI, auth/API helpers, analytics, assets, and utilities | N/A | N/A |
| `scripts` | Shared asset synchronization and combined static export | N/A | N/A |
| `docs` | Cross-project product and analytics documentation | N/A | N/A |

## Technology

- Next.js `16.2.6`
- React `19.2.0`
- npm workspaces with Turborepo `2.6`
- Tailwind CSS `4`
- JavaScript/JSX
- Zustand in the dashboard only
- PostHog and Google Analytics through `@atomx/global-components`
- SheetJS (`xlsx`) for Tag Series browser exports

The apps are configured with `output: "export"`. They do not require a Next.js
runtime server after building. Browser code calls the AtomX API directly.

## Getting Started

Requirements:

- Node.js compatible with Next.js 16
- npm `10.9.0` or a compatible npm 10 release
- A root `.env` containing the required public runtime configuration

Install and run all apps:

```bash
npm install
npm run dev
```

Run one app:

```bash
npm run dev:dashboard
npm run dev:access
npm run dev:tag_series
```

## Common Commands

```bash
npm run build
npm run build:dashboard
npm run build:access
npm run build:tag_series
npm run build:out
npm run lint
npm run sync:public
```

`npm run build:out` rebuilds all applications and assembles the deployable
static site in the root `out/` directory. It deletes generated `out/`
directories before rebuilding; do not keep hand-authored files there.

## Environment Variables

Every app's Next config loads the root `.env`. Only names are documented here:

| Variable | Use |
| --- | --- |
| `NEXT_PUBLIC_BASE_URL` | AtomX API base URL |
| `NEXT_PUBLIC_DASHBOARD_API_KEY` | Dashboard API-key header |
| `NEXT_PUBLIC_TAG_SERIES_API_KEY` | Tag Series API-key header |
| `NEXT_PUBLIC_DASHBOARD_BASEPATH` | Optional dashboard static base path |
| `NEXT_PUBLIC_ACCESS_PORTAL_URL` | Access portal URL |
| `NEXT_PUBLIC_ACCESS_ADMIN_URL` | Admin access/redirect URL |
| `NEXT_PUBLIC_DASHBOARD_URL` | Dashboard URL |
| `NEXT_PUBLIC_TAG_SERIES_URL` | Tag Series URL |
| `NEXT_PUBLIC_PORTAL_URL` | General portal URL |
| `NEXT_PUBLIC_LIVELINK_URL` | LiveLink target URL |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog browser project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 measurement ID |
| `NEXT_PUBLIC_DEV_PORTAL_TOKEN` | Optional local development token |
| `NEXT_PUBLIC_DEV_TOKEN_BUTTON` | Optional local token UI flag |

All `NEXT_PUBLIC_*` values are bundled into browser code. They must be treated
as public configuration, not server secrets. Do not commit `.env` values or
copy token/API-key values into documentation.

## State And Authentication

The dashboard uses a persisted Zustand store (`atomx.dashboard.store`) for its
token, decoded profile, event metadata/details, selected service, vendors, and
stalls. The access portal and Tag Series use React state plus browser storage.
There is no Redux store.

Authentication is browser-based:

1. The access portal starts Google authentication.
2. A returned bootstrap token is stored in browser storage/cookie context.
3. Role/workspace selection calls `/auth/select`.
4. The selected service token is stored under app-specific localStorage keys.
5. The destination app reads the URL/storage token and calls the API with
   `credentials: "include"`; the dashboard also sends a Bearer token when one
   is available.

There is session-expiry warning and reauthentication, but no silent refresh
loop in this repository. See [CONTEXT.md](./CONTEXT.md) for the exact keys and
flow.

## Shared Assets

Canonical shared assets live in `packages/public-assets`. Running
`npm run sync:public` replaces each app's generated `public/shared` folders.
Edit the canonical source, not generated copies.

## Verification

There is currently no automated unit or integration test suite. For code
changes, run the build for every affected app and manually verify important
browser flows. For cross-package changes, run:

```bash
npm run build
```

## Documentation

- [AGENTS.md](./AGENTS.md): repository rules for AI agents and contributors
- [CONTEXT.md](./CONTEXT.md): detailed architecture and implementation status
- [apps/access_portal/README.md](./apps/access_portal/README.md)
- [apps/dashboard/README.md](./apps/dashboard/README.md)
- [apps/tag_series/README.md](./apps/tag_series/README.md)
- [packages/README.md](./packages/README.md)
- [docs/analytics-schema.md](./docs/analytics-schema.md)

`posthog-setup-report.md` is a historical setup report and does not fully match
the current browser-only shared analytics implementation.
