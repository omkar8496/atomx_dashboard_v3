# AtomX Access Portal

The Access Portal is the browser authentication and workspace-selection entry
point for AtomX. It starts Google sign-in, captures the returned bootstrap
token, presents decoded role/service choices, calls `/auth/select`, stores the
selected service token, and redirects or posts it back to the destination app.

Last code/documentation audit: **20 August 2026**.

## Run

```bash
npm run dev:access
npm run build:access
```

Development uses port `3003`. This app uses the Next.js Pages Router and static
export. It has no Redux/Zustand store; state is React plus browser storage.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Login UI, Google auth start, URL-token capture/cleanup |
| `/access` | Role/workspace selection, service-token request, handoff |

## Main Flow

1. Start `GET /auth/google/start` with app/redirect context.
2. Decode the returned URL token and store it as the portal/app token.
3. Remove the token from the address bar.
4. Group decoded roles on `/access`.
5. Call `POST /auth/select` with `{type, adminId}` or `{type, eventId}`.
6. Store a returned selected token under destination-compatible keys.
7. Optionally load selected event details.
8. Redirect normally or return auth through `window.opener.postMessage`.

Requests use `credentials: "include"`; selection can also send the short-lived
bootstrap cookie token as Bearer authorization.

## Environment

Important public variables include `NEXT_PUBLIC_BASE_URL`, destination URLs,
dashboard API-key config, analytics config, and optional development-token
controls. All `NEXT_PUBLIC_*` values are public browser configuration.

## Verification

Build, then verify Google redirect, URL-token removal, admin/event/service
selection, destination URLs, event hydration, popup reauth, expiry warning,
theme persistence, and complete signout cleanup.
