# Agent Instructions

These rules apply to the whole monorepo. A nearer `AGENTS.md` adds local rules
and takes precedence for its directory.

## Read First

1. Read root `README.md` and `CONTEXT.md`.
2. Read `README.md`, `CONTEXT.md`, and `AGENTS.md` in the target app/package.
3. Inspect `git status`; the worktree may contain intentional user changes.
4. Read the actual route, API wrapper, state store, and surrounding components.
5. Treat current code as authoritative if old prose disagrees, then update the
   relevant documentation with the implementation change.

## Repository Safety

- Never revert, overwrite, or broadly reformat unrelated work.
- Keep edits within the requested app and existing ownership boundaries.
- Run npm commands from the repository root.
- Never commit `.env`, tokens, API-key values, bank credentials, session data,
  `.next/`, or generated `out/` output.
- Do not edit generated `apps/*/public/shared` assets. Edit
  `packages/public-assets` and run `npm run sync:public`.
- `npm run build:out` is destructive only to generated export directories.

## Static Export Constraints

- All three apps are static exports. Do not add runtime API routes, server
  actions, `getServerSideProps`, or middleware requiring a Next.js server.
- App Router interactivity belongs in explicit `"use client"` components.
- Browser-only APIs must be guarded from build-time execution.
- Preserve route casing (`/Config`, `/Reports`, `/Blocked`) because exported
  filesystem paths are case-sensitive.

## API And State Rules

- Put dashboard endpoints in `apps/dashboard/src/lib/dashboardApi.js`; keep
  Tag Series calls in its app-local API module.
- Preserve `credentials: "include"` and the existing Bearer/cookie behavior.
- Event, admin, transaction, stall, and whitelist IDs must come from current
  query/store/profile/record context, never sample fallback IDs.
- Normalize variable API envelopes close to the API call or in a focused
  adapter.
- Give user-triggered requests loading, error, empty, and success feedback.
- Do not silently substitute demo data on an API-backed screen.
- Use dashboard Zustand only for cross-route or reload-persistent data. Keep
  forms, filters, modals, drag state, and view modes in React component state.
- Preserve storage-key compatibility or add an explicit migration.

## Security

- Never log or document full JWTs, API keys, device/bank passwords, or auth
  payloads containing credentials.
- `NEXT_PUBLIC_*` configuration is public.
- Device Master List contains static default payment credentials in client
  code. Treat this as sensitive technical debt; do not duplicate the values.
- The dashboard API-key source fallback is also technical debt; do not copy it.

## UI And Branding

- Reuse the shared dashboard header and hover drawer.
- Follow the AtomX palette: orange `#E04420`, black `#1C1C1C`, electric blue
  `#341CD6`, light blue `#00A9F2`, purple `#D5B7FF`, gray `#EBEBEB`.
- Use Poppins where shared product fonts are loaded.
- Operational pages should be compact, aligned, responsive, and easy to scan
  with 50+ records.
- Keep horizontal scrolling inside the table that owns it.
- Icon-only controls need accessible names/tooltips and stable dimensions.

## Verification

There is no automated test suite. At minimum:

1. Build every affected app.
2. Build all consumers after shared-package changes.
3. Check narrow and wide layouts for frontend changes.
4. Verify direct static navigation, session handoff, and API states.
5. Run `git diff --check` and report anything not verified.

```bash
npm run build:dashboard
npm run build:access
npm run build:tag_series
npm run build
npm run lint
```

## Current Product Boundaries

- Dashboard is the only Zustand consumer.
- Access Portal is the production token/workspace handoff owner.
- `@atomx/auth` and `@atomx/api-client` are generic/mock-oriented foundations,
  not the sole live session/data path.
- Several routes still contain local-only prototypes. Confirm implementation
  status in `apps/dashboard/CONTEXT.md` before promising persistence.
- Shared analytics is browser-only and consent-aware; use
  `docs/analytics-schema.md` for new events.
