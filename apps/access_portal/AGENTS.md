# Access Portal Agent Instructions

These rules supplement the root `AGENTS.md`.

## Ownership

This app owns login presentation, Google-auth entry, bootstrap token capture,
role/workspace selection, selected-token storage, cross-app handoff,
reauthentication return, and signout cleanup. It does not own dashboard event
business state.

## Change Rules

- Preserve Pages Router and static-export compatibility.
- Keep URL tokens short-lived and remove them after capture.
- Preserve canonical and compatibility storage keys across all apps.
- Keep `credentials: "include"` on session/auth requests.
- Keep `/auth/select` payloads exact: admin uses `adminId`, event/module uses
  `eventId` as required by its permission record.
- Verify both full-page redirect and popup `postMessage` return modes.
- Never log JWTs, decoded role payloads, cookies, or API-key values.
- Use shared consent-aware analytics; do not initialize duplicate clients.

## Verification

Run `npm run build:access`, then manually test `/`, `/access`, every destination
type, token cleanup/storage, reauth, expiry, theme, and logout.
