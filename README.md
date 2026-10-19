# Civil Workspace

A mobile-first construction ERP frontend built with Next.js, React, TypeScript, Tailwind, TanStack Query/Table, React Hook Form, Zod, and owned Radix/shadcn-style primitives. Local demo data is persisted by **json-server**, not browser-only state.

## Run locally

Requires Node.js 22+ and pnpm.

```sh
pnpm install
pnpm dev
```

Open [Civil Workspace](http://127.0.0.1:3000). `pnpm dev` starts the frontend on 3000 and the local-only json-server on 3001. A missing runtime database is copied from the committed seed automatically.

Sign in using **owner@civil.example** / **demo**. The login screen offers supervisor, manager, store, purchase, accounts, contractor, and client roles; their emails follow `<role>@civil.example`. No real email is sent and no bank transaction is initiated.

```sh
pnpm build              # Production build
pnpm start              # Production frontend + local demo server
pnpm typecheck
pnpm lint
pnpm test               # Domain validation and permission tests
pnpm test:e2e           # Isolated JSON database + browser/workflow tests
pnpm db:reset           # Explicitly replaces runtime demo data with the seed
```

Browser tests use installed Google Chrome by default. Change `channel` in `playwright.config.ts` if using Playwright Chromium instead. Tests launch independent ports 3100/3101, use `.next-e2e`, and remove their temporary database on exit; normal demo data is preserved. After `pnpm build`, use `E2E_PRODUCTION=1 pnpm test:e2e` to test the production build on the same isolated ports. `E2E_BASE_URL` can target an already running test deployment.

## Included workspace

- Responsive desktop sidebar, tablet rail, mobile bottom navigation, scoped site selector, module search, notifications, profile and install help.
- Dashboard derived from records, approval inbox, stock watch, cash/bank balances, and activity.
- Searchable, sortable registers with URL filters, row selection, CSV export, column controls, density controls, and pagination. Stock has specific quantity, store, reorder, and status columns. Phones use record cards.
- Organisation masters, users/roles, materials, vendors, contractors, accounts, and project/site/store records.
- Material requests: create/edit drafts, local draft recovery, submit, approve/amend quantities, return/reject, partial/full issue.
- Purchasing: requisitions, purchase orders, linked receipts, and a read-only purchase bill register.
- Inventory: receipt/issue/transfer posting, stock balances, movement ledger, and duplicate-post protection.
- Contractor work orders and running bills: current/previous/cumulative quantities, agreed rates, deductions, approval, and restricted portal views.
- Finance: balanced voucher validation, immutable posted records, cash/bank/day books, and trial balance from posted entries.
- Photo attachments with GPS accuracy or required exception reason; compressed demo images persist in JSON.
- CSV/XLSX material and opening-stock imports: column mapping, duplicate checks, row errors, atomic batch commit, and downloadable template.
- Print/PDF styles, manifest/icons, update prompt, offline fallback, and local request drafts.

## Data architecture

```text
Screen → TanStack Query → DataClient → Next API gateway → json-server
                                                └── future real API
```

- `mocks/data/seed.json`: committed initial dummy records.
- `mocks/data/db.json`: ignored runtime data; json-server persists every add/update.
- `mocks/server.cjs`: json-server REST router plus a mock command endpoint. Multi-record stock operations validate against a cloned state and write once. Failed validation leaves stored state unchanged. Operation IDs make repeated commands idempotent within the retained 500-operation window.
- `lib/api.ts`: the replaceable frontend client. No screen imports seed JSON.
- `schemas/index.ts`: response contracts; `lib/domain.cjs`: shared mock business rules and role checks.
- `lib/modules.ts`: route, field, and component metadata for consistent modules.
- `app/api/[...path]/route.ts`: same-origin gateway, mock session cookie, record-scope filtering, and optional real API forwarding.

Copy `.env.example` to `.env.local` to change configuration. The demo defaults work without it. To integrate real services, set `NEXT_PUBLIC_DATA_SOURCE=http` and `API_BASE_URL`; the gateway forwards auth, reads, and commands to that base. The backend must implement the documented contract or `lib/api.ts` must map its endpoints. API-backed authentication, authorization, transactional integrity, upload storage, and validation belong in the real backend.

The local session is a signed, HttpOnly demo cookie. **json-server and the default demo password are development infrastructure, not production authentication.** Keep port 3001 on loopback. Replace the entire mock auth/data mode before handling live business information.

## Design

DM Sans variable font for interface text, Manrope variable font for headings, IBM Plex Mono for document identifiers and money. Fonts are served locally through `next/font/local`. Brand: navy application chrome, blue actions, restrained gold attention markers. Mobile forms have 16px inputs, safe-area-aware action bars, full-page editors, and 48px primary touch targets.

## Practical limits and release checks

- Real iOS/Android devices, installed-mode lifecycle, OS keyboard behavior, VoiceOver/TalkBack, and network performance require physical-device QA; desktop emulation is not a substitute.
- Offline support keeps an in-progress request draft on its device and restores it after authentication/reconnection. Cold offline navigation shows a recovery page; it does not expose cached private ERP data or replay mutations.
- Photos use device camera/file-picker capabilities. GPS is capture-session metadata, not evidence authenticity verification. Live uploads should use object storage instead of JSON data URLs.
- Imports cover material masters and opening stock for new material/store pairs. Existing balances are never overwritten. Live financial opening-balance migration still needs an agreed reconciliation workflow.
- Password reset clearly reports demo behavior. Real reset delivery and tax/accounting integrations are not simulated as completed actions.
- Cross-device collaboration/concurrency, final approval thresholds, stock valuation, adjustments, and period locks must be enforced by the production backend.

See the frontend PRD and `docs/IMPLEMENTATION.md` for the implementation contract and verification record.
