# Shared Package Agent Instructions

These rules supplement the repository root `AGENTS.md`.

## Package Design

- Keep public exports explicit and backward compatible.
- Do not move app-specific domain logic into a shared package merely to avoid a
  small amount of duplication.
- Add `"use client"` only to modules that require hooks, browser APIs, or event
  handlers. Avoid turning an entire shared package into client code.
- Do not access localStorage, window, document, or analytics at module import
  time without a browser guard.
- Keep package dependency direction toward small generic helpers, not back into
  application source.

## Auth And API Foundations

- `@atomx/auth` and `@atomx/api-client` currently include mock-oriented
  behavior. Do not route live app behavior through them without validating the
  full session and API contract.
- Never add default production secrets, tokens, passwords, or private API keys.
- Preserve explicit credential/header behavior at caller boundaries.

## Assets

- Edit canonical files in `public-assets`.
- Run `npm run sync:public` after asset changes.
- Do not manually patch generated `apps/*/public/shared` copies.

## Verification

Run `npm run build` after changing package exports or shared browser behavior.
Check all consuming apps, not only the package that compiled.
