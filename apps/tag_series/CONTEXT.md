# Tag Series Context

## Runtime

Tag Series is an App Router static export with:

```text
basePath: /tag_series
assetPrefix: /tag_series
```

Interactive behavior is browser-only. The app uses React state, localStorage,
and sessionStorage rather than a global state library.

## Workflow

1. `/` loads events and card clients.
2. The user chooses event, client, and year-series context.
3. The app validates/loads the available series.
4. Context is stored as `atomx.tag_series.step1` in sessionStorage.
5. `/generate` generates IDs, posts logs, reads batch records, and exports XLSX.

## Storage

| Key | Purpose |
| --- | --- |
| `atomx.auth.tag-series` | Canonical service token |
| `atomx.auth.tag_series` | Legacy token migrated on read |
| `atomx.tag_series.step1` | Step-one generation context |

## API Endpoints

The app-local `api/api.js` currently calls:

| Method | Endpoint |
| --- | --- |
| `GET` | `/v1/TagSeries/CardClients` |
| `GET` | `/v1/TagSeries/Series?eventId&adminId&yearSeries` |
| `POST` | `/v1/TagSeries/Logs` |
| `GET` | `/v1/TagSeries/BatchRecords?eventId&adminId` |
| `GET` | `/v1/TagSeries/Events` |

Requests use `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_TAG_SERIES_API_KEY`, and
`credentials: "include"`.

Important current behavior: `buildHeaders(token)` accepts/reads a token but does
not put it in an Authorization header. Authentication therefore currently
depends on the API key and browser cookie behavior.

## Current Completeness

- Selection, generation, logging, records, and browser workbook export are the
  main functional workflow.
- Admin View has application UI but should be checked against live API behavior
  before extending.
- Add Product and Add Form Factor currently contain demo/static behavior.
- `TokenGate` removes/normalizes URL token context but does not block
  unauthenticated rendering.

## Shared Dependencies

The app imports shared global components/analytics and lists generic shared
auth/API packages, but the live Tag Series data flow primarily uses the
app-local API module. The generic shared auth package is not the production
session authority.
