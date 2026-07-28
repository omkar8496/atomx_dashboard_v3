# Access Portal Context

## Runtime Model

This is a Next.js Pages Router static export. The browser performs OAuth
handoff, token storage, role selection, API calls, and cross-app navigation.
There is no app-local global state library.

## Token And Storage Behavior

The login page receives a token in the URL, decodes it, stores it, and removes
the URL parameter. Relevant keys include:

- `atomx.portal.token`
- `atomx.auth.<appId>`
- `atomx.dashboard.token`
- `atomx.auth.tag-series`
- legacy `atomx.auth.tag_series`
- `atomx.portal.reauth`
- cookie `atomx_bootstrap_token`

The bootstrap cookie is short lived, `SameSite=Lax`, and currently has a
30-minute maximum age.

## Workspace Selection

`/access` reads the bootstrap token, decodes roles, and groups cards into
Admin, Event, and application choices.

Selection calls:

```text
POST {NEXT_PUBLIC_BASE_URL}/auth/select
```

Body:

```js
{ type, adminId }
```

or:

```js
{ type, eventId }
```

The request includes browser credentials and can send the bootstrap token as a
Bearer token. Event choices may then load:

```text
GET /v1/Events/Details/:eventId
```

The selected token is written to canonical and compatibility keys before
redirect.

## Destination Rules

- Admin dashboard: `/admin`
- Event dashboard: `/Config/`
- Tag Series: `/tag_series/`

Destination base URLs come from root environment variables.

## Reauthentication

Reauth context is stored as `atomx.portal.reauth` with a 24-hour TTL. Successful
reauthentication either:

- posts `{ type: "atomx.auth", service, token, eventId }` to the opener, or
- redirects the full page back to the destination.

The app warns ten minutes before JWT expiry. It does not silently refresh
tokens.

## Signout

Signout clears portal, dashboard, reauth, `atomx.auth.*`, and sessionStorage
state. Any new auth key must be added to this cleanup contract.

## Analytics

`pages/_app.js` initializes the shared consent-aware PostHog/GA integration.
Do not introduce a second analytics initialization.
