# Access Portal Agent Instructions

These rules supplement the repository root `AGENTS.md`.

## Ownership

This app owns:

- login presentation and Google-auth entry
- bootstrap token capture
- role/workspace selection
- selected-service token handoff
- reauthentication return messaging
- signout cleanup

It does not own dashboard business data or Tag Series domain state.

## Change Rules

- Preserve the Pages Router structure.
- Keep the app compatible with static export.
- Keep URL tokens short-lived and remove them from the address bar after
  capture.
- Never print JWTs or role payloads to the console.
- Keep localStorage key aliases/migrations compatible across all apps.
- Keep `credentials: "include"` on auth/session requests.
- When changing `/auth/select`, verify both Admin and Event payload forms.
- Test popup/opener `postMessage` and normal full-page redirect paths.
- Use shared analytics and consent handling instead of direct duplicate setup.

## Verification

Run:

```bash
npm run build:access
```

Then manually verify `/`, `/access`, each service redirect, reauth, session
expiry handling, and signout.
