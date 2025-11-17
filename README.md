## AtomX Dashboard v3 Monorepo

This repository now hosts a poly-repo style workspace built with Turborepo + npm workspaces. Two fully isolated Next.js apps (`livelink` and `tag_series`) live beside a set of shared packages for UI, auth, API clients, utilities, and shared public assets.

```
apps/
  access_portal/  → shared access landing (`/access`)
  livelink/        → streaming control surface
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
npm run dev:livelink
npm run dev:tag_series
npm run build:livelink
npm run build:tag_series
```

### Turborepo tasks

```bash
npm run dev        # runs both apps in parallel (filtered via turbo)
npm run build      # builds everything respecting dependency graph
npm run lint       # placeholder if/when Next lint is configured
```

### Auth & API strategy

- Per-project auth screens live at `apps/<project>/app/(auth)/login/page.js`.
- Shared authentication helpers live in `packages/auth` and can be reused or swapped for a real identity provider later.
- `packages/api` exposes `createApiClient` + route metadata so every app (and even shared packages) can consume consistent endpoints.

### Shared assets

`packages/public-assets` holds SVGs and other static files. After install (or by running `npm run sync:public`) those files are mirrored into each app under `public/shared`, so each deployment can live on its own domain without fighting for assets.

### Custom libs & utils

Every app has a local `lib/`, `utils/`, and `api/` folder for project-specific code while `packages/lib` + `packages/utils` expose cross-project helpers. Use whichever makes sense and keep domain-specific logic close to the owning app.
