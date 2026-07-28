# Tag Series Agent Instructions

These rules supplement the repository root `AGENTS.md`.

## Architecture

- Preserve the `/tag_series` basePath and assetPrefix.
- Keep the app compatible with static export.
- Use React state for view/form state and the existing browser-storage contract
  for cross-route context.
- Keep browser Excel generation off the server path.
- Maintain compatibility between `atomx.auth.tag-series` and the migrated
  legacy `atomx.auth.tag_series` key.

## API And Authentication

- Add Tag Series endpoints in the app-local API module.
- Keep `credentials: "include"` unless the backend contract changes.
- Current request headers do not send the read service token as Authorization.
  Treat that as a known gap; do not describe the route as Bearer-protected
  without implementing and testing it.
- Current `TokenGate` normalizes URL token state but does not enforce access.
- Never hardcode event/admin IDs used by API requests.

## Verification

Run:

```bash
npm run build:tag_series
```

Verify both canonical and direct base-path navigation, API loading/empty/error
states, sessionStorage restoration, ID generation, and XLSX output.
