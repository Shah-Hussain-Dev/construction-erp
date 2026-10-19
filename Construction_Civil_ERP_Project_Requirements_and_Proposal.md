# Construction & Civil Works ERP
**Project Requirements, Scope, Architecture & Delivery Proposal**  
**Refined project brief | 15 October 2026**

## 1. Executive Summary
The proposed product is a web-based, installable Progressive Web App (PWA) for an Indian construction and civil-construction business. It brings project/site operations, inventory, purchasing, contractor billing, accounting, approvals, communication and management reporting into one system.

The system is intended to support multiple firms, projects, sites, stores and users. Employees, supervisors, contractors and clients may receive separate accounts, but each account will only see the modules and records explicitly permitted by an administrator.

**Confirmed by the client:** construction and civil construction projects; India with INR as the primary currency; English-only interface; contractor/client logins with permission-controlled access; GPS-enabled photos for construction goods/materials with location and timestamp; approximately two months to go live; development budget of ₹2,00,000–₹2,50,000 excluding hosting, database and other running costs.

> **Feasibility note:** The full ERP described in the source requirements is substantially larger than a two-month, ₹2–2.5 lakh build. This proposal separates a focused Phase 1 MVP from later phases. The stated budget and timeline are realistic only with a signed MVP scope, limited integrations, timely client decisions and usable sample data.

## 2. Confirmed Decisions and Open Assumptions

| Topic | Decision / status |
|---|---|
| Industry | Construction and civil construction projects |
| Country/currency | India; INR primary currency |
| Interface language | English only; no language module |
| External access | Contractor and client logins required, with configurable module and record permissions |
| GPS photos | Location- and timestamp-associated material/goods photos; continuous live tracking is not confirmed |
| Stock valuation | Recommend weighted-average for MVP, subject to approval by the client/accountant; consider FIFO if required by existing policy |
| Target delivery | Approximately 2 months |
| Development budget | ₹2,00,000–₹2,50,000 |
| Excluded costs | Hosting, database, file storage, domain, third-party services and ongoing maintenance |
| Year-one scale | Number of firms, projects, sites, stores and users not yet provided |
| Approval matrix | Must be approved during discovery |
| Data migration | Sample Excel files, history period and data volume still required |

Unanswered items are treated as assumptions or decisions required—not as confirmed requirements.

## 3. Goals and Scope Principles
- Create one reliable system of record for project finance, procurement, stock and contractor billing.
- Track transactions by firm, project, site and store, with consolidated management views for authorised users.
- Control purchases, payments, stock adjustments and bills through approvals.
- Give site staff a simple mobile-first workflow for requests and delivery evidence.
- Maintain audit history and protect posted financial records from silent edits.
- Deliver a focused MVP first; avoid committing the entire ERP catalogue to the initial budget.

## 4. Recommended Eight-Week MVP

| Priority | Module | MVP deliverable |
|---|---|---|
| P0 | Authentication and access | Login, password reset, user management, predefined roles, module/action permissions and firm/project/site data scopes |
| P0 | Organisation setup | Firm, project, site, store and cost-code masters; user assignments |
| P0 | Dashboard | Role-based summary of pending approvals, site requests, low stock and recent activity |
| P0 | Inventory | Item/unit masters, opening stock import, goods receipt, material issue, store transfer, stock ledger and stock summary |
| P0 | Site material requests | Supervisor request, project manager approval/rejection, full/partial fulfilment and status tracking |
| P0 | Purchasing | Vendor master, requisition, purchase order, goods receipt linkage and purchase register |
| P0 | Contractor billing | Basic work order, bill quantities (previous/current/cumulative), agreed deductions and approval status |
| P0 | Basic finance | Ledger/party masters, receipt/payment/journal vouchers, cash/bank book and agreed ledger reports; balanced voucher validation if double-entry is in scope |
| P0 | Approvals and audit | Simple configurable approval steps for agreed document types; actor, timestamp, action and comment history |
| P0 | GPS photo evidence | Mobile capture flow that requests location permission and stores coordinates, accuracy, capture time where available, server receipt time and linked record |
| P0 | Excel import | Agreed templates for masters/opening balances/opening stock, validation and row-level errors |
| P1 | PWA | Responsive/installable app; limited offline request drafts only if time permits |
| P1 | Notifications | In-app notifications for approvals and request status changes |
| Later | Advanced finance | Full double-entry accounting suite, bank reconciliation, inter-firm eliminations, advanced GST/TDS reports |
| Later | Full chat | Real-time chat, channels, read receipts, offline queue and robust media handling |
| Later | Advanced construction controls | BOQ, detailed measurement book, budgets, DPR, labour attendance and equipment management |
| Later | Integrations | GST/e-invoice/e-way bill APIs, WhatsApp Business API, bank APIs and Tally integration |

**Scope guardrail:** The client should prioritise either deeper finance/accounting or deeper site/procurement workflows for the first release if resources are constrained. Full production depth across every module is unlikely within eight weeks at this budget.

## 5. Full Product Module Catalogue (Roadmap)

### 5.1 Organisation and access control
- Multi-firm setup with firm profile, PAN/GST details, financial year and voucher numbering.
- Project/site hierarchy, store assignment, cost codes and project manager assignment.
- Custom roles with permissions such as view, create, edit draft, submit, approve, export and print.
- Record-level scope by firm, project, site and store. External users can only access their own authorised records.
- Audit history for login, permission changes, master changes, approvals and important exports.

### 5.2 Construction project and BOQ management
- Project contract details, client, scope, dates, contract value, manager and status.
- BOQ items, units, quantities, rates and revisions (later phase if not in MVP).
- Work packages/cost codes for civil, structural, electrical, plumbing and other work categories.
- Project budget versus actual, progress measurements, milestones and daily progress reports (later phase).

### 5.3 Inventory and stores
- Item master with code, category, unit, conversion, HSN where applicable, reorder level and specifications.
- Stores/godowns by firm, project and site.
- Goods receipt note (GRN), material issue, stock transfer, returns, damage/wastage adjustment and physical stock verification.
- Stock ledger, inward/outward register, stock-on-hand, low-stock alerts, project consumption and material issued to contractors.
- Every movement records quantity, unit, rate/value where relevant, source/destination, date, user and supporting evidence.

**Valuation recommendation:** Weighted-average is a practical default for the MVP because construction materials are often replenished at changing prices and it smooths unit costs. Confirm the method with the client's accountant before importing opening stock or posting live transactions. Do not switch valuation methods casually after go-live.

### 5.4 Purchasing and vendors
- Vendor master, contact/tax details, payment terms and restricted-access bank information.
- Site request to purchase requisition; quotation comparison can be added in a later phase.
- Purchase order, amendment history, delivery status, GRN linkage and purchase bill register.
- Recommended future control: match purchase order, goods receipt and supplier bill before payment approval.

### 5.5 Contractor and subcontractor management
- Contractor master, agreement/work order, scope, BOQ/rate items, validity and documents.
- Measurement entry against work order, previous/current/cumulative quantities and bill certification.
- Deductions may include advance recovery, retention, TDS, material recovery, penalties and other agreed recoveries.
- Bill status: draft, submitted, under review, approved, returned/rejected, partly paid and paid.
- Contractor portal: view own work orders, submitted bills, approved amounts, deductions and payment status only.

### 5.6 Accounting and finance
- Ledger/account-group setup, party ledgers, opening balances and transaction tagging by firm/project.
- Receipt, payment, contra and journal vouchers; purchase/sales/contractor postings according to agreed accounting rules.
- Cash book, bank book, ledger statement, day book and trial balance. P&L and balance sheet require a properly designed accounting model and explicit scope.
- Double-entry principle: posted financial transactions must balance. Correct posted entries through traceable reversals/adjustments rather than silent overwrites.
- India-specific GST/TDS fields and reports must be validated by the client's accountant. Tax filing and portal integration are not included by default.

### 5.7 Client billing and sales
- Customer/client master, quotation/estimate, invoice and receipt records if required.
- Client running-account (RA) bills against contract/BOQ progress, including advance recovery, retention and taxes where applicable.
- Receivable ageing and customer statements after billing formats and accounting treatment are confirmed.

### 5.8 Site requests and approvals
- Mobile-first request form: site, requester, required date, priority, items, quantities, purpose and attachments.
- Configurable approval sequence, rejection/return reason, comments, notifications and full history.
- Store can fulfil fully or partially, transfer from another store or initiate procurement.
- Suggested starting matrix: Site Supervisor → Project Manager; Purchase Officer → Purchase Head; contractor bill → Project Manager → Accounts; payment → Accounts Manager/Owner. The client must approve final roles and amount thresholds.

### 5.9 GPS photo evidence and communication
- Capture a photo from the app and associate it with a delivery, GRN, material issue, site request or project record.
- Store latitude/longitude, reported accuracy, device capture time where available, server receipt time, uploader and linked transaction.
- Location capture requires user permission and may fail indoors or on devices with poor GPS. Show accuracy and allow an authorised exception with a reason.
- GPS and timestamps alone cannot prove a photo is authentic or prevent every form of manipulation. Stronger evidence includes in-app capture, server-side metadata and audit logs.
- Continuous/live location tracking is excluded unless explicitly requested and approved, including privacy, consent, battery and retention rules.

### 5.10 Excel migration, reports and documents
- Templates for agreed masters, opening stock, opening balances and selected outstanding items.
- Column mapping, validation, duplicate checks, preview totals, row-level errors and import logs.
- Trial import and reconciliation against source records before production migration.
- PDF/Excel exports for agreed reports; document repository, versioning and expiry alerts can be phased in later.

### 5.11 Real-time chat, attendance and advanced features
Full real-time chat with groups, project/site channels, media, presence, read receipts and offline queue is a substantial separate workstream. Attendance, equipment maintenance, advanced DPR, BOQ analytics, native apps, automated tax filing and external integrations should be treated as later-phase modules unless separately budgeted.

## 6. Core Workflows

**Material request to issue:** Supervisor creates request → Project Manager approves → Store checks availability → material is issued/transferred → receiver confirms delivery → request closes. If stock is unavailable, an authorised user creates a purchase requisition.

**Purchase to receipt:** Purchase requisition → quotation/selection where applicable → purchase order → goods receipt at store/site → purchase bill review → payment approval. PO/GRN/bill matching is recommended as a later control if not included in MVP.

**Contractor running bill:** Work order → measurement entry → previous/current/cumulative calculation → deductions and taxes → site/project certification → accounts review → authorised approval → ledger/project-cost posting → payment and outstanding update.

**Finance close:** Review vouchers and exceptions → reconcile cash/bank and stock → post approved adjustments → review ledger and trial balance → lock period. A formal month-end close workflow must be included explicitly in the accounting scope.

## 7. Recommended Technical Architecture

**Frontend:** Next.js + TypeScript, responsive UI and PWA capabilities. Use consistent component, form and table patterns; keep business rules on the server. A PWA is not equivalent to a native mobile app, and camera/GPS/push/offline behaviour varies by browser and operating system.

**Backend recommendation:** NestJS + TypeScript is the default if the delivery team is strongest in JavaScript/TypeScript. It aligns language and types across frontend/backend, supports modular architecture and WebSockets, and suits a modular monolith. Django + Django REST Framework is also strong if the team is more productive in Python or Django admin is a major advantage. Do not split services between NestJS and Django in the MVP.

| Layer | Recommendation | Notes |
|---|---|---|
| Frontend | Next.js + TypeScript | PWA, responsive layouts, accessible forms, role-aware navigation |
| Backend | NestJS + TypeScript | Modular monolith, REST API; WebSockets only if real-time chat is in scope |
| Database | PostgreSQL | Relational integrity for accounting, projects, purchase and stock |
| ORM/migrations | Prisma or TypeORM | Choose one; use reviewed migrations and database constraints |
| Authentication | Secure browser session/token strategy | Prefer secure HttpOnly cookies where practical; enforce RBAC and record scopes server-side |
| File storage | S3-compatible object storage | Store photos/documents outside the relational database; use signed URLs |
| Background jobs | Queue worker; Redis if needed | Imports, reports, notifications and media processing |
| Hosting | Managed cloud/VPS selected after sizing | Separate staging/production, TLS, monitoring and automated backups |
| Observability | Structured logs and error tracking | Never log passwords, tokens or sensitive financial data |

Architecture principles: modular monolith first; explicit firm/project/site ownership on records; server-side authorisation on every API; database migrations; immutable posted accounting records; audit events; idempotent imports/posting; automated backups and restore testing.

## 8. Data, Security and Accounting Controls
- Enforce firm/tenant isolation in backend queries and test it; hiding menu items is not security.
- Use least-privilege roles, record scopes and separate contractor/client portal permissions.
- Use HTTPS, secure password hashing, rate limiting, input validation, dependency updates and safe file-upload rules.
- Audit important create/update/approve/reject/export actions, including actor, timestamp and record ID.
- Posted accounting transactions must balance and be protected from silent edits. Reversals must link to the original.
- Back up the database and uploaded files; test restore before go-live.
- Define retention, offboarding, session expiry and incident-response procedures.
- GPS photos/location data require a clear purpose, access controls and retention policy.

## 9. Reports and Dashboards

| Report group | Initial / planned reports |
|---|---|
| Management | Pending approvals, open site requests, low stock, recent project activity |
| Inventory | Stock summary, stock ledger, inward/outward register, material issue by site/project |
| Purchasing | Purchase order register, receipts, vendor purchase register, outstanding orders |
| Contractor | Work-order register, running bill register, deductions, retention and outstanding |
| Finance MVP | Cash book, bank book, ledger statement, day book and trial balance if accounting posting is included |
| Later finance | Profit & Loss, Balance Sheet, cash flow, receivable/payable ageing, GST/TDS summaries |
| Operations | Request turnaround, partial fulfilment, stockout and vendor delivery performance |

Each report must define filters, date basis, firm/project scope, export format and reconciliation source before development.

## 10. Eight-Week Delivery Plan

| Week | Activities | Exit criteria |
|---|---|---|
| 1 | Discovery, workflow workshops, sample Excel review, role matrix, screen map and acceptance criteria | Scope signed off; decisions recorded |
| 2 | UI foundations, database model, authentication, firm/project/site masters, CI/CD and environments | Users can log in and manage setup data |
| 3 | RBAC/data scopes, item/vendor/contractor masters, inventory model and opening-data template | Permissions tested; masters validated |
| 4 | Stock receipts/issues/transfers, site material request and basic approvals | Core site request workflow works end-to-end |
| 5 | Purchase order basics, contractor work order/running bill workflow within agreed limits | Business users validate calculations/statuses |
| 6 | Agreed finance vouchers/reports, GPS photo evidence, audit trail and notifications | Core transactions/evidence reviewable |
| 7 | Excel import, report exports, defect fixing, security and permission tests | Test data reconciles; critical defects closed |
| 8 | UAT, training, production setup, backup verification, go-live and handover | Client signs off against acceptance checklist |

This schedule is a target, not a guarantee. It assumes a focused MVP, fast client decisions, usable data, limited integrations and sufficient frontend/backend/QA capacity. Full chat, complete accounting, extensive offline sync and advanced construction controls may extend delivery.

## 11. Budget and Excluded Running Costs

| Cost item | Treatment |
|---|---|
| Development budget | ₹2,00,000–₹2,50,000 as specified by client |
| Hosting/application server | Excluded; select after user, traffic and storage sizing |
| Managed database/server | Excluded; PostgreSQL compute, storage and backups billed separately |
| Object/file storage | Excluded; depends on photo volume, documents, retention and downloads |
| Domain and TLS | Domain excluded; TLS may be included with hosting |
| Email/SMS/WhatsApp vendors | Excluded; may be usage-based |
| Maps/geocoding | Potential provider charges depend on usage/provider |
| Monitoring/error tracking | Free tiers may suffice initially; paid usage excluded |
| Maintenance/enhancements | Excluded unless a separate support agreement is signed |
| Tax/compliance integrations | GSP, e-invoice, e-way bill, bank APIs and similar paid integrations excluded unless scoped |

Tie the development budget to a signed scope and milestone payments. Approve a separate monthly operating budget after expected users, photo volume, database size, backup retention and availability target are known.

## 12. Acceptance Criteria
- Users can only access assigned firms/projects/sites and permitted actions; test direct API access, not only navigation visibility.
- A supervisor can create a request, an approver can approve/reject it, and the store can record full/partial issue.
- Every stock movement updates the stock ledger and traces to its source document and user.
- Contractor bill quantities correctly show previous/current/cumulative values under client-approved rules.
- GPS evidence records location when permission is granted, accuracy, capture/receipt timestamps and linked record; GPS unavailability is handled clearly.
- Excel imports show preview and row-level errors; invalid batches cannot silently post.
- Audit history shows important status changes and approval actions.
- Critical reports reconcile to source transactions and use consistent filters.
- Production database and file backups are configured and a restore test is demonstrated.
- Client completes UAT and signs off the agreed scope before go-live.

## 13. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Full ERP exceeds budget/time | Agree MVP boundaries and written change-request process |
| Accounting rules unclear | Client accountant validates voucher types, posting rules, tax handling and report formats |
| Unknown scale/data volume | Confirm firms/users/projects and photo/file volumes in week 1 |
| Poor site connectivity | Prioritise resilient mobile forms; limit offline support to agreed actions |
| GPS unavailable/inaccurate | Record accuracy and permission status; allow exception flow; do not promise guaranteed location |
| Excel data quality | Profile files, map columns, validate, trial-import and reconcile |
| Cross-project data exposure | Enforce server-side scopes and automated negative-access tests |
| Scope changes | Written change requests with cost/timeline impact |
| Delayed client feedback | Name a decision-maker and agree review turnaround expectations |

## 14. Items Requiring Client Sign-off
1. Year-one scale: number of firms, projects, sites, stores, internal users, contractors and client users.
2. MVP priority: deeper accounting or deeper site/procurement workflows for go-live.
3. Approval matrix, amount thresholds, delegates and escalation expectations.
4. Contractor bill format, measurement rules, retention, advance recovery, material recovery, penalties, GST and TDS treatment.
5. Stock units/conversions, wastage treatment and approval of weighted-average valuation (or another method).
6. Client login permissions: which project documents, bills, progress data and reports are visible.
7. GPS photo workflow: capture-only vs live location sharing; accuracy, retention period and access rights.
8. Excel files and migration scope: masters only, opening balances/stock, outstanding bills or historical transactions.
9. Required accounting reports and print formats; accountant validates Indian tax/accounting treatment.
10. Hosting preference, backup retention, uptime target and data-access policy.
11. Named client product owner and expected turnaround for decisions, UAT feedback and sign-off.

## 15. Explicit Exclusions for Initial Release
- Native Android/iOS apps.
- Automated GST filing, e-invoice/e-way bill integrations or bank payment initiation.
- Continuous/live GPS tracking unless separately approved.
- Full-featured chat comparable to a standalone messaging platform unless retained explicitly in MVP scope.
- Advanced BI/AI analytics, predictive estimates or AI assistants.
- Complex multi-country/multi-currency operations; INR is the primary currency.
- Unlimited historical data migration or unbounded custom report development.
- Third-party subscriptions, hosting, database, storage, messaging or maps charges.

## 16. Recommended Implementation Decision
Proceed with **Next.js + TypeScript** for the frontend and **NestJS + TypeScript + PostgreSQL** for the backend, delivered as a modular monolith, if the team is already comfortable with TypeScript. Choose Django + Django REST Framework instead if the team is materially more productive in Python or Django admin is a major advantage. Choose based on team capability, maintainability and delivery speed—not trend. Do not use both backend frameworks in the MVP.

Before coding, run a short discovery/sign-off phase and convert the MVP into a feature checklist, wireframes, data model, approval matrix, report list and acceptance tests. The two-month commitment should apply only to the signed MVP; the remaining catalogue is a phased roadmap.

---
**Document status:** Refined proposal based on the source requirements and the client's answers. Unconfirmed items require client sign-off before implementation.
