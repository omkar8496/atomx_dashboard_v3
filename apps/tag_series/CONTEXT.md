# Tag Series Context

Current behavior as of **20 August 2026**.

## Runtime And State

Tag Series is an App Router static export with:

```text
basePath: /tag_series
assetPrefix: /tag_series
trailingSlash: true
```

Interactive state is React-local. Cross-route setup uses sessionStorage; token
compatibility uses localStorage. There is no global state library.

## Workflow

1. `/` reads/migrates the Tag Series token.
2. It loads events and card clients.
3. User selects event, admin/client, and year-series context.
4. Series metadata is validated/loaded.
5. Step-one context is stored as `atomx.tag_series.step1`.
6. `/generate` restores context, generates IDs, posts a log, loads batch
   records, and exports a workbook.

## Storage

| Key | Purpose |
| --- | --- |
| `atomx.auth.tag-series` | Canonical selected-service token |
| `atomx.auth.tag_series` | Legacy token migrated to canonical on read |
| `atomx.tag_series.step1` | Last completed setup context |

## API

`api/api.js` calls:

| Method | Endpoint |
| --- | --- |
| `GET` | `/v1/TagSeries/CardClients` |
| `GET` | `/v1/TagSeries/Series?eventId&adminId&yearSeries` |
| `POST` | `/v1/TagSeries/Logs` |
| `GET` | `/v1/TagSeries/BatchRecords?eventId&adminId` |
| `GET` | `/v1/TagSeries/Events` |

Requests use `NEXT_PUBLIC_BASE_URL`, Tag Series/dashboard API-key public config,
`credentials: "include"`, no-store, and route-specific validation/error text.
`buildHeaders(token)` accepts a token but currently only returns `x-api-key`;
the stored token is not sent as Authorization. Authentication therefore relies
on API key and browser cookie behavior.

## Completeness

- Main selection/generation/log/records/XLSX flow is functional.
- `/Admin/View` has application UI but should be checked against live API
  requirements before extension.
- Add Product and Add Form Factor retain static/demo behavior.
- `TokenGate` normalizes URL token context without blocking unauthenticated UI.
- Some sample display identity values remain in UI source.

`TAG_SERIES_FLOW.md` contains a larger flow diagram; this file is the concise
implementation handoff.
