# AtomX Tag Series

Tag Series selects event/client/year-series context, generates tag IDs,
records batches, displays records, and exports XLSX workbooks in the browser.
It is statically deployed under `/tag_series`.

Last code/documentation audit: **20 August 2026**.

## Run

```bash
npm run dev:tag_series
npm run build:tag_series
```

Development uses port `3002`.

## Architecture

- Next.js App Router static export
- fixed `/tag_series` basePath and assetPrefix
- React local state plus localStorage/sessionStorage
- SheetJS (`xlsx`) browser export
- app-local `api/api.js` for live Tag Series requests
- shared AtomX analytics, token gate, UI, and helpers

There is no Redux or Zustand store.

## Routes

| Route (after `/tag_series`) | Purpose |
| --- | --- |
| `/` | Event/client/year-series selection |
| `/generate` | Generate IDs, write logs, load records, export workbook |
| `/Admin/View` | Admin records UI |
| `/Admin/AddFormFactor` | Form-factor prototype |
| `/Admin/AddProduct` | Product prototype |
| `/login` | Login entry |

## Verification

Build and test direct base-path navigation, token-key migration, step-one
session restoration, selection/API states, generation, records, and the
downloaded XLSX file.
