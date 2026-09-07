# Access Portal Context

Current behavior as of **20 August 2026**.

## Runtime

This is a Pages Router static export. OAuth handoff, token parsing/storage,
role selection, API calls, analytics, and navigation all run in the browser.
There is no app-local global state library.

## Storage Contract

Important keys/cookie:

| Name | Purpose |
| --- | --- |
| `atomx.portal.token` | Portal/bootstrap JWT |
| `atomx.auth.<app-or-service>` | Selected service tokens |
| `atomx.dashboard.token` | Dashboard compatibility token |
| `atomx.dashboard.store` | Dashboard persisted state, cleared on reselection/logout |
| `atomx.auth.tag-series` | Canonical Tag Series token |
| `atomx.auth.tag_series` | Legacy Tag Series compatibility key |
| `atomx.portal.reauth` | Reauth return context, 24-hour TTL |
| `atomx_bootstrap_token` | Short-lived bootstrap cookie, 30-minute max age |
| `atomx.theme` | Shared light/dark preference |

Login stores the URL token, identifies analytics context, removes `token` from
the URL, and redirects after a short success state.

## Workspace Selection

Selection calls:

```text
POST {NEXT_PUBLIC_BASE_URL}/auth/select
```

with one of:

```js
{ type, adminId }
{ type, eventId }
```

The request includes cookies and may send the bootstrap cookie value as Bearer.
Token extraction tolerates nested response envelopes and several token field
aliases. A returned token is written to `atomx.dashboard.token`, normalized
type/service keys, and the legacy Tag Series key when needed.

Event-scoped non-Tag-Series choices can then load:

```text
GET /v1/Events/Details/:eventId
```

using dashboard API-key, optional selected Bearer token, cookies, and no-store.

## Handoff And Reauth

Normal navigation adds service/token/event context to the destination URL.
Popup return posts:

```js
{ type: "atomx.auth", service, token, eventId }
```

to the destination origin and closes the popup. Reauth context expires after 24
hours. Session guards warn ten minutes before JWT expiry; there is no silent
refresh.

## Signout

Signout removes portal token, dashboard token/store, reauth state, all
`atomx.auth.*` keys, the bootstrap cookie, and sessionStorage. New auth storage
must join this cleanup contract.

## Destinations

- Admin dashboard: `/admin`
- Event dashboard: `/Config/`
- Tag Series: `/tag_series/`
- Additional service URLs are resolved from permission data and public env
  destination variables.

## Analytics

`pages/_app.js` owns shared PostHog/GA initialization. Login and workspace
selection emit consent-aware events; do not add a second initialization path.
