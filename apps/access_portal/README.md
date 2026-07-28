# Access Portal

The Access Portal is the authentication and workspace-selection entry point for
AtomX Portal. It captures the Google-auth token, presents roles/services, asks
the API for a selected-service token, and redirects into the dashboard or Tag
Series application.

Read the repository root documentation first, then
[CONTEXT.md](./CONTEXT.md) for implementation details.

## Run

From the repository root:

```bash
npm run dev:access
npm run build:access
```

The development server uses port `3003`.

## Stack

- Next.js Pages Router
- React client-side state
- Static export
- `@atomx/global-components`
- `@atomx/lib`
- Browser localStorage, sessionStorage, and cookies

There is no Redux or Zustand store in this app.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Login screen, Google auth start, returned-token capture |
| `/access` | Role/workspace selection and redirect |

## Main Flow

1. Start Google sign-in.
2. Capture and decode the returned URL token.
3. Store the portal/bootstrap token and remove it from the URL.
4. Decode available roles on `/access`.
5. Select an Admin, Event, or application workspace.
6. Call `POST /auth/select`.
7. Store the selected token under the destination app's key.
8. Redirect to `/admin`, `/Config/`, or `/tag_series/`.

All runtime authentication happens in the browser. API requests use
`credentials: "include"` and may include a bootstrap Bearer token.

## Environment

The app loads the root `.env`. The most relevant variables are:

- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_ACCESS_PORTAL_URL`
- `NEXT_PUBLIC_ACCESS_ADMIN_URL`
- `NEXT_PUBLIC_DASHBOARD_URL`
- `NEXT_PUBLIC_TAG_SERIES_URL`
- PostHog and GA browser variables

Do not put private secrets in `NEXT_PUBLIC_*`.

## Verification

Verify login redirect, URL-token cleanup, role grouping, each destination
redirect, popup reauthentication, expiry warning, and signout cleanup.
