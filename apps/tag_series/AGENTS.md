# Tag Series Agent Instructions

These rules supplement root `AGENTS.md`.

- Preserve `/tag_series` basePath, assetPrefix, trailing slash, and static
  export.
- Put domain requests in `api/api.js`.
- Preserve `credentials: "include"` and current API-key behavior.
- Keep `atomx.auth.tag-series` canonical and migrate the legacy
  `atomx.auth.tag_series` key on read.
- Keep `atomx.tag_series.step1` compatible across `/` and `/generate`.
- Keep XLSX generation browser-only.
- Do not hardcode event/admin IDs for live requests.
- Current API headers do not add the stored service token as Bearer. Treat this
  as a known limitation unless the full auth contract is deliberately changed.
- `TokenGate` currently normalizes token context but does not enforce access.

Run `npm run build:tag_series` and verify API loading/error/empty states,
session restoration, generation, records, direct URLs, and workbook output.
