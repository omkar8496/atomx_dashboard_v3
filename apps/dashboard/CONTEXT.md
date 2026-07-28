# Dashboard Context

## Runtime And Shell

The Dashboard is a Next.js App Router static export. `src/app/layout.js`
installs shared analytics and the session guard. Most route pages are thin
wrappers around interactive client components.

The fixed `Header` includes the AtomX logo, current page/event context, profile
menu, and `SideDrawer`. The drawer is dark and expands on hover. Its current
destinations include Device Master, Analytics/Admin, Configuration, Admin,
Reports, Transactions, Devices, Blocked IDs, and APK Uploads.

## Zustand Store

`src/store/dashboardStore.js` persists to:

```text
atomx.dashboard.store
```

Current state domains:

- `token`
- decoded `profile`
- `eventMeta`
- `eventDetails`
- `selectedService`
- `vendorsByEventId`
- `stallsByEventId`

Token handoff also uses:

```text
atomx.dashboard.token
```

The session guard reads a URL token when present, stores it, removes it from the
URL, warns before expiry, and supports reauthentication through the Access
Portal. There is no silent token refresh.

## API Client

File:

```text
src/lib/dashboardApi.js
```

Behavior:

- base URL from `@atomx/lib/getBaseUrl`
- dashboard API-key header
- `credentials: "include"` on requests
- Bearer authorization when available
- in-flight GET de-duplication keyed by URL and token
- failed tokenized GET can retry without Bearer and rely on cookie session
- mutations include credentials but do not perform that retry

Endpoint inventory:

| Method | Endpoint | Feature |
| --- | --- | --- |
| `POST` | `/v1/Operators/Link` | Link admin/operator |
| `GET` | `/v1/Events/List` | Event list |
| `GET` | `/v1/Events/Details/:eventId` | Event details |
| `PATCH` | `/v1/Events/Edit/:eventId` | Event edit |
| `POST` | `/v1/Events/update-balance-setting` | Balance setting |
| `GET` | `/v1/Vendors/List/:eventId` | Vendor list |
| `POST` | `/v1/Vendors/Create` | Vendor create |
| `PATCH` | `/v1/Vendors/Edit/:vendorId` | Vendor edit |
| `GET` | `/v1/Stalls/List/Eventwise/:eventId` | Event stall list |
| `POST` | `/v1/Stalls/Create` | Stall create |
| `GET` | `/v1/Devices/List` | Event device list |
| `GET` | `/v1/Devices/Masterlist/Search` | Master device search |
| `POST` | `/v1/Devices/Masterlist/edit` | Master device edit |
| `POST` | `/v1/Devices/AddToStall` | Attach devices |
| `POST` | `/v1/Devices/Perso/Add` | Add/personalize device |
| `POST` | `/v1/Devices/Perso/Remove` | Remove device |
| `POST` | `/v1/EventTransactions/Filter` | Transaction filters |
| `GET` | `/v1/EventTransactions/Details/:txId` | Expanded transaction details |
| `POST` | `/v1/EventTransactions/UpdateStatus` | Completed/void status update |
| `POST` | `/v1/Events/day-close` | Close selected event day |

The stall list event ID must be supplied by current event context. Do not
hardcode sample IDs such as `1710`.

## Route Implementation Status

### `/admin`

API-backed event list/selection. Interactive content is loaded client-only.
Selecting an event hydrates dashboard event context.

### `/admin/Create_event`

Calls the operator-link endpoint. The workspace identifiers stay internal to
the request, and the session list contains only roles successfully added after
the page loads.

### `/Config`

Lists and manages vendors/stalls. Vendor list/create/edit and stall list/create
are API-backed. Stall list uses the Eventwise endpoint. The Edit Stall action
currently logs data and has no backend update call.

### `/Config/menu`

Menu category/item editor with dense horizontally scrollable item data. It
currently starts from local `INITIAL_CATEGORIES` and is not a complete API
integration.

### `/event-edit`

Loads and updates event details. Sections include Event Details, Active
Services, POS, Card, MSWIPE Details, and Dashboard Settings. It also calls the
balance-setting endpoint. Forms contain sensitive bank fields; never log them.

### `/Reports`

Report filter/download UI. No live report endpoint is currently wired.

### `/transactions`

Compact filters for dates, type, status, vendor, stall, mobile, card ID,
transaction ID, receipt, and device. The filter endpoint is wired; result
handling should remain compatible with uncertain API envelopes. Opening a
transaction fetches its detail endpoint once and caches the result for that row.
Expanded transactions can move from `completed` to `void` or from `void` to
`completed`; other statuses do not expose the mutation action.

### `/device`

API-backed event device cards and row view, with device details, versions,
timestamps, close state, and edit actions.

### `/device_masterlist`

Searches master devices and edits one through:

```text
POST /v1/Devices/Masterlist/edit
```

The edit request sends the editable device object, including nested bank data.
Treat those credentials as highly sensitive.

### `/Blocked`

Blocked IDs UI currently uses local static records.

### `/apk_upload`

APK uploader/recent-upload UI is currently local/static.

### `/timeline`

Current timeline/empty-state prototype.

## Data And UI Conventions

- API responses may use different wrappers; normalize close to the API call.
- Event IDs come from query/store/profile.
- Large datasets need compact rows/cards and explicit view controls.
- Search inputs should filter without causing uncontrolled request storms.
- Row/table views may scroll horizontally only inside their own container.
- Gradient icon tiles are a visual accent; primary action buttons are generally
  solid dark or orange, not arbitrary gradients.
- Poppins is loaded from shared assets on branded screens.

## Known Technical Debt

- No automated tests.
- IndexedDB draft/autosave helpers are unused.
- API-key fallback exists in client source.
- Several screens are polished prototypes rather than live integrations.
- Inline SVG icon implementations are repeated.
- Some response normalization and error messaging are component-specific.
