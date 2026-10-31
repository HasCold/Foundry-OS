# FoundryOS — Manufacturing Execution Platform (Frontend Demo)

A fully functional, front-end-only Manufacturing ERP UI. There is no backend and no
database — every workflow, calculation, and mutation runs in memory in the browser.
Refreshing the page resets all state, including the authenticated session, back to
the seeded mock data.

## Stack

- **React 19 + TypeScript** (strict mode)
- **Vite** — build tool / dev server
- **Zustand** — per-feature state stores (the source of truth for all in-memory data)
- **TanStack Query** — wraps every store mutation in a simulated async round-trip
  (`src/lib/mock-async.ts`), so components see real loading/error/pending states
  exactly as they would against a live API
- **Tailwind CSS v4** + hand-built Radix UI primitives (`src/components/ui`) in a
  shadcn-style pattern — Button, Dialog, Tabs, Select, DataTable (sortable +
  filterable), DropdownMenu, etc. Full light/dark theming via CSS variables.
- **Recharts** for the analytics and finance dashboards
- **@dnd-kit** for the drag-and-drop production Kanban board
- **React Router** for client-side routing, including an in-memory auth guard

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check + production build
npm run preview   # serve the production build locally
```

On first load you'll land on the sign-in screen. Both seeded accounts belong to
organization **Northbridge Fabrication** with password **foundry123**:

| Email | Access |
|---|---|
| **admin@foundryos.dev** | Super user — everything, including Utilities (users, groups, roles) |
| **finance@foundryos.dev** | Member of the *Finance* group — finance view-only |

Or sign up as a new organization (any 4 or 6 digit code verifies the account) —
whoever creates an organization becomes its super user.

## Architecture

The codebase is organized by feature, not by file type:

```
src/
  components/ui/        Atomic, presentation-only primitives (Button, Dialog, DataTable, ...)
  components/shared/    Small cross-feature building blocks (StatCard, PageHeader, chart tooltip)
  components/layout/    App shell (Sidebar, Topbar with theme toggle + profile menu, AppLayout)
  store/                 App-wide (non-feature-scoped) state — currently just the theme store
  types/                Shared domain model — the "API contract" every feature is built against
  mock/                 Seed data for the in-memory store (BOMs, inventory, orders, GL, ...)
  lib/                  cn() helper, formatters, the mock network wrapper, chart palette,
                        and the typed event bus (eventBus.ts / appEvents.ts)
  app/                  domainIntegrations.ts — the one file that wires cross-module events
                        (e.g. "PO approved" -> Finance) to their reactions
  features/
    auth/                Sign-up, email verification, login, forgot-password, logout
    bom/                 Multi-level BOM builder + real-time costing engine
    scheduler/           Kanban production scheduler + machine capacity planner
    inventory/           Stock ledger, lot/serial tracking, MRP simulation engine
    quality/             Quality holds, defect logging, disposition workflow
    procurement/         Purchase order lifecycle, MRP → PO conversion
    analytics/           OEE / yield / scrap / financial variance reporting
    finance/             General ledger, financial statements, AP/AR, cost variance
    rbac/                Roles, groups, user administration and permission enforcement
    setup/               Organizations, their locations, and company business details
    dashboard/           Executive overview landing page
```

Each feature under `src/features/*` follows the same shape:

- `store/` — a Zustand store holding that feature's slice of in-memory state
- `api/` — a thin async wrapper (`mockNetwork(...)`) around the store's actions,
  standing in for what would be real `fetch` calls to a backend
- `hooks/` — a single `useX()` hook per feature that wires the store + TanStack
  Query mutations together; this is the *only* thing components are allowed to
  call
- `components/` — presentation components that call the feature hook and render
  UI; no business logic, no direct store access. Where a component's JSX grows
  multiple type-specific branches (e.g. `EditNodeDialog`), the branches are
  split into small named subcomponents in a local folder rather than left as
  one long conditional block.
- `utils/` — pure business-logic functions (the BOM costing engine, the MRP
  explosion algorithm, machine capacity math, ledger calculations) that are
  unit-testable in isolation from React

This separation is what makes it straightforward to swap the mock layer for a
real backend later: replace the body of each `api/*.ts` function with a real
`fetch`/GraphQL call and nothing above the `api/` layer needs to change.

### Cross-module integration: direct calls vs. the event bus

Most cross-feature effects are simple, same-domain, one-directional calls —
e.g. approving a PO directly calls `useInventoryStore.getState().incrementOnOrder(...)`,
because Procurement and Inventory are tightly related and there's exactly one
consumer. Those stay as plain imports; adding an event bus there would just be
indirection for its own sake.

Finance is different: it needs to react to *several* unrelated modules
(Procurement, Scheduler, Quality) without any of them needing to know Finance
exists. For that seam, producers `emit()` a typed domain event
(`src/types/events.ts`) through `src/lib/appEvents.ts`, and the only file that
subscribes is `src/app/domainIntegrations.ts`. Adding a new cross-module
reaction is a three-line change: declare the event shape, `emit()` it where it
happens, `on()` it in `domainIntegrations.ts`.

## Feature tour

- **Authentication** (`/login`, `/signup`, `/verify`, `/forgot-password`) — a
  fully in-memory session: sign up with an organization name and industry,
  "verify" with any 4 or 6 digit code, and sign in against either your new
  account or the seeded demo org. Logging out (via the profile menu in the
  header) instantly clears the session and returns to the login screen.
- **BOM & Costing Engine** (`/bom`) — three multi-level bills of material
  (finished good → sub-assembly → raw materials + routing steps). Editing a raw
  material's *actual* unit cost or a routing step's *actual* labor rate
  instantly re-rolls the parent's cost up the entire tree and shows the
  standard-vs-actual variance.
- **Production Scheduler & Capacity Planner** (`/scheduler`) — a drag-and-drop
  Kanban board across Planned / In Progress / Quality Hold / Completed, plus
  per-machine capacity gauges over a rolling 3-day horizon that react instantly
  to newly scheduled jobs or logged downtime. Completing an order also posts a
  Raw Materials → WIP → Finished Goods transfer to the Finance ledger.
- **Inventory, Serialization & MRP** (`/inventory`) — live stock levels with
  safety-stock indicators, lot/serial drill-down, and a "Run MRP Simulation"
  button that explodes every open production order's BOM against on-hand
  inventory, flags shortfalls in red, and generates suggested purchase orders.
- **Quality Assurance** (`/quality`) — review open quality holds, log defects,
  and approve/reject a batch's disposition — which writes back to inventory
  availability, closes out the originating production order, and (for a
  "scrap" disposition) books a write-off expense in Finance.
- **Procurement Hub** (`/procurement`) — convert MRP-suggested purchase orders
  into approved operational POs (instantly bumping on-order inventory balances
  and posting a Raw Materials / Accounts Payable entry to the ledger), then
  advance them through in-transit → received (which posts a new lot and
  increases on-hand stock).
- **BI Analytics** (`/analytics`) — OEE trend, monthly yield, scrap/defect
  breakdown by type, and a material-vs-labor financial variance report, all
  filterable by date range, production line, and product category.
- **Finance & Accounting Ledger Hub** (`/finance`) — a live, double-entry
  general ledger auto-populated by the modules above; a Balance Sheet and
  Income Statement that recompute instantly from that ledger; Accounts
  Payable / Receivable boards with a one-click "Process Payment" that updates
  cash and the GL together; and Recharts small-multiples visualizing Standard
  vs. Actual overruns for material waste, scrap loss, and labor overtime.

## Company setup: organizations and locations

One company account can run several businesses without buying a second
subscription: **Company → Organization → Location**.

- **Company Profile** (`/setup/company-profile`) has a tab per organization,
  each with its own profile (name, code, industry, fiscal year, base currency,
  time zone) and its own locations (plants, warehouses, offices — exactly one
  primary per organization). *Add organization* opens a new tab with the same
  fields.
- **Business Details** stays single — the company's legal registration and
  contact info, shared by every organization.
- Every user (except the super user, who spans all organizations) is placed in
  one organization and one of its locations, chosen in User Administration.
  An organization or location that users are still based at can't be removed.
- Placement is informational for now: it doesn't yet narrow which
  organization's data a user can see — the operational modules aren't
  organization-scoped yet.

## Access control (RBAC)

`src/features/rbac` implements **Users → Groups → Roles → Permissions**, with
roles also assignable straight to a user. A permission is one action on one
screen (`finance:view`, `procurement:approve`); a user's effective access is the
union of everything reachable through their groups and direct roles.

Each screen has up to three actions: **View** (open and read), **Write** (add,
edit and delete together — not every screen supports all three) and
**Approve** (sign-offs: approving a PO, a QA disposition, paying a supplier).

- **Permission catalog** — `PERMISSION_CATALOG` in `rbac/types` lists every
  securable screen and which actions it supports. The role editor's matrix and
  the `ResourceKey` type are derived from it, so securing a new module starts
  with one entry there.
- **Super user** — the organization's owner (`RegisteredUser.isSuperUser`)
  implicitly holds every permission and is the only person who can open
  *Utilities* to manage users, groups and roles. Access management is
  deliberately not a grantable permission, and the super user's own access
  can't be changed or deactivated.
- **Enforcement, three layers** — `RequirePermission` gates each route (and the
  sidebar hides the same links), `<Can>` / `usePermissions().can()` gate
  buttons inside a page, and `authorize()` runs inside each feature's `api/`
  function, where a real backend would return a 403. Hiding UI alone isn't
  security; the api-layer check is what a backend later takes over.
- **Guard rails** live in the RBAC store, not the screens: unique role/group
  names, a role or group still in use can't be deleted, deactivated users
  can't sign in, and granting `write` or `approve` always implies `view`.
- **Errors** — a rejected mutation (including a permission failure) is toasted
  once, by the `MutationCache` handler in `App.tsx`, so feature hooks don't
  each need their own `onError`.

## Notes

- All data is seeded from `src/mock/*` and lives only in memory — there is
  intentionally no persistence layer. A hard refresh resets everything,
  including the signed-in session and the theme.
- The "network" delay you see on every mutation is real (simulated via
  `setTimeout` in `src/lib/mock-async.ts`) so loading states are genuinely
  exercised, not faked.
- Authentication is a UI/state simulation only — passwords are kept in plain
  in-memory objects. This is explicitly not production auth practice; there is
  no backend for it to talk to.
