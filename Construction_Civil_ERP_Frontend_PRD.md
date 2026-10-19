# Construction & Civil Works ERP
**Frontend Product Requirements Document (PRD)**

**Status:** Implementation-ready frontend spec  
**Date:** 16 October 2026  
**Companion:** `Construction_Civil_ERP_Project_Requirements_and_Proposal.md`  
**Scope:** Frontend only (Next.js PWA). Backend NestJS is out of this document.  
**Payroll:** Out of scope. Do not design, route, or mock payroll, salary, or statutory payroll screens.

This is the single source of truth for UI, UX, information architecture, brand, and frontend engineering. If this file and the proposal disagree on a screen, this PRD wins for the frontend. If they disagree on business rules, the proposal wins and this PRD must be updated.

---

## 1. Objective

Build a production-grade, installable web app for an Indian construction business so site, store, purchase, accounts, contractor, and owner users can run daily work on one branded system.

**Users:** internal staff (supervisor, store, purchase, accounts, project manager, owner), contractors, and clients. Each login sees only permitted modules and records.

**Success:** a supervisor can request material, an approver can act, a store can issue stock, a contractor can submit a running bill, and an owner can see pending work, all with INR amounts, GPS photo evidence, and an audit trail, using dummy JSON today and a real API later without rewriting screens.

### Design read

Build a **mobile-first PWA that feels like a native mobile application** for site and office operators in India. Every route, portal, modal, form, register, and state must meet the mobile requirements below. Preserve the **navy + gold institutional identity**, owned shadcn/ui (New York), Tailwind v4, and Phosphor icons. Design complete phone workflows first, then expand into efficient tablet and desktop layouts. Desktop density must never dictate phone layouts.

**Mandatory design references:** [Mobile App Design Standards](.agents/skills/mobile-app-design-standards/SKILL.md), [Responsive Design](.agents/skills/responsive-design/SKILL.md), and [Web Design Guidelines](.agents/skills/web-design-guidelines/SKILL.md). Apply their web-relevant guidance; React Native APIs and native-only capabilities are not requirements for this Next.js PWA. Review against the [upstream Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) at implementation review time. The explicit acceptance criteria in this PRD govern release readiness.

| Dial | Value | Reason |
|---|---|---|
| Design variance | 3 | Predictable ERP grids, not experimental layouts |
| Motion intensity | 3 | Status feedback only; honour `prefers-reduced-motion` |
| Visual density | 4 phone / 6 tablet / 8 desktop | Readable task lists on phones; expanded data grids where space permits |

---

## 2. Assumptions (correct these if wrong)

1. App Router Next.js, TypeScript, English only, INR primary currency, Asia/Kolkata.
2. Persistent dummy JSON in json-server + typed client until NestJS is ready. Same Zod contracts in both modes.
3. Auth UI is built now. Dummy mode accepts any valid email/password against `users.json`. Live mode uses HttpOnly session cookies.
4. Installable PWA with mandatory offline/unavailable states and durable local material-request drafts. Offline submission, stock posting, financial posting, and automatic mutation replay are out of MVP scope.
5. No live GPS tracking. Capture-time location on photos only.
6. Light content canvas + dark navy chrome (sidebar). Optional dark content theme later; do not invert random sections.
7. shadcn is customised to brand tokens. Never ship default zinc/violet shadcn look.

---

## 3. Tech Stack

Pin exact versions at init. Prefer current stable at install time.

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + React + TypeScript | RSC layouts, route groups, PWA |
| Styling | Tailwind CSS v4, CSS-first `@theme` | Token mapping, no `tailwind.config` theme soup |
| Components | shadcn/ui (New York, owned copies in `components/ui`) | Production primitives we can brand |
| Icons | `@phosphor-icons/react` (regular, 1.5 stroke) | One family. Do not mix Lucide unless a shadcn primitive still imports it internally |
| Fonts | `next/font`: **DM Sans variable** (UI) + **Manrope variable** (headings) + **IBM Plex Mono** (document numbers, money, GPS) | Not Inter |
| Client data | **TanStack Query v5** | Cache, dedupe, mutations, optimistic updates |
| Tables | **TanStack Table v8** + **TanStack Virtual** | ERP registers at scale |
| URL state | **nuqs** | Filters, tabs, pagination survive refresh and share |
| Forms | **react-hook-form** + **@hookform/resolvers/zod** | Canonical with shadcn Form |
| Validation | **Zod 4** (or 3 if 4 not yet standard in the toolchain) | Shared DTOs for JSON, forms, and future API |
| Date/money | `date-fns` + `date-fns-tz`; `Intl.NumberFormat('en-IN')` | IST + Indian grouping |
| Toasts | `sonner` | Transient success/fail, never for field errors |
| Command palette | `cmdk` | Jump to module, document, site |
| Drawers | `vaul` | Mobile filters and record peek |
| Charts | `recharts` (lazy loaded) | Dashboard only; keep bundle small |
| Excel preview | `papaparse` for CSV; `exceljs` for xlsx preview | Import UX, not accounting engine |
| PWA | `@serwist/next` or official Next PWA path chosen at init | Install + cache shell |
| Testing | Vitest + Testing Library + Playwright | Unit, component, e2e |
| Mock API (optional) | MSW | Browser/node intercept when dummy files are not enough |
| Quality | ESLint, Prettier, TypeScript `strict`, `knip` | Production hygiene |

**Do not add:*  CSS-in-JS, extra component kits, chat SDKs, payroll libraries.

### Commands

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm knip
```

Package manager: **pnpm**. Node: Active LTS.

---

## 4. Project Structure

```
apps/web/                         # or repo root if single app
├── app/
│   ├── (auth)/                   # login, reset password
│   ├── (app)/                    # authenticated shell
│   │   ├── layout.tsx            # sidebar + topbar
│   │   ├── page.tsx              # dashboard
│   │   ├── approvals/
│   │   ├── organisation/
│   │   ├── inventory/
│   │   ├── requests/
│   │   ├── purchasing/
│   │   ├── contractors/
│   │   ├── finance/
│   │   ├── reports/
│   │   ├── evidence/
│   │   ├── imports/
│   │   ├── notifications/
│   │   └── settings/
│   ├── api/                      # thin BFF only if needed
│   ├── globals.css               # tokens + @theme
│   └── manifest.ts
├── components/
│   ├── ui/                       # shadcn primitives
│   ├── layout/                   # app-shell, sidebar, topbar, command-palette
│   ├── data/                     # data-table, filters, pagination, empty-state
│   ├── documents/                # status, approval-timeline, audit-strip
│   └── features/                 # one folder per domain
├── lib/
│   ├── api/                      # DataClient, dummy + http adapters
│   ├── query/                    # query keys, query client
│   ├── format/                   # inr, date, qty
│   ├── auth/                     # session helpers (client-safe)
│   └── permissions.ts
├── schemas/                      # Zod: single source of types
├── mocks/data/                   # dummy JSON (replaceable)
├── hooks/
├── e2e/
└── public/icons/
```

Directories: lowercase-with-dashes. Named exports for components.

---

## 5. Brand System and Premium shadcn Setup

### 5.1 Brand idea

Navy institutional trust (construction records, money, approvals) with a single gold accent for status that needs attention (pending approval, low stock, GPS captured). Blue accent is for primary actions only. Gold is not used on primary buttons.

### 5.2 Token mapping (required)

Map brand tokens into shadcn semantic variables so every primitive picks up the system. Do not scatter raw hex in feature components.

```css
@import "tailwindcss";

:root {
  /* Brand */
  --brand-primary: #174A8B;
  --brand-dark: #0B1F42;
  --brand-accent: #2563EB;
  --brand-accent-hover: #1D4ED8;
  --brand-gold: #D6B15E;

  /* Backgrounds */
  --background: #FFFFFF;
  --background-muted: #F2F6FC;
  --background-dark: #0B1F42;
  --surface-dark: #122B50;
  --surface-blue: #173F70;

  /* Text */
  --text-primary: #14243A;
  --text-secondary: #526176;
  --text-inverse: #FFFFFF;
  --text-muted-inverse: #D7E1EF;

  /* UI */
  --border: #DFE6EF;
  --border-dark: #304568;
  --button-primary: #2563EB;
  --button-primary-hover: #1D4ED8;
  --button-text: #FFFFFF;

  /* Premium accents */
  --accent-gold: #D6B15E;
  --accent-gold-text: #14243A;

  /* Semantic status (ERP, not extra brand colours) */
  --status-draft: #64748B;
  --status-pending: #D6B15E;
  --status-approved: #0F766E;
  --status-rejected: #B42318;
  --status-posted: #174A8B;
  --status-partial: #C2410C;

  /* shadcn semantic (HSL or hex consistent with the theme generator you use) */
  --background: #FFFFFF;
  --foreground: #14243A;
  --card: #FFFFFF;
  --card-foreground: #14243A;
  --popover: #FFFFFF;
  --popover-foreground: #14243A;
  --primary: #2563EB;
  --primary-foreground: #FFFFFF;
  --secondary: #F2F6FC;
  --secondary-foreground: #14243A;
  --muted: #F2F6FC;
  --muted-foreground: #526176;
  --accent: #F2F6FC;
  --accent-foreground: #14243A;
  --destructive: #B42318;
  --destructive-foreground: #FFFFFF;
  --border: #DFE6EF;
  --input: #DFE6EF;
  --ring: #2563EB;
  --radius: 0.5rem;
}

@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-muted: var(--background-muted);
  --color-muted-foreground: var(--text-secondary);
  --color-border: var(--border);
  --color-brand: var(--brand-primary);
  --color-brand-dark: var(--brand-dark);
  --color-gold: var(--brand-gold);
  --font-sans: "DM Sans", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
}

.sidebar-chrome {
  background: var(--brand-dark);
  color: var(--text-inverse);
  border-color: var(--border-dark);
}
```

### 5.3 Shape, type, elevation

- **Radius:** 8px controls, 12px cards, 6px badges. No mixed pill-and-square system except command kbd chips.
- **Borders:** `#DFE6EF` hairlines. No heavy gray `shadow-md`. Card elevation is `0 1px 2px rgb(11 31 66 / 0.06)`.
- **Type:** page title 24/32 medium; section 16/24 semibold; body and form inputs 16/24 on phones; table 13/20 only in wide-screen compact mode; meta 12/16 secondary. Use rem-based sizing, support 200% text enlargement, and retain system-font fallbacks while brand fonts load.
- **Numbers:** always `font-mono tabular-nums`. Money: `₹12,48,500.00`. Qty: `1,250.000` with item unit.
- **Focus:** 2px ring `--brand-accent`, offset 2px on white.
- **Gold usage:** pending badges, low-stock spark, “needs action” dots, capture-confirmed GPS chip. Never gold fill on primary CTA.

### 5.4 shadcn inventory (install, then restyle)

`button`, `input`, `textarea`, `label`, `select`, `checkbox`, `radio-group`, `switch`, `form`, `card`, `badge`, `separator`, `tabs`, `table`, `dialog`, `alert-dialog`, `sheet`, `drawer`, `dropdown-menu`, `popover`, `tooltip`, `hover-card`, `command`, `sonner`, `avatar`, `breadcrumb`, `pagination`, `scroll-area`, `skeleton`, `progress`, `calendar`, `popover` date picker, `accordion`, `collapsible`, `sidebar` (shadcn sidebar primitive customised to navy).

Init: `npx shadcn@latest init` then add the list. After init, replace default CSS variables with the mapping above.

---

## 6. Application Shell (native-feeling mobile PWA)

### 6.1 Desktop (>=1280)

```
+------------------------------------------------------------------+
| LOGO  Firm ▾  Project ▾  Site ▾     [Search  ⌘K]  Bell  User   |
+--------+---------------------------------------------------------+
|        | Breadcrumb                                              |
| NAV    | Page title                         [Secondary] [Primary]|
|        | Filter bar (nuqs)                                       |
| Dash   +---------------------------------------------------------+
| Inbox  |                                                         |
| Org    |  Main canvas  (max content width 1440, left aligned)    |
| Stock  |                                                         |
| Req    |                                                         |
| Buy    |                                                         |
| Works  |                                                         |
| Books  |                                                         |
| More   |                                                         |
+--------+---------------------------------------------------------+
| Status: draft autosave · IST 15 Oct 2026 23:54 · Scope: Firm A   |
+------------------------------------------------------------------+
```

- **Sidebar 240px / collapsed 72px**, `brand-dark`, active item `surface-blue` with 3px gold left bar.
- **Topbar 56px**, white, bottom border. Scope switchers are first-class, not buried in settings.
- **Sticky filter bar** under title. Changing filters updates URL, refetches Query, does not reset scroll of the table independently of `keepPreviousData` / `placeholderData`.
- No floating marketing-style island nav.

### 6.2 Tablet (768–1279 CSS px)

Use a collapsible navigation rail or overlay Sheet according to available content space. Retain touch sizing on tablets and hybrid devices. Split list/detail views and two-column forms are allowed only when both panes remain readable. Tables may scroll horizontally inside a labelled region for genuinely comparative data; routine tasks still offer the mobile list representation. Collapse scope controls into the same accessible switcher used on phones when they no longer fit.

### 6.3 Mobile (<768 CSS px): mandatory application behavior

- Use a compact app bar with screen title, contextual Back on child screens, and at most one secondary header action. Put the main task action in a reachable bottom action area when appropriate.
- Bottom navigation has 3–5 labelled, permission-aware destinations. Internal default: Home, Requests, Stock, Approvals, More; portals use their permitted destinations. Keep order stable for each role. More exposes every remaining permitted module. Show the active destination with text and shape as well as colour.
- Keep current firm/project/site visible in a compact scope summary; tap opens a full scope selector. Long names wrap or expand accessibly. Confirm scope changes when an unsaved document would be affected.
- Child detail/create screens use a full-page navigation stack. Hide bottom tabs during focused create/edit tasks; provide Back and a task action footer. Browser Back, Android Back, and in-app Back must resolve consistently. A directly opened detail has a safe parent-route fallback.
- Return from detail to the previous list with filters, selection where applicable, and scroll restored. Switching tabs preserves each tab's browsing context without duplicating history entries.
- Filters and short contextual actions use bottom sheets with explicit dismiss controls. Long forms, item search with many results, and record details use full-screen surfaces. Avoid nested sheets and tiny desktop dialogs.
- All touch targets are at least **48 × 48 CSS px**, including icons, checkboxes, tabs, and sheet controls, with at least 8px between adjacent independent targets. Visual icons may be smaller inside their hit area. This is the common web baseline; native pt/dp values are not CSS units.
- No essential action depends on hover, long press, swipe, or haptics. Gestures may enhance an existing visible action. Preserve platform edge navigation; optional vibration must be capability-detected and never required.
- Provide immediate pressed/pending feedback, targeting 100ms. Use restrained transitions with a 60fps target and reduced-motion support.

### 6.4 Responsive layout, safe areas, and keyboard

- Implement base phone styles first. Shell tiers are <768, 768–1279, and ≥1280 CSS px; component layouts adapt to their available width using container queries and intrinsic Grid/Flex layouts. Add breakpoints when content needs them, not based on device detection.
- Support 320 CSS px through large desktop widths, portrait and landscape, without page-level horizontal overflow. Fix overflowing content instead of clipping it. Use flexible columns, `min-width: 0`, wrapping, responsive media, and logical inline/block properties.
- Use a 4/8px spacing scale, normally 16px phone gutters, and fluid spacing/type with bounded `clamp()` values. Large screens retain the 1440px content maximum. Never shrink the entire desktop canvas to fit a phone.
- Use `min-height: 100dvh` with a suitable fallback, not a rigid `100vh` shell. Configure `width=device-width, initial-scale=1, viewport-fit=cover`; retain pinch zoom.
- Pad app bars, bottom navigation, sheets, and task footers with the relevant `env(safe-area-inset-*)` values. Reserve content space for the actual occupied chrome height so the last field, row, and focused control remain reachable.
- Prefer one main vertical scroll surface per screen. Sheets may scroll independently with contained overscroll. Do not globally intercept touch scrolling or browser navigation gestures.
- On keyboard open, keep the active input, its error, and the next action reachable. Collapse bottom navigation or move actions into the scrolling form when necessary. Do not stack a floating footer over the keyboard; validate behavior in browser and installed modes on both platforms.
- Preserve entered values, scope, and current task through rotation, resize, and app background/foreground transitions. Avoid automatic keyboard opening on route entry.
- Include a skip link, route-specific loading skeletons matching phone or desktop geometry, retryable errors, and a branded not-found view. The shell remains usable while page data loads.

### 6.5 Command palette (⌘K)

Groups: Go to, Recent documents, Actions (New request, New PO, New GRN). Results respect permissions. Dummy data: `command-index.json`.

---

## 7. Information Architecture and Routes

Permission-gated. Hidden nav is not security; UI still hides disallowed items.

```
(auth)
├── /login
└── /reset-password

(app)
├── /                                      Dashboard
├── /approvals                             Inbox
├── /approvals/[id]
├── /organisation/firms
├── /organisation/projects
├── /organisation/sites
├── /organisation/stores
├── /organisation/cost-codes
├── /organisation/users
├── /inventory/items
├── /inventory/stock                       Summary
├── /inventory/ledger
├── /inventory/grn
├── /inventory/grn/new
├── /inventory/grn/[id]
├── /inventory/issues
├── /inventory/issues/new
├── /inventory/issues/[id]
├── /inventory/transfers
├── /inventory/transfers/new
├── /requests
├── /requests/new
├── /requests/[id]
├── /purchasing/vendors
├── /purchasing/requisitions
├── /purchasing/requisitions/new
├── /purchasing/orders
├── /purchasing/orders/new
├── /purchasing/orders/[id]
├── /purchasing/bills
├── /contractors
├── /contractors/[id]
├── /contractors/work-orders
├── /contractors/work-orders/[id]
├── /contractors/bills
├── /contractors/bills/new
├── /contractors/bills/[id]
├── /finance/ledgers
├── /finance/vouchers
├── /finance/vouchers/new
├── /finance/vouchers/[id]
├── /finance/cash-book
├── /finance/bank-book
├── /finance/day-book
├── /finance/trial-balance
├── /reports
├── /evidence/[recordType]/[id]            GPS photo gallery for a record
├── /imports
├── /notifications
└── /settings/profile | /settings/preferences
```

**External portals (same shell, reduced nav):**

- Contractor: `/portal/work-orders`, `/portal/bills`, `/portal/payments`
- Client: `/portal/projects`, `/portal/bills`, `/portal/statements`

**URL rules:** lowercase, hyphens, no IDs-only where a human number exists (`/inventory/grn/GRN-26-0041` or `/inventory/grn/grn_01h...` with number displayed). Prefer stable UUIDs in path and show business number in the heading.

**Breadcrumb:** Dashboard / Inventory / GRN / GRN-26-0041

---

## 8. Personas, Jobs, and Dashboard UX

| Persona | Landing | First jobs |
|---|---|---|
| Site supervisor | Requests | Create request, attach GPS photo, see status |
| Store keeper | Stock | Fulfil request, GRN, issue, transfer, low stock |
| Purchase | Orders | Requisition queue, PO, vendor, GRN link |
| Project manager | Approvals | Approve requests and contractor bills |
| Accounts | Vouchers | Payments, cash/bank book, contractor deductions |
| Owner | Dashboard | Pending approvals, cash, stockouts, recent bills |
| Contractor | Portal bills | Submit RA bill, see deductions and payment status |
| Client | Portal project | View permitted bills/progress only |

### Dashboard composition (owner/PM default)

1. **Action strip:** count of pending approvals, open requests, low-stock items, overdue GRNs. Each card is a link with gold marker if count > 0.
2. **Work queue:** last 8 items needing this user (TanStack Query `dashboard.queue`).
3. **Stock health:** 5 lowest items at current site/store.
4. **Money snapshot:** cash + bank from dummy ledgers (not a fake P&L).
5. **Activity:** audit feed.

Supervisor dashboard replaces money snapshot with “My requests”: a vertical list with status filters on phones and an optional kanban on wide screens (Draft / Submitted / Approved / Partial / Closed). Phone dashboards prioritize pending tasks before secondary KPIs and charts.

Empty dashboard: “No pending work in this site. Switch site or create a material request.”

---

## 9. ERP Frontend Practices (non-negotiable)

1. **Scope is always visible.** Firm, project, site (and store when relevant) sit in the topbar. Creating a document without scope is blocked.
2. **Documents have a header pattern:** business number (mono), status badge, dates, parties, amounts, primary actions. Body is editable line cards on phones and a lines table where space permits. Footer is totals + approval timeline + audit.
3. **Finite statuses.** Use the same badge component and colour tokens. No free-text status.
4. **Posted/approved records are read-only.** Edits go through reverse/adjust flows when those exist. UI disables fields and shows “Posted. Create an adjustment.”
5. **Money and qty never use raw inputs without units.** Qty + UOM. Amount INR. Tax fields labelled GST/TDS when in schema.
6. **Double submit protection.** Mutations disable the button, show pending, use mutation keys. Idempotency key in dummy client.
7. **Filters live in the URL.** Table page, sort, q, status, dateFrom, dateTo, projectId.
8. **Optimistic UI only when failure is easy to undo** (approve comment). Stock posting is not optimistic; wait for mutation success.
9. **Audit strip** on every document: actor, action, timestamp IST.
10. **Permissions:** `can(module, action)` helper. Hide primary button if not allowed; still show read-only if view is allowed.
11. **Evidence:** GPS photo is a first-class attachment, not a generic file list. Show map accuracy and exception reason.
12. **Import:** preview, row errors, no silent post of invalid batches.
13. **Accessibility:** labels above inputs, errors below, no placeholder-as-label, keyboard path for approve/reject, contrast AA on navy sidebar (inverse text).
14. **No payroll screens, nav items, or mock files.**

---

## 10. Data Architecture (dummy JSON → real API)

### 10.1 Contract

All UI talks to `DataClient`. Screens never import JSON files directly.

```ts
export interface ListParams {
  q?: string
  page: number
  pageSize: number
  sort?: string
  filters: Record<string, string | undefined>
  scope: { firmId: string; projectId?: string; siteId?: string; storeId?: string }
}

export interface ListResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface DataClient {
  auth: { login(input: LoginInput): Promise<Session>; logout(): Promise<void>; me(): Promise<Session> }
  dashboard: { get(scope: ListParams["scope"]): Promise<DashboardDto> }
  requests: CrudWithTransition<"material-requests">
  inventory: { items: Crud; stock: StockApi; grn: DocumentApi; issues: DocumentApi; transfers: DocumentApi }
  purchasing: { vendors: Crud; requisitions: DocumentApi; orders: DocumentApi; bills: DocumentApi }
  contractors: { parties: Crud; workOrders: DocumentApi; bills: DocumentApi }
  finance: { ledgers: Crud; vouchers: DocumentApi; books: BooksApi }
  approvals: { inbox(params: ListParams): Promise<ListResult<ApprovalDto>>; act(id: string, input: ApprovalAction): Promise<void> }
  evidence: { list(recordType: string, id: string): Promise<EvidenceDto[]>; upload(input: EvidenceUpload): Promise<EvidenceDto> }
  imports: { preview(file: File, kind: ImportKind): Promise<ImportPreview>; commit(batchId: string): Promise<ImportResult> }
  notifications: { list(): Promise<NotificationDto[]>; markRead(id: string): Promise<void> }
}
```

`NEXT_PUBLIC_DATA_SOURCE=json-server | http`

- **json-server:** `DataClient` calls the same-origin Next API gateway backed by json-server. Committed `mocks/data/seed.json` initializes ignored `mocks/data/db.json`; additions and updates persist across restarts. Mock workflow commands validate and commit related stock/document changes together. Do not import JSON directly into screens.
- **http:** `HttpClient` uses `fetch` to NestJS, same Zod parse on the way in.

Parse every payload with Zod. If parse fails, show “Data contract error” in a non-blocking banner (dev) and a generic error (prod).

### 10.2 TanStack Query

```ts
export const queryKeys = {
  session: ["session"] as const,
  dashboard: (scope: object) => ["dashboard", scope] as const,
  requests: {
    all: ["requests"] as const,
    list: (params: object) => ["requests", "list", params] as const,
    detail: (id: string) => ["requests", "detail", id] as const,
  },
  // same pattern per domain
}
```

Rules:

- List + detail prefetch on row hover (`queryClient.prefetchQuery`).
- `staleTime` 30s for lists, 10s for inbox, Infinity for item masters until invalidation.
- Mutations `onSuccess` invalidate the domain keys and the dashboard.
- No fetch in `useEffect`. Server Components may prefetch with `dehydrate` + `HydrationBoundary` for dashboard and first list pages.
- Client components own interactive tables and forms.
- Parallel dashboard widgets: one `getDashboard` call (dummy joins internally). Do not waterfall 6 client fetches.
- Heavy charts: `next/dynamic` ssr false.

### 10.3 Next.js fetching split

| Data | Where |
|---|---|
| Session, permissions, scope options | Server layout (cookie/dummy cookie) then React Query hydrate |
| Dashboard, registers, documents | Prefetch on server when cheap; Query on client for filters |
| Mutations | TanStack Query mutation wrapping `DataClient` (later: server actions with Zod) |
| File upload GPS | Client `FormData` to client method; dummy stores object URLs |

---

## 11. Zod Contracts (canonical)

Keep schemas in `/schemas`. Infer types with `z.infer`. Examples:

```ts
export const moneySchema = z.object({
  amount: z.number().finite().nonnegative(),
  currency: z.literal("INR"),
})

export const qtySchema = z.object({
  value: z.number().finite().nonnegative(),
  uom: z.string().min(1),
})

export const gpsSchema = z.object({
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),
  accuracyM: z.number().nonnegative().nullable(),
  capturedAt: z.string().datetime(),
  receivedAt: z.string().datetime(),
  permission: z.enum(["granted", "denied", "unavailable"]),
  exceptionReason: z.string().max(240).nullable(),
})

export const statusSchema = z.enum([
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "returned",
  "partial",
  "fulfilled",
  "posted",
  "paid",
  "partially_paid",
  "cancelled",
])

export const materialRequestSchema = z.object({
  id: z.string().uuid(),
  number: z.string(),
  firmId: z.string().uuid(),
  projectId: z.string().uuid(),
  siteId: z.string().uuid(),
  requestedBy: z.string().uuid(),
  requiredOn: z.string(),
  priority: z.enum(["normal", "urgent"]),
  purpose: z.string().min(3).max(500),
  status: statusSchema,
  lines: z.array(z.object({
    id: z.string().uuid(),
    itemId: z.string().uuid(),
    qtyRequested: qtySchema,
    qtyApproved: qtySchema.nullable(),
    qtyIssued: qtySchema.nullable(),
  })).min(1),
  evidenceIds: z.array(z.string().uuid()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
```

Forms use the same schemas with `.omit({ id: true, number: true, createdAt: true })` plus UI refinements.

---

## 12. Dummy JSON (replaceable)

Path: `mocks/data/`. UTF-8. Indian names, real-feeling construction items, messy-but-valid numbers. No Acme/John Doe.

### 12.1 Files

| File | Purpose |
|---|---|
| `session.json` | Current dummy user options |
| `users.json` | Users, roles, scopes |
| `firms.json` | Firms (PAN/GST placeholders) |
| `projects.json` | Projects |
| `sites.json` | Sites |
| `stores.json` | Stores |
| `cost-codes.json` | Work packages |
| `items.json` | Materials |
| `stock-balances.json` | Opening / on-hand |
| `stock-ledger.json` | Movements |
| `material-requests.json` | Site requests |
| `vendors.json` | Vendors |
| `purchase-requisitions.json` | PRs |
| `purchase-orders.json` | POs |
| `grn.json` | Receipts |
| `material-issues.json` | Issues |
| `stock-transfers.json` | Transfers |
| `contractors.json` | Contractor parties |
| `work-orders.json` | Work orders |
| `contractor-bills.json` | RA bills |
| `ledgers.json` | Chart / parties |
| `vouchers.json` | Receipt/payment/journal/contra |
| `approvals.json` | Inbox items |
| `evidence.json` | Photos metadata (no huge binaries; use `/public/mocks/photos`) |
| `notifications.json` | In-app notices |
| `audit.json` | Audit events |
| `dashboard.json` | Pre-aggregated widgets (the mock API may instead derive) |
| `imports/sample-opening-stock.csv` | Import fixture |

### 12.2 Sample records

`projects.json`

```json
[
  {
    "id": "11111111-1111-4111-8111-111111111111",
    "firmId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "code": "PRJ-BLR-04",
    "name": "Whitefield Tower Superstructure",
    "clientName": "Raya Infra Developers",
    "status": "active",
    "contractValueInr": 186500000,
    "managerUserId": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    "startsOn": "2026-04-01",
    "endsOn": "2027-09-30"
  }
]
```

`items.json` (excerpt)

```json
[
  {
    "id": "item-tmt-12",
    "code": "STL-TMT-12",
    "name": "TMT Bar 12 mm Fe500D",
    "category": "steel",
    "uom": "MT",
    "hsn": "7214",
    "reorderLevel": 8,
    "specifications": "IS 1786 Fe500D"
  },
  {
    "id": "item-opc-43",
    "code": "CEM-OPC-43",
    "name": "OPC 43 Grade Cement",
    "category": "cement",
    "uom": "BAG",
    "hsn": "2523",
    "reorderLevel": 200,
    "specifications": "50 kg bag"
  }
]
```

`material-requests.json` (excerpt)

```json
[
  {
    "id": "req-0001",
    "number": "MR-26-0118",
    "firmId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "projectId": "11111111-1111-4111-8111-111111111111",
    "siteId": "site-wf-podium",
    "requestedBy": "user-sup-arjun",
    "requiredOn": "2026-10-18",
    "priority": "urgent",
    "purpose": "Podium slab pour, grid A-D",
    "status": "submitted",
    "lines": [
      {
        "id": "req-0001-l1",
        "itemId": "item-opc-43",
        "qtyRequested": { "value": 420, "uom": "BAG" },
        "qtyApproved": null,
        "qtyIssued": null
      }
    ],
    "evidenceIds": ["ev-0008"],
    "createdAt": "2026-10-15T12:10:00.000Z",
    "updatedAt": "2026-10-15T12:12:00.000Z"
  }
]
```

`contractor-bills.json` line math must be dummy-consistent: previous + current = cumulative; net = gross - advance - retention - TDS - material recovery - penalty.

When the real API lands: replace the json-server adapter, keep JSON only as Playwright fixtures if useful, point `HttpClient` at `/api/v1`. **Do not change Zod field names without a versioned migration.**

---

## 13. Screen Requirements (MVP)

Every list screen: search, status filter, date range where relevant, export CSV (client-side from current filtered dummy), empty/loading/error, row click to detail.

Every create screen: RHF + Zod, save draft, submit, discard.

### 13.0 Mobile requirements for every module

- Registers become readable record lists: number/name, status, site/party, key amount or quantity, and date. Use a clearly labelled detail link and separate actions. Secondary fields remain available in detail. No workflow may require desktop mode.
- Phone document lines use stacked cards with labelled quantities, units, prices, and totals. Add/edit one line in a full-screen editor where needed. Contractor bills show previous/current/cumulative values together per item; voucher lines retain debit/credit labels and visible balance feedback.
- Use single-column phone forms grouped by task. Multi-step flows retain values and show progress. Appropriate keyboard/input types, autocomplete, persistent labels, inline validation, and focus on the first invalid field are required. Input text is at least 16px. Permit password managers and paste.
- Place Save draft and Submit in a reachable action area; use one visually primary action. Explain validation failures, preserve values after errors, and prevent repeated submissions while a mutation is pending. Confirm discard of unsaved work.
- Mobile search and filters expose active filter count, Apply, and Clear. Long result sets use accessible pagination or virtualization without losing focus or scroll context.
- True comparison tables (trial balance, import preview) may use a contained, labelled horizontal scroller with a visible scroll cue and key-column context. Provide per-record detail/error review on phones; never hide amounts, errors, or submission controls off-screen.
- Camera capture, upload progress, permission denial, GPS unavailable, retry, and cancellation each have a usable phone state. Permission requests occur when the user starts capture. Preserve the form if the OS interrupts capture.
- Apply these rules to login, masters, purchasing, finance, import, reports, settings, and external portals as strictly as material requests.


### 13.1 Auth

- Login: email, password, “Stay signed in” (dummy ignores), error inline.
- After login, restore last firm/project/site from localStorage schema version `civil-erp.scope.v1`.
- Contractor/client land on portal home, not owner dashboard.

### 13.2 Organisation

Masters as phone record lists with full-page create/edit, and editable tables + slide-over create on wide screens. Users: assign roles and project/site scopes. Dummy passwords never displayed.

### 13.3 Inventory

- **Items:** code, name, UOM, HSN, reorder.
- **Stock summary:** store × item, on-hand, reserved, reorder flag (gold).
- **Ledger:** chronological movements with source document links.
- **GRN:** header (vendor, PO optional, store, date) + lines (item, qty, rate) + GPS photos of materials.
- **Issue:** against request when present; partial issue leaves request `partial`.
- **Transfer:** from-store / to-store, in-transit dummy status optional (MVP: instant).

### 13.4 Site material requests

Mobile-first form: site (locked to scope), required date, priority, purpose, lines (item search combobox), attachments.

Approval: approve all, reject with reason, amend qty (writes `qtyApproved`).

Fulfilment panel for store: issued qty per line, remaining.

### 13.5 Purchasing

Vendor master. PR from unfulfilled request. PO with lines, delivery site, status. Register of outstanding POs. Bill register can be read-only MVP if time boxed; link to GRN.

### 13.6 Contractor billing

Work order header + rate items. Bill: previous / current / cumulative columns (frozen first columns on desktop). Deductions section. Status workflow. Portal: own records only.

### 13.7 Finance MVP

Ledger list. Voucher form: type, date, lines (account, debit, credit, project tag). Client-side balance check (`sum(debit) === sum(credit)`) before submit. Cash book, bank book, day book, trial balance as read-only tables from dummy aggregations.

Posted voucher: no edit.

### 13.8 Approvals and audit

Unified inbox grouped by type. Detail: document snapshot + comments + Approve / Return / Reject. Timeline component.

### 13.9 GPS evidence

In-app capture only (file picker fallback if camera blocked). Request geolocation. Show accuracy. If denied: required reason, badge “No GPS”. Store metadata matching `gpsSchema`. Gallery on the document. Do not draw a live map tracker.

### 13.10 Excel import

Upload, map columns (pre-mapped for sample templates), preview table with row error chips, commit. Mock commits persist material masters or opening stock in json-server. Opening-stock imports accept material/store codes, reject existing balances, and create ledger movements atomically.

### 13.11 Notifications

Bell popover + full page. Types: approval assigned, request status, GRN posted. Mark read.

### 13.12 Reports

Reuse list queries with print stylesheet (`@media print` hide chrome). PDF via browser print in MVP.

---

## 14. Component Specs (build these once)

| Component | Behaviour |
|---|---|
| `AppShell` | Adaptive app bar, phone navigation stack, role-based bottom tabs, tablet rail, desktop sidebar |
| `ScopeSwitcher` | Firm/project/site; Query invalidation on change |
| `PageHeader` | Title, description, actions |
| `FilterBar` | nuqs-bound inputs |
| `DataTable` / `RecordList` | Shared query and actions; phone record cards, wide-screen tables; compact density only where suitable |
| `StatusBadge` | Token colours, accessible text |
| `DocumentHeader` | Number, status, meta grid |
| `LineEditor` | Phone line cards/full-screen item editor; wide-screen table; labelled qty, UOM, amount |
| `TotalsBar` / `MobileActionBar` | Safe-area-aware totals/actions, reserved content space, keyboard-safe placement |
| `ApprovalTimeline` | Vertical steps |
| `AuditStrip` | Compact history |
| `EvidenceCapture` | Camera + GPS + preview |
| `EmptyState` | Icon, title, one action |
| `PermissionGate` | children or null |
| `ConfirmPostDialog` | Typed confirm for posted stock/finance |
| `MoneyText` / `QtyText` | Formatting wrappers |
| `CommandPalette` | cmdk |

Code style example (illustrative):

```tsx
export function MoneyText({ amount }: { amount: number }) {
  const value = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount)

  return <span className="font-mono tabular-nums">{value}</span>
}
```

---

## 15. States, Motion, and Content

Required on every data view: **skeleton**, **empty**, **error + retry**, **forbidden**, **success toast** for mutations.

Motion: 180ms opacity/transform on dialogs and sidebar. No scroll-hijack, no marquee, no gradient text. `prefers-reduced-motion: reduce` disables transitions.

Copy: plain operational English. Buttons: “Submit request”, “Approve”, “Record GRN”, “Post voucher”. Not “Unleash” or “Seamless”.

Dummy people: Arjun Mehta (supervisor), Kavitha Rao (PM), Imran Shaikh (store), Nandini Iyer (accounts), work sites Whitefield / Electronic City, vendors “Sri Malhar Steels”, “Deccan Cement Agency”.

---

## 16. Accessibility, Security, PWA

- WCAG 2.2 AA target. Normal text contrast ≥4.5:1, large text and meaningful UI boundaries ≥3:1. Status always includes a text label; decorative border tokens alone must not identify inputs. Test VoiceOver and TalkBack, 200% text enlargement, keyboard navigation, focus restoration, and live announcements. Sidebar inverse text on `#0B1F42` is `#FFFFFF` / `#D7E1EF` only.
- Focus visible always. Dialogs trap focus.
- Tables: `caption`, sortable column buttons.
- Do not store passwords in JSON in clear if avoidable; dummy hash field `password: "demo"` documented in README for local only.
- Never log tokens. Strip GPS from logs except truncated coords in audit.
### PWA lifecycle and offline contract (MVP)

- Manifest: stable app ID, name “Civil ERP”, short name, start URL, scope, standalone display, theme `#0B1F42`, background `#FFFFFF`, standard 192/512 icons and maskable icon. Supply an Apple touch icon. Installation and browser use must both support the core workflows.
- Offer contextual installation help when supported; provide iOS-specific instructions where no install prompt API exists. Dismissal must not block work. Feature-detect capabilities rather than assuming install, camera, GPS, or background APIs exist.
- Cache versioned static shell assets and an offline fallback. Do not indiscriminately cache authenticated API responses, financial records, or mutation requests. Unavailable data must have an honest offline state; never represent stale data as current stock or a completed post.
- Persist material-request text/line drafts locally with schema version, user and scope identity, timestamp, and visible saved/failed state. Restore only for the same authenticated user and scope. Clear user-local data on logout. Handle storage denial/quota errors explicitly; photo blobs are not guaranteed offline in MVP, and the UI must identify attachments requiring recapture.
- Disable submit/approve/post while offline with a reason and retain the draft. On reconnect, refresh permissions and relevant data before an explicit user retry. Never automatically replay financial or stock mutations. An uncertain server outcome must be reconciled before retry to avoid duplicates.
- Notify when an app update is ready; activate/reload only at a safe point after drafts are saved. A service-worker update must not interrupt an edit or create a stale-shell loop.
- On resume, revalidate session and data without discarding local edits. Expired sessions return users to their intended route after sign-in; locally retained data must not appear for another account.

Performance targets: LCP < 2.5s on dashboard with dummy data, CLS < 0.1 (skeletons reserve height), INP < 200ms on table filter.

---

## 17. Testing Strategy

| Level | Tool | What |
|---|---|---|
| Unit | Vitest | formatters, Zod schemas, status transitions, permission helper |
| Component | Testing Library | Request form validation, approval actions, table filter |
| E2E | Playwright | Login, create request, approve, issue stock, GPS exception path, contractor portal isolation |
| Visual (required) | Playwright screenshots + real-device review | Phone/tablet/desktop shell, lists, forms, sheets, keyboard and safe-area states |

Coverage expectation: schemas and permission matrix 100% of branches; UI happy path e2e for the four core workflows in the proposal (request-to-issue, purchase-to-receipt, contractor bill, voucher balance).

---

### Mobile release gate

Test all route templates at 320, 360, 390, 430, 768, 1024, 1280, and 1440 CSS px, plus phone landscape and desktop zoom/reflow. Exercise the four core workflows on real iOS Safari and Android Chrome in both browser and installed PWA modes; record device/OS/browser versions. Emulation alone is insufficient.

Required evidence: no whole-page horizontal scroll; ≥48px hit targets; no clipped content at 200% text size; focused inputs and final actions reachable with the keyboard open; safe-area clearance; list state restored after Back; no data loss on rotation/resume; accessible modal dismissal; permission-denied camera/GPS recovery; offline draft restoration, storage failure, reconnect, session expiry, and safe app update. Include long names, large INR values, empty/error/loading states, and role-restricted navigation.

Lighthouse is supplementary. Manual touch, screen-reader, keyboard, and installed-mode checks must pass before release. Measure existing performance targets on a representative mid-range Android device with a documented throttled mobile network profile, not only desktop localhost.

---

## 18. Implementation Plan (frontend slices)

Build vertically (one workflow working) rather than all masters first.

1. Mobile tokens, phone AppShell/navigation, safe areas, login, dummy session, scope switcher, PWA shell and offline fallback; verify on iOS/Android before expanding the shell.
2. Query client, DataClient, dashboard from dummy.
3. RecordList + adaptive DataTable + items + stock summary; verify phone/tablet/desktop parity.
4. Material request create/list/detail + durable local drafts + approvals; verify keyboard and Back flows.
5. GRN + issue + ledger updates in the json-server command layer.
6. Vendors + PO.
7. Contractor work order + RA bill columns.
8. Vouchers + books.
9. GPS capture + import preview.
10. Notifications, PWA update/reconnect checks, Playwright and mandatory real-device/accessibility release gate. Apply responsive checks in every preceding slice.

---

## 19. Boundaries

**Always**

- Use DataClient + Zod. Keep filters in URL. Format INR/IST in shared helpers. Follow brand tokens. Gate by permission. Update this PRD when a screen changes.

**Ask first**

- New npm dependency, new module/route, dark-mode content canvas, live map, chat, Tally, GST portal, changing dummy field names that would break the future API.

**Never**

- Payroll UI. Default unbranded shadcn colours. Fetch inside random `useEffect`. Silent edit of posted docs. Mix another UI kit. Fake P&L if trial balance dummy cannot support it. Live location tracking.

---

## 20. Success Criteria

- [ ] shadcn theme matches brand tokens; navy sidebar + gold pending markers + blue primary buttons.
- [ ] Every MVP route and both portals meet sections 6 and 13.0, with native-feeling phone navigation and full workflow parity.
- [ ] All mobile release-gate checks in section 17 pass with recorded device evidence; no mobile checks remain optional.
- [ ] Safe areas, keyboard, Back/scroll restoration, 48px touch targets, text scaling, and permission failures are verified.
- [ ] PWA install, offline draft recovery, reconnect reconciliation, session isolation, and non-disruptive updates pass on iOS and Android.
- [ ] Dummy JSON drives all MVP screens; `NEXT_PUBLIC_DATA_SOURCE=http` is a single adapter switch.
- [ ] TanStack Query keys invalidate correctly after mutations.
- [ ] Zod rejects bad dummy/API payloads instead of crashing the tree.
- [ ] Request → approve → partial/full issue works in Playwright.
- [ ] Contractor user cannot open internal finance routes.
- [ ] GPS flow records coordinates or an exception reason.
- [ ] Tables virtualize; filters survive reload via nuqs.
- [ ] No payroll references in nav, routes, or mock files.
- [ ] Lighthouse accessibility >= 90 on dashboard and request form.

---

## 21. Open Questions (do not block dummy UI)

1. Final approval matrix and amount thresholds.
2. Weighted-average vs FIFO (stock value column can be hidden until confirmed).
3. Whether client portal sees RA PDFs or totals only.
4. Hosting URL and PWA icon lockup / wordmark file.

---

**Document status:** Frontend-only PRD for the Construction & Civil Works ERP MVP. Implementation should not start new screens that are not listed here without updating this file.


## 22. Implementation additions — 16 October 2026

- User-requested typography: locally hosted DM Sans variable interface text, Manrope variable headings, and IBM Plex Mono numbers/document IDs with real font weights.
- Register design: sortable labelled columns, selection and filtered/selected CSV export, column visibility, comfortable/compact desktop rows, URL-bound filtering and paging (10/25/50). Stock columns show material/code, category, store, on hand, reserved, reorder level, and health. Phone record cards remain the default.
- json-server 0.17.4 owns local persistence. A gateway and mock command endpoint enforce demo role/site checks, status transitions, balanced vouchers, stock availability, receipt limits, and operation-ID deduplication. Real backend integration replaces this adapter.
- Schema examples above are illustrative. Implemented IDs are UUIDs. Shared line editing adds `qty`/`rate` while request lines retain `qtyRequested`/`qtyApproved`/`qtyIssued`.
- Offline scope: local drafts survive interruption and reconnect; cold offline launch presents a recovery screen instead of cached private records. Production device testing remains mandatory.
- The source and test coverage are documented in `README.md` and `docs/IMPLEMENTATION.md`.
