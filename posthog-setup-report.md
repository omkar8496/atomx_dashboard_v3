<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the **AtomX Tag Series** app (`apps/tag_series`). The integration covers both server-side initialization (via `posthog-node`) and client-side event capture (via `posthog-js`), user identification, exception capture, and a live PostHog dashboard with five focused insights.

## Changes made

### New files created

| File | Purpose |
|------|---------|
| `apps/tag_series/lib/posthog.js` | PostHog Node.js singleton — initializes `posthog-node` client with `enableExceptionAutocapture: true` for server-side use |
| `apps/tag_series/components/PostHogInit.js` | Client component that calls `posthog.init()` once in the browser so all `"use client"` pages can use the posthog-js instance |

### Modified files

| File | Changes |
|------|---------|
| `apps/tag_series/app/layout.js` | Eagerly initializes the server-side PostHog client; mounts `<PostHogInit />` for browser-side tracking |
| `apps/tag_series/app/page.js` | `posthog.identify()` + `event_setup_submitted` capture on Step 1 success; `$exception` capture in the error handler |
| `apps/tag_series/app/generate/page.js` | `tag_batch_generated` capture with rich properties after a successful batch; `tag_excel_downloaded` capture with file metadata; `$exception` capture in the error handler |
| `.env` | Added `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` (loaded by `next.config.mjs` for all apps) |

### Package installed

`posthog-node` added to `apps/tag_series/package.json` dependencies.

## Tracked events

| Event | Description | File |
|-------|-------------|------|
| `event_setup_submitted` | User completes Step 1 — selects an event + client and continues to the generate page | `apps/tag_series/app/page.js` |
| `tag_batch_generated` | User successfully generates a tag series batch (Step 2 form submit success), with `event_id`, `form_type_label`, `quantity`, `extra_quantity`, `total_count`, `client_id`, `client_name`, `range_count` | `apps/tag_series/app/generate/page.js` |
| `tag_excel_downloaded` | User downloads the Excel sheet of generated tag IDs, with `event_id`, `form_type_label`, `include_urls`, `row_count`, `file_name` | `apps/tag_series/app/generate/page.js` |
| `$exception` | Exception capture in generate and Step 1 error handlers | `apps/tag_series/app/page.js`, `apps/tag_series/app/generate/page.js` |
| `posthog.identify()` | Called on Step 1 success with `client_id` as distinct ID and `client_name` as a person property | `apps/tag_series/app/page.js` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/350063/dashboard/1381188
- **Tag Batches Generated & Excel Downloads** (daily trend): https://us.posthog.com/project/350063/insights/mgP92uHn
- **Tag Generation Funnel** (Event Setup → Batch Generated → Excel Downloaded): https://us.posthog.com/project/350063/insights/9tOTIAZW
- **Weekly Active Tag Series Users**: https://us.posthog.com/project/350063/insights/Hlurhlsm
- **Tag Batch Generation by Form Type** (bar breakdown by Card / Tag / Sticker etc.): https://us.posthog.com/project/350063/insights/ZXw6BTgd
- **Excel Download Rate** (batches generated vs downloaded, weekly): https://us.posthog.com/project/350063/insights/CMUEI3u0

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
