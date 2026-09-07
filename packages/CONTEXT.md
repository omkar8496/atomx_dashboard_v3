# Shared Packages Context

Current responsibilities as of **20 August 2026**.

## `@atomx/lib`

Browser-safe helpers for environment/project metadata, `getBaseUrl`, JWT
decoding, and initials. All apps can import it into client bundles.

## `@atomx/api-client`

Generic GET/POST/health foundation with `x-atomx-project`. Its default/example
routes and mock switching are not the dashboard's live implementation. Live
dashboard calls use `apps/dashboard/src/lib/dashboardApi.js`.

## `@atomx/auth`

Generic in-memory/mock auth configuration/client. It is not durable session
storage and is not the authority for Access Portal token handoff.

## `@atomx/global-components`

Provides shell/login components, TokenGate, AtomX loader, and consent-aware
PostHog/GA initialization. Analytics consent key:

```text
atomx.analytics.consent.v1
```

New events follow `docs/analytics-schema.md`. The analytics layer filters
email-like GA properties.

## `@atomx/shared-ui`

Small accessible button, card, and heading primitives. Keep these domain-free.

## `@atomx/utils`

Formatting helpers and in-memory feature flags. Flags are neither persisted nor
remotely managed here.

## `@atomx/public-assets`

Canonical shared Poppins fonts, AtomX logos, visual assets, and manifest.
`scripts/sync-public-assets.js` replaces generated copies under:

```text
apps/*/public/shared/assets
apps/*/public/shared/fonts
apps/*/public/shared/logos
```

Only edit the package source, then synchronize.

## Dependency Boundary

Shared packages must remain static-export/browser compatible. Domain APIs,
route state, credentials, event IDs, and operational forms belong in the app
that owns them. A package change can affect every app, so verify with the root
build.
