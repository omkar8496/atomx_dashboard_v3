## AtomX Dashboard v3 Monorepo

This repository hosts an AtomX monorepo built with Turborepo + npm workspaces. The current checkout contains three Next.js apps beside shared packages for UI, auth helpers, API clients, utilities, and public assets.

```
apps/
  access_portal/  → shared access landing (`/access`)
  dashboard/       → operations/admin dashboard
  tag_series/      → IoT analytics console
packages/
  shared-ui/       → reusable design system pieces
  global-components/ → layout, auth panel, footer
  auth/            → shared login helpers + config
  api/             → API client + routing info
  lib/             → copy + environment helpers
  utils/           → formatting + feature flags
  public-assets/   → logos/assets synced into each app/public/shared
```

### Install & bootstrap

```bash
npm install        # installs root + workspace deps and syncs shared public assets
```

### Run or build a single app

```bash
npm run dev:access
npm run dev:dashboard
npm run dev:tag_series
npm run build:access
npm run build:dashboard
npm run build:tag_series
```

### Turborepo tasks

```bash
npm run dev        # runs workspace app dev tasks in parallel
npm run build      # builds everything respecting dependency graph
npm run lint       # runs lint tasks where configured
```

### Auth & API strategy

- App-router auth screens live at `apps/<project>/app/(auth)/login/page.js`; the access portal currently uses the pages router.
- Shared authentication helpers live in `packages/auth` and can be reused or swapped for a real identity provider later.
- `packages/api` exposes `createApiClient` + route metadata so every app (and even shared packages) can consume consistent endpoints.

### Shared assets

`packages/public-assets` holds SVGs and other static files. After install (or by running `npm run sync:public`) those files are mirrored into each app under `public/shared`, so each deployment can live on its own domain without fighting for assets.

### Custom libs & utils

Every app has a local `lib/`, `utils/`, and `api/` folder for project-specific code while `packages/lib` + `packages/utils` expose cross-project helpers. Use whichever makes sense and keep domain-specific logic close to the owning app.
