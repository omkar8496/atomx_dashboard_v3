# Shared Packages

These workspace packages are browser-consumable shared code, not separately
deployed services. Last audited: **20 August 2026**.

| Directory | Package | Responsibility |
| --- | --- | --- |
| `lib` | `@atomx/lib` | Base URL, JWT decode, initials, project metadata |
| `api` | `@atomx/api-client` | Generic/mock-oriented API foundation |
| `auth` | `@atomx/auth` | Generic in-memory/mock auth foundation |
| `global-components` | `@atomx/global-components` | Login/shell, loader, TokenGate, analytics |
| `shared-ui` | `@atomx/shared-ui` | Small button/card/heading primitives |
| `utils` | `@atomx/utils` | Formatting and in-memory feature flags |
| `public-assets` | `@atomx/public-assets` | Canonical logos, Poppins fonts, asset manifest |

App-specific production endpoints stay in the owning app unless a stable
cross-app contract exists. `@atomx/auth` and `@atomx/api-client` are not the
production Access Portal/dashboard authority.

After changing public exports or shared runtime behavior, run `npm run build`.
After asset edits, run `npm run sync:public`.
