# Shared Package Agent Instructions

These rules supplement root `AGENTS.md`.

- Keep package exports explicit, generic, browser-safe, and backward
  compatible.
- Do not move app-specific domain logic into packages solely to remove small
  duplication.
- Add `"use client"` only where hooks/browser events require it.
- Guard `window`, storage, DOM, and analytics access from module import time.
- Keep dependency direction from apps toward packages, never back into app
  source.
- Do not route live auth/API behavior through mock foundations without testing
  the complete contract.
- Never add tokens, credential defaults, or private keys to shared packages.
- Edit canonical assets in `public-assets`; never generated app copies.

Run `npm run build` after public export/shared-runtime changes and verify all
three consumers.
