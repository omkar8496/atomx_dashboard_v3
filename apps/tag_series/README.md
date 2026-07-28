# AtomX Tag Series

Tag Series is the browser application for selecting event/client/year-series
context, generating tag IDs, recording batches, viewing records, and exporting
workbooks.

It is deployed under the fixed `/tag_series` base path.

## Run

From the repository root:

```bash
npm run dev:tag_series
npm run build:tag_series
```

The development server uses port `3002`.

## Stack

- Next.js App Router
- React local state
- Static export under `/tag_series`
- Browser localStorage and sessionStorage
- SheetJS (`xlsx`) for browser workbook export
- Shared AtomX token gate and analytics

There is no Redux or Zustand store in this app.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Event/client/year-series selection |
| `/generate` | Generate IDs, post logs, view batches, export XLSX |
| `/Admin/View` | Admin records view |
| `/Admin/AddFormFactor` | Form-factor prototype |
| `/Admin/AddProduct` | Product prototype |
| `/login` | Login entry |

The deployed URLs include `/tag_series` before each route.

## API

The app-local `api/api.js` calls Tag Series endpoints for clients, series,
logs, batch records, and events. Requests use browser credentials and the Tag
Series API key.

See [CONTEXT.md](./CONTEXT.md) for current authentication limitations.

## Verification

Run the build, then verify step-one persistence, generation, API errors, direct
navigation under the base path, and the downloaded workbook.
