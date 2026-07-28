# Shared Packages

This directory contains reusable code consumed by the three AtomX applications.
It is a shared layer, not a separate deployed application.

## Package Map

| Package directory | Package name | Purpose |
| --- | --- | --- |
| `lib` | `@atomx/lib` | Base URL, JWT, initials, environment/project metadata |
| `api` | `@atomx/api-client` | Generic API-client foundation |
| `auth` | `@atomx/auth` | Generic in-memory/mock auth foundation |
| `global-components` | `@atomx/global-components` | Login, TokenGate, shell, loader, analytics |
| `shared-ui` | `@atomx/shared-ui` | Button, card, and heading primitives |
| `utils` | `@atomx/utils` | Formatting and feature flags |
| `public-assets` | `@atomx/public-assets` | Canonical shared fonts, logos, and manifest |

## Important Boundaries

- App-specific AtomX endpoints belong in the owning app API layer unless they
  are truly shared and have a stable cross-app contract.
- The generic auth and API packages are foundations with mock-oriented
  behavior. They are not currently the sole production authentication/data
  implementation.
- Browser analytics belongs in `global-components`.
- Canonical assets belong in `public-assets`; app copies are generated.

## Build Impact

A shared package change can affect all applications. Run:

```bash
npm run build
```

after changing public exports or shared runtime behavior.
