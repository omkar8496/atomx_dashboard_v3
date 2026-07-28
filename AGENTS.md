# Agent Instructions

These instructions apply to the entire repository. A nearer `AGENTS.md` inside
an app or package adds local rules and takes precedence for that directory.

## Read First

1. Read the root `README.md` and `CONTEXT.md`.
2. Read the `README.md`, `CONTEXT.md`, and `AGENTS.md` in the app being changed.
3. Inspect the current working tree. It may contain intentional uncommitted
   changes from another contributor.
4. Treat current source code as authoritative when documentation and code
   disagree. Update the documentation when behavior changes.

## Repository Safety

- Do not revert, overwrite, or reformat unrelated work.
- Keep changes scoped to the requested app, shared package, or API boundary.
- Use npm from the repository root; this is an npm-workspaces monorepo.
- Never commit `.env`, tokens, API-key values, session data, generated `out/`,
  or `.next/` output.
- Do not manually edit generated `public/shared` assets. Edit
  `packages/public-assets`, then run `npm run sync:public`.
- `npm run build:out` deletes generated app/root `out/` directories before
  assembling a new combined export.

## Architecture Constraints

- All three apps use Next.js static export. Do not add API routes, middleware
  that requires a Node server, server actions, `getServerSideProps`, or other
  runtime-server dependencies unless the deployment architecture is changed.
- Interactive App Router modules need `"use client"`. Route/layout wrappers
  without it are build-time/server components even though the deployed product
  is a static client application.
- Browser API requests should stay in the existing API modules. Do not scatter
  raw endpoint calls through visual components.
- Preserve `credentials: "include"` where the current API/session contract
  depends on browser cookies.
- Never log full tokens, passwords, bank data, or authentication payloads.
- `NEXT_PUBLIC_*` is browser-visible. Do not treat those variables as secrets.

## State Ownership

- Dashboard cross-route state belongs in its persisted Zustand store only when
  it must survive route changes/reloads.
- Temporary view, form, dropdown, and modal state belongs in React component
  state.
- Access Portal and Tag Series currently use React state and browser storage;
  do not introduce a second global-state system without a demonstrated need.
- Keep browser-storage keys backward compatible or include an explicit
  migration. Authentication keys are part of the cross-app contract.

## UI And Branding

- Follow the established AtomX visual language rather than introducing a new
  design system.
- Primary palette: orange `#E04420`, black `#1C1C1C`, electric blue
  `#341CD6`, light blue `#00A9F2`, purple `#D5B7FF`, and light gray
  `#EBEBEB`.
- Poppins is the product font where shared fonts are loaded.
- Keep dense operational pages compact, aligned, responsive, and scan-friendly.
- Reuse existing header, side drawer, field, button, and icon patterns before
  adding variants.
- Route casing is significant in the static export. Keep paths such as
  `/Config`, `/Reports`, and `/Blocked` exact.

## API Changes

- Confirm method, endpoint, request body, authentication headers, and response
  shape in the app API module before changing UI behavior.
- Event IDs must come from route/query/store context, never from a hardcoded
  sample ID.
- Normalize uncertain API response envelopes at the API boundary or a small
  dedicated adapter.
- Handle loading, empty, error, and success states for user-triggered requests.
- Do not add silent fallback data to an API-backed production screen unless it
  is explicitly identified as demo data.

## Verification

There is no automated test suite at present. At minimum:

1. Build every app affected by the change.
2. Build consumers of any changed shared package.
3. Check both narrow and wide layouts for frontend changes.
4. Verify static-export routes and browser-only APIs.
5. Report any verification that could not be completed.

Useful commands:

```bash
npm run build:dashboard
npm run build:access
npm run build:tag_series
npm run build
npm run lint
```

## Current Boundaries

- The dashboard is the only app using Zustand.
- The shared auth and API-client packages contain generic/mock-oriented
  foundations; they are not the sole production auth/API path.
- Some dashboard screens are UI prototypes with static data. Do not describe
  them as API-backed until they are actually wired.
- Shared analytics is consent-aware and browser-only. Follow
  `docs/analytics-schema.md` when adding events.
