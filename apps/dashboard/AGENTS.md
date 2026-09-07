# Dashboard Agent Instructions

These rules supplement the repository root `AGENTS.md`.

## Source Orientation

- Routes: `src/app/**/page.js`
- Shared shell: `src/component/header.js`, `src/component/SideDrawer.js`
- API behavior: `src/lib/apiClient.js`, `src/lib/dashboardApi.js`
- Cross-route state: `src/store/dashboardStore.js`
- Session lifecycle: `src/component/SessionGuard.js`
- Device option/default data: Device Master List component files

Read these files before changing a dashboard workflow.

## Architecture

- Keep App Router pages/static export compatible.
- Put interactive behavior in explicit `"use client"` modules.
- Keep route wrappers small and business behavior in focused components.
- Use Zustand only for state that must cross routes or survive reload.
- Keep local form/filter/modal/drag/view state in React.
- Reuse `Header` and `SideDrawer`; account for the fixed 58px header.

## API Rules

- Add/modify endpoint wrappers in `dashboardApi.js` first.
- Preserve the common `ApiError`, `credentials: "include"`, API-key, Bearer,
  GET de-duplication, and cookie-only GET retry behavior.
- Never use a hardcoded event ID fallback. Resolve current event context from
  query parameters, Zustand event state, decoded profile, or the selected row.
- Stall lists must use `/v1/Stalls/List/Eventwise/:eventId`.
- Stall menu loads must use the selected stall ID in `/v1/Items/List/:stallId`.
- Whitelist search uses dynamic event ID; history uses the selected result's
  own `id` as `wid`.
- Transaction detail fetches are lazy per expanded row. Only `completed` and
  `void` may toggle status.
- Device Master List add/edit must send the complete device form plus the
  selected bank credential object.
- Report build currently sends the selected Event/Vendor and Type labels
  exactly; do not silently remap without a confirmed backend contract.

## Current Persistence Boundaries

- Vendor create/edit and stall create are live; Edit Stall has no update API.
- AccessX category create/edit and gate-master create/edit are live.
- Access Gate Config editing currently calls the gate-master edit endpoint for
  the associated gate master. There is no separate gate-config mutation.
- Menu load is live, but category/item edits, additions, drag order, and Save
  are browser state only. XLSX download is browser-local.
- Blocked IDs, APK uploads, Timeline, and Patcha remain local/prototype screens.
- TapX wallet fetch exists but its drawer entry is hidden.

Do not present local-only interactions as persisted behavior.

## Security

- Never log tokens, passwords, complete bank data, or API-key values.
- Static default bank credentials in client code are sensitive technical debt.
- Do not reproduce credential values in tests, docs, UI screenshots, or error
  messages.
- `NEXT_PUBLIC_*` values are public browser data.

## UI Rules

- Preserve AtomX typography/palette and the compact operational style.
- Design lists for 50+ records and keep table scroll within its container.
- Reuse existing gradient icon tiles sparingly; action buttons are usually
  solid black/orange.
- Icon-only actions need `aria-label`/title text and stable dimensions.
- Test dropdowns/modals near viewport edges and drawer-expanded widths.

## Verification

Run `npm run build:dashboard` and `git diff --check`. Manually verify:

- direct static navigation and route casing
- current event ID propagation
- API pending/error/empty/success states
- auth expiry, reauth, logout, and cookie/Bearer behavior
- desktop and mobile layouts
- card/list toggles, horizontal tables, modals, and drag behavior as applicable
