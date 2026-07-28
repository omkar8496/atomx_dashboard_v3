# Dashboard Agent Instructions

These rules supplement the repository root `AGENTS.md`.

## Architecture

- This app uses the App Router and static export.
- Keep route/page wrappers small. Put interactive behavior in `"use client"`
  components.
- Use `src/lib/dashboardApi.js` for AtomX API traffic.
- Use `src/store/dashboardStore.js` only for cross-route or reload-persistent
  state.
- Use React state for local forms, filters, view modes, and modals.
- Keep event ID and service context dynamic from query parameters, decoded
  profile, or Zustand state.

## API Work

- Preserve browser credentials and existing Bearer behavior.
- Add endpoint wrappers in the API module before wiring components.
- For mutations, show actionable pending/error/success states and refresh the
  relevant persisted cache.
- Do not restore the obsolete stall list route. Event stalls use
  `/v1/Stalls/List/Eventwise/:eventId`.
- Device Master List edits use `POST /v1/Devices/Masterlist/edit` with the
  complete editable device payload.
- Do not claim Edit Stall is implemented until an actual update endpoint is
  connected.

## UI Work

- Reuse `Header` and `SideDrawer`; do not make duplicate navigation shells.
- Account for the fixed header when positioning route content.
- Keep operational screens compact enough for 50+ records.
- Prevent horizontal overflow unless a data table intentionally owns a labeled
  horizontal scroll area.
- Preserve exact route casing in links.
- Keep icon-only actions accessible with labels/tooltips.

## Security And Storage

- Never display or log full JWTs, device/bank passwords, or API-key values.
- When changing persisted store shape, add a safe migration/default path.
- Keep `atomx.dashboard.token` and `atomx.dashboard.store` compatible with the
  Access Portal handoff.
- The API-key fallback in source is technical debt; do not copy or expand it.

## Verification

Run:

```bash
npm run build:dashboard
```

Manually verify both card and row/table views where present, sidebar links,
session expiry/reauth, loading/error/empty states, and static direct navigation.
