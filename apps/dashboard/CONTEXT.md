# Dashboard Context

This file describes implemented dashboard behavior as of **20 August 2026**.
Source code remains authoritative, especially while the worktree is dirty.

## Runtime And Shell

The dashboard is a Next.js App Router static export. `src/app/layout.js`
installs shared analytics and `SessionGuard`. Most pages are build-time wrappers
around client components.

The shared shell provides:

- fixed 58px AtomX header
- Portal plus current page/event label
- dynamic `EVENT #<id>` display when event context exists
- persisted light/dark toggle (`atomx.theme`)
- profile/session dropdown
- dark SideDrawer below the header, expanding from 60px to 248px on hover

Active drawer order is Device Master, Configuration, Whitelist, Admin,
Reports, Transactions, Devices, and Blocked. Analytics, APK Uploads,
TapX-Transactions, and Patcha-NY-Track are currently commented out.

## State Management

`src/store/dashboardStore.js` uses Zustand `persist` with storage key:

```text
atomx.dashboard.store
```

Persisted state:

| Field | Purpose |
| --- | --- |
| `token` | Selected dashboard/service JWT |
| `profile` | Decoded JWT profile |
| `eventMeta` | Selected event summary/navigation context |
| `eventDetails` | Full selected event response |
| `selectedService` | Current service/module context |
| `vendorsByEventId` | Vendor cache keyed by event ID |
| `stallsByEventId` | Stall cache keyed by event ID |

Actions set each domain and decode profiles when tokens change. Component-only
state remains in React. There is an IndexedDB draft helper, but current screens
do not use it.

## Session And Storage

`SessionGuard` accepts a URL `token`, writes it to `atomx.dashboard.token` and
the Zustand store, then removes the token from the URL. It also supports
service aliases under `atomx.auth.<service>` and listens for storage changes or
popup messages shaped like:

```js
{ type: "atomx.auth", service, token, eventId }
```

Reauth state is stored as `atomx.portal.reauth` with a 24-hour TTL. The app
warns ten minutes before JWT expiry. Reauth/logout clears portal, dashboard,
service-token, and relevant session storage. There is no silent refresh.

## Common API Client

Files:

```text
src/lib/apiClient.js
src/lib/apiConfig.js
src/lib/dashboardApi.js
```

Request behavior:

- base URL from `@atomx/lib/getBaseUrl`
- `x-api-key` from `NEXT_PUBLIC_DASHBOARD_API_KEY`
- `credentials: "include"` by default
- Bearer authorization when the dashboard token exists
- GET `cache: "no-store"`
- in-flight GET de-duplication by URL/token
- tokenized GET retry once without Bearer after `401`/`403`
- no cookie-only retry for mutations
- normalized `ApiError` status and server-message handling

The browser automatically sends eligible cookies because credentials are
included. Frontend code, not the browser, creates the Bearer header.
`apiConfig.js` contains a public fallback API key; do not duplicate it.

## Endpoint Inventory

### Roles And Events

| Method | Endpoint | Wrapper / behavior |
| --- | --- | --- |
| `POST` | `/v1/Operators/Link` | Admin/operator linking |
| `GET` | `/v1/Operators/List` | Added-role history |
| `GET` | `/v1/Events/List` | Event selection |
| `GET` | `/v1/Events/Details/:eventId` | Event hydration |
| `PATCH` | `/v1/Events/Edit/:eventId` | Save event settings |
| `POST` | `/v1/Events/update-balance-setting` | Set new balance |
| `POST` | `/v1/Events/day-close` | Day close |

Exact link payloads:

```js
// Admin
{ email, adminId, type: "admin" }

// Operator
{ email, eventId, type }
```

Operator type values exposed by the UI are `cashless`, `access`, `inventory`,
and `vendor`. Day close sends the dynamic event ID with default day `"a"` and
`volunteerCount: 0`.

### Vendors, Stalls, Menu, And AccessX

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/v1/Vendors/List/:eventId` | Vendor list |
| `POST` | `/v1/Vendors/Create` | Create vendor (`{vendor}`) |
| `PATCH` | `/v1/Vendors/Edit/:vendorId` | Edit vendor |
| `GET` | `/v1/Stalls/List/Eventwise/:eventId` | Dynamic event stall list |
| `POST` | `/v1/Stalls/Create` | Create stall (`{stall}`) |
| `GET` | `/v1/Items/List/:stallId` | Load selected stall menu |
| `GET` | `/v1/AccessX/Categories/List?code=:eventId` | Access categories |
| `POST` | `/v1/AccessX/Category/Create` | Create category |
| `POST` | `/v1/AccessX/Category/Edit` | Edit category |
| `GET` | `/v1/AccessX/GatesMaster/List?code=:eventId` | Gate masters |
| `POST` | `/v1/AccessX/GatesMaster/Create` | Create gate master |
| `POST` | `/v1/AccessX/GatesMaster/Edit` | Edit gate master |
| `GET` | `/v1/AccessX/Gates/List?code=:eventId` | Gate/category mappings |

There is no connected stall update endpoint. Access Gate Config edit currently
updates the associated gate master through `GatesMaster/Edit`, then refreshes
gate-master and gate lists. A separate gate-config create/edit API is absent.

### Devices

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/v1/Devices/List?code=:eventId&type=:type` | Event/personal device list |
| `GET` | `/v1/Devices/Masterlist/Search?search=...` | Master device search |
| `POST` | `/v1/Devices/Masterlist/add` | Add master device |
| `POST` | `/v1/Devices/Masterlist/edit` | Edit master device |
| `POST` | `/v1/Devices/AddToStall` | Assign devices to a stall |
| `POST` | `/v1/Devices/Perso/Add?code=:eventId` | Personalize/add devices |
| `POST` | `/v1/Devices/Perso/Remove?code=:eventId` | Remove personalized device |

Device Master List add/edit uses static option arrays for device type, model,
and bank. Selecting a bank injects a matching nested `bankData` defaults object.
The values are sensitive and intentionally not documented here. Type, model,
bank, print ID/device, hardware/MAC, Android ID, reference, description, NFC,
and status are editable; backend device ID remains read-only.

### Transactions, Whitelist, Reports, And TapX

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/v1/EventTransactions/Filter` | Filter transaction list |
| `GET` | `/v1/EventTransactions/Details/:txId` | Lazy row details |
| `POST` | `/v1/EventTransactions/UpdateStatus` | Completed/void toggle |
| `GET` | `/v1/Whitelist/Search?code=:eventId&search=...` | Whitelist search |
| `GET` | `/v1/Whitelist/Logs?eventId=:eventId&wid=:userId` | Result history |
| `GET` | `/v1/Reports/List?eventId=:eventId` | Report requests |
| `POST` | `/v1/Reports/Build/Start` | Start report build |
| `GET` | `/v2/WalletTapX/card-list` | TapX wallet cards |

Transaction status mutation accepts only `completed` or `void`; the UI offers
the opposite status only when the current status is one of those two. Default
reason is `aml <target status>`. Pending/QR-pending/unknown statuses have no
mutation action.

Whitelist history must use the selected user object's `id` as `wid`, not the
search query. All event IDs are dynamic.

Report build validates a dynamic event ID and exactly two dates. Current form
payload is:

```js
{
  dates: [startDate, endDate],
  days: [0],
  idType: selectedEventOrVendorLabel,
  id: eventId,
  type: selectedReportTypeLabel,
  requestId: crypto.randomUUID() // timestamp fallback when unavailable
}
```

Event/Vendor and Type choices are currently hardcoded option arrays in the
client. The selected labels are sent exactly, per the current backend contract.

## Route Status

| Route | Status | Notes |
| --- | --- | --- |
| `/` | Placeholder | Shell with static welcome content |
| `/admin` | Live | API event list/selection; analytics action disabled |
| `/admin/Create_event` | Live | Link roles; list/group same-email history by latest date |
| `/Config` | Mixed live | Vendors, stalls, AccessX, devices, menu navigation |
| `/Config/menu` | Mixed live/local | Live menu load; local edits/order/save controls |
| `/event-edit` | Live | Detail fetch/edit, balance setting, day close |
| `/Reports` | Live | Report list/build and linked download rows |
| `/transactions` | Live | Filter, row details, completed/void mutation |
| `/device` | Live | Event/personal device modes and personalization actions |
| `/device_masterlist` | Live | Search/add/edit with bank defaults |
| `/whitelist` | Live | Search cards and selected-record history |
| `/Blocked` | Prototype | Local blocked-ID records |
| `/apk_upload` | Prototype/hidden | Local uploader UI; drawer item commented |
| `/tapx` | Partial/hidden | Wallet tab fetch exists; drawer item commented |
| `/patcha-ny-track` | Placeholder/hidden | Drawer item commented |
| `/timeline` | Prototype | Static empty state; not in drawer |

### Admin Role Management

The page resolves admin ID from profile/event context and event ID from current
event state. It fetches `/v1/Operators/List`, filters:

- admins by matching logged-in/current admin ID
- operators by matching admin ID and selected event ID

Records with the same normalized email are grouped. The newest record is shown
first; expanding a group shows date-stamped history as a vertical connected
timeline. Adding a role refreshes/merges the relevant group. The email form does
not display workspace admin/event identifiers.

### Configuration

`VendorConfigurationContent` loads vendors and Eventwise stalls, then loads
AccessX categories, gate masters, and gate mappings concurrently with
`Promise.allSettled`. Each domain has independent loading/error state.

Stalls are separated into regular, stockroom, table, and AccessX groups. Menu
navigation sends `stallId` and `stallName` query parameters. Attach-device uses
the selected stall record. Vendor create/edit and stall create refresh or merge
API results; Edit Stall remains UI-only.

Access categories display name and allow count (`0` means Always/All in the
UI), and edit name, allow count, position display, QR-logic fields, description,
external link, and status as supported by the modal payload. Category create
defaults description to event name and external link to entered name.

### Menu

`/Config/menu` requires `stallId`; it calls `/v1/Items/List/:stallId` on mount.
Response normalization accepts categories from `categories` or `menu`, and
items from a top-level `items` array or nested category arrays. Top-level items
are matched where `item.categoryId === category.id`.

Category fields used: `id`, `name`, `type`, `status`, `vat`, `gstSlab`, and
`gstType`. Item fields used: `id`, `name`, `price`, `happyPrice`, `hsn`,
`barcode`, `epc`, `type`, `tags`, `status`, `imagePath`, `supplierCode`,
`groupId`, `variant`, `colour`, and `position`.

Current display ignores backend fields without matching UI controls, including
category `cess`, `printerIp`, `useCardDiscount`, `masterCategoryId`, and most
item bottle/cost/MRP/expiry metadata. Drag/drop changes item order and position
in local state only. Category/item create/edit, active toggles, and Save are not
connected to mutation endpoints. Workbook download is generated in-browser.

### Event Edit

Sections are arranged in a two-column flow without masonry gaps: Event Details
beside Active Services, then POS/Card, MSWIPE/Dashboard Settings. Event Details
includes poster, identity/location, schedule, currency, and ET code. Settings
cover services, POS switches/printer/topups/passwords, card limits/returns,
payment credentials, and dashboard switches. Sensitive values must never be
logged. Save patches event details; Set New Balance and Day Close are separate
POST actions using the current event ID.

### Transactions

The compact filter panel supports dates, transaction type/status, vendor,
stall, mobile, card ID, transaction ID, receipt, and device. The list accepts
variable API envelopes. Expanding a row calls Details only when needed and
caches the result by transaction ID. Expanded content shows available card,
receipt, balance, mobile, reference, invoice, app-version, and related fields.

### Whitelist

Search calls the dynamic event's whitelist endpoint. Result cards show name,
event name, booking reference, courier barcode when present, and total pax.
History and Category icon buttons are present; History is live and Category
has no documented live behavior yet.

### Reports

The filter uses native start/end date inputs and client-side Event/Vendor and
Type option arrays. Build Start is called on Download, then the report list is
refreshed. Existing requests are shown newest-first with operator, name,
status/timestamps, and a download action only when `reportLink` is available.

## Response And UI Conventions

- Normalize uncertain envelopes before rendering.
- Keep current IDs dynamic from query/store/profile/selected records.
- Never trigger request storms from uncontrolled search typing.
- Operational lists must remain dense for 50+ records.
- Horizontal overflow belongs to a labeled table container only.
- Gradient tiles are accents; primary command buttons are solid dark/orange.
- Icon-only actions require accessible labels and tooltips.

## Known Technical Debt

- No automated tests.
- Public API-key fallback and client-side payment defaults.
- Edit Stall and menu mutations are incomplete.
- Access Gate Config reuses the gate-master edit endpoint.
- Blocked/APK/Timeline/Patcha routes are local or placeholders.
- TapX is partial and hidden from navigation.
- Analytics navigation is disabled/commented out.
- Response normalization/error wording is partly component-specific.
- Repeated icon/CSS implementations remain.

## Safe Change Checklist

1. Resolve current event/record IDs; reject missing context instead of using a
   sample number.
2. Add the endpoint wrapper before component wiring.
3. Preserve API/session behavior and sensitive-data handling.
4. Keep local-only controls explicitly local or connect a confirmed mutation.
5. Verify loading, error, empty, and success states.
6. Run `npm run build:dashboard` and `git diff --check`.
