# Shared Packages Context

## `@atomx/lib`

Provides lightweight shared helpers:

- environment/project metadata
- `getBaseUrl`
- `decodeJwt`
- `getInitials`

It should remain browser-safe because all three static applications can import
it into client bundles.

## `@atomx/api-client`

Generic GET/POST/health client with an `x-atomx-project` header. Its current
route defaults are placeholder/example URLs, and it can switch to mock behavior
for example-domain configuration unless `MOCK_API=false`.

This is not the dashboard's live API implementation; dashboard calls are in
`apps/dashboard/src/lib/dashboardApi.js`.

## `@atomx/auth`

Generic in-memory/mock auth client and configuration. It is useful as a
foundation/example but is not durable production session storage and is not the
authority for the Access Portal handoff.

## `@atomx/global-components`

Cross-app components and browser services:

- application shell/auth panel/footer
- universal login page
- `TokenGate`
- AtomX loader
- consent-aware PostHog and GA initialization

Analytics consent key:

```text
atomx.analytics.consent.v1
```

The analytics layer filters email-like GA properties. New event names should
follow `docs/analytics-schema.md`.

## `@atomx/shared-ui`

Small primitives for buttons, cards, and headings. The shared button is a client
component. Keep primitives generic and accessible.

## `@atomx/utils`

Formatting helpers and in-memory feature flags. Feature flags are not persisted
or remotely managed by this package.

## `@atomx/public-assets`

Canonical shared visual assets and manifest, including Poppins font files and
AtomX logo assets.

`scripts/sync-public-assets.js` replaces generated copies under:

```text
apps/*/public/shared/assets
apps/*/public/shared/fonts
apps/*/public/shared/logos
```

The canonical package is the only safe source for shared asset edits.
