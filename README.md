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

On first load you'll land on the sign-in screen. Use the seeded demo account —
organization **Northbridge Fabrication**, email **admin@foundryos.dev**, password
**foundry123** — or sign up as a new organization (any 4 or 6 digit code verifies
the account).

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
- RBAC is intentionally omitted — the app operates as a single admin user per
  signed-in organization.
