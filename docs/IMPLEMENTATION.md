# Implementation contract

## Frontend decisions added during implementation

1. `json-server@0.17.4` is pinned because its programmable router/lowdb interface supports durable JSON plus mock transaction commands. `seed.json` is immutable source data; `db.json` is local runtime data.
2. Routes share typed module definitions and adaptive register/editor/detail components. This keeps phone and desktop workflows equivalent and allows endpoint replacement without duplicating screens.
3. The API gateway exposes `GET /api/<resource>`, `GET /api/<resource>/<id>`, and `POST /api/command` with `{ resource, action, id?, input?, operationId }`. Auth uses `/api/auth/login`, `/me`, `/logout`, and `/reset`. The real backend can implement this contract or be mapped in the client.
4. A command's permission, document status, references, quantities, and balances are checked before the cloned JSON state is written. Post failures do not partially change stock. Posted records are immutable.
5. Material-request quantities retain `qtyRequested`, `qtyApproved`, and `qtyIssued`. Line editors also maintain numeric `qty` and `rate` for shared document editing. All seeded IDs are UUIDs, resolving the PRD's illustrative non-UUID sample IDs.
6. Contractor bills must use an approved work order for the same party/site. Work descriptions and rates match agreed lines. Previous certified quantities are derived from approved/paid bills; cumulative quantities cannot exceed the work order.
7. Tables paginate before rendering; virtualization is unnecessary at the selectable 10/25/50 row sizes. CSV exports contain the filtered or selected records, not only the visible page.
8. Responsive Radix dialogs provide modal focus containment and bottom-sheet presentation on phones. Full forms and details use routes. Native camera/file-picker support is capability-based.
9. User-requested typography refinement: DM Sans UI, Manrope headings, IBM Plex Mono numeric/document text; variable weights and local font files.
10. Offline request drafts are versioned and scoped by user/site/document. Cold offline launch requires reconnection before authenticated data can be displayed. Private API responses are not service-worker cached.

## Testing

Commands and test configuration live in the repository. Tests use an isolated temporary database. `e2e/workflows.spec.ts` covers posting transactions and invalid-state recovery. `e2e/workspace.spec.ts` covers browser navigation, request persistence, portal isolation, filters, and responsive widths. Screenshots are written under `docs/screenshots`.

Physical device acceptance remains a release gate: iOS Safari and Android Chrome, browser and installed mode, keyboard/safe-area behavior, assistive technology, capture permissions, and constrained-network performance.
