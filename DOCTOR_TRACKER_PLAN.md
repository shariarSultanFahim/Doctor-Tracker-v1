# Doctor Tracker — Agentic Build Plan

> Feed this file to your coding agent (Claude Code, Cursor, etc.) as the master spec. Work through phases top-to-bottom. Each task is written to be independently actionable — check items off as they're completed.

## 1. Elevator Pitch

Doctor Tracker is a secure, full-stack admin portal for managing doctors and their patients, built as a monorepo with a Next.js frontend and an Express + MongoDB backend. It emphasizes optimized queries, clean UX with ShadCN/Tailwind, and a data-viz dashboard — all runnable locally with a single `docker compose up`.

## 2. Tech Stack (Locked)

| Layer | Choice |
|---|---|
| Frontend framework | Next.js (App Router) |
| Data fetching / caching | TanStack Query (React Query) v5 |
| HTTP client | Axios (with a shared instance + interceptors) |
| UI components | ShadCN/ui |
| Styling | Tailwind CSS v4.3.3 (latest) |
| Backend framework | Express.js (standalone service, not Next API routes) |
| Database | MongoDB (Mongoose ODM) |
| Form | React Hook Form with Zod Validation |
| Validation | Zod (both frontend form validation and backend request validation) |
| Auth | JWT (httpOnly cookies) via Express middleware |
| Charts | Recharts (or another lib of the agent's choice) |
| Containerization | Docker + Docker Compose |
| Monorepo tooling | Turborepo (or npm/pnpm workspaces) |

**Why Express instead of Next.js API routes:** the spec says "Next.js full-stack" but you've chosen a separate Express backend — that's fine and arguably cleaner for this use case. Just document this deviation explicitly in the README's "Technical Decisions" section, since it differs from the original brief.

## 3. Frontend Rules (Next.js) — Enforce Project-Wide

Hard rules for the agent to follow on every frontend file it touches or generates.

**General**
- Remove unused imports and `console.log` statements before every commit.
- Commit messages follow Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, etc.).
- ESLint + Prettier must be configured and fully enforced (pre-commit hook via `husky` + `lint-staged` if the agent sets up tooling).

**TypeScript**
- Never use `any`. Use `unknown` + narrowing, generics, or proper types instead.
- Type files are kebab-case: `user.ts`, `site-config.ts`.
- Type names are PascalCase with no `Type` suffix: `User`, `SiteConfig` — prefer `const user: User = ...` over `const user: UserType = ...`.
- Use `interface` for object shapes; use `type` for unions, intersections, and other advanced compositions.

**Functions & Hooks**
- Custom hooks always start with `use` (e.g. `useDoctors`).
- Custom hook files live in `src/hooks`, kebab-case (e.g. `use-doctors.ts`).
- Hook function names are camelCase.
- Functions have a single responsibility — keep them small and focused; extract helpers rather than growing one function.

**Data Fetching**
- All HTTP requests go through Axios.
- Axios calls are never made ad hoc from components — always through the `get`, `post`, `put`, `del` helpers in `src/lib/api.ts`.
- All data operations use TanStack Query (`useQuery`, `useMutation`) — no raw `useEffect` fetching.
- Every request is wrapped in try/catch with user-facing feedback (toast) on error.
- Form and payload validation goes through Zod schemas, parsed before the Axios call fires.

**Styling & Design**
- Tailwind CSS only — no inline `style={}` props.
- Use Tailwind v4.3.3 (the latest version) — install via `npm install tailwindcss@4.3.3`, and follow the v4 CSS-first config (`@import "tailwindcss"` + `@theme` in a global CSS file) rather than the old `tailwind.config.js`-driven v3 setup. Verify the exact latest patch version at scaffold time and pin it in `package.json` rather than using a caret range, so the whole team/agent builds against the same version.
- Favor soft, pastel tones for the palette (backgrounds, accents, chart colors).
- All layout, spacing, and alignment via Tailwind utility classes — no custom CSS files unless truly unavoidable (e.g. a single global stylesheet for font imports).

**Icons**
- All icons come from `lucide-react`. Do not introduce a second icon library.

**Components**
- Always use ShadCN components for UI primitives — buttons, inputs, selects, dialogs, tables, dropdowns, badges, cards, tabs, tooltips, alerts, skeletons, etc. Install via the ShadCN CLI (`npx shadcn@latest add <component>`) rather than hand-rolling equivalents.
- Never build a custom component (modal, dropdown, table, form field, etc.) from scratch when a ShadCN primitive already covers it — compose/extend the ShadCN component instead of reimplementing it.
- Custom components are only for things ShadCN doesn't provide (e.g. a `StatCard`, a chart wrapper) — and even those should be built by composing ShadCN primitives (`Card`, `Skeleton`, etc.) underneath.

## 4. Monorepo Structure

Frontend structure is organized for **route-based code-splitting and minimal chunk size**: colocate route-specific components inside their route segment (Next.js splits per-route automatically), keep `components/` limited to genuinely shared/reusable pieces, lazy-load heavy client-only widgets (charts, rich tables) with `next/dynamic`, and avoid barrel files (`index.ts` re-export hubs) that pull unrelated modules into the same bundle.

Backend structure is organized for **scalability and query performance**: a dedicated `indexes/` registry so every index is defined in one auditable place, a `repositories/` layer isolating all Mongoose/aggregation queries from business logic (so query optimization never touches controllers), and a modular route/controller/service split per resource so new resources can be added without touching existing ones.

```
doctor-tracker/
├── apps/
│   ├── web/                  # Next.js frontend
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   └── login/
│   │   │   │       └── _components/     # route-local, not globally shared
│   │   │   ├── (dashboard)/
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── _components/     # StatCards, Charts (lazy-loaded via next/dynamic)
│   │   │   │   ├── doctors/
│   │   │   │   │   ├── _components/     # DoctorsTable, DoctorFilters
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── _components/ # PatientsList (scoped to this route)
│   │   │   │   └── patients/
│   │   │   │       └── _components/
│   │   │   ├── layout.tsx
│   │   │   └── providers.tsx        # QueryClientProvider wrapper
│   │   ├── components/
│   │   │   ├── ui/                  # ShadCN generated components (shared, tree-shakeable)
│   │   │   └── shared/               # truly cross-route components only (Navbar, Sidebar, DataTable)
│   │   ├── hooks/                    # use-doctors.ts, use-patients.ts (TanStack Query hooks)
│   │   ├── lib/
│   │   │   ├── api.ts                # get/post/put/del axios helpers
│   │   │   ├── axios.ts              # shared axios instance (interceptors, baseURL)
│   │   │   ├── api/                  # per-resource request functions (doctors.ts, patients.ts)
│   │   │   └── validators/           # Zod schemas shared with form components
│   │   ├── types/                    # user.ts, site-config.ts (kebab-case, PascalCase types)
│   │   ├── middleware.ts             # route protection
│   │   ├── Dockerfile
│   │   └── package.json
│   └── api/                  # Express backend
│       ├── src/
│       │   ├── config/
│       │   │   └── db.ts
│       │   ├── models/
│       │   │   ├── doctor.model.ts
│       │   │   ├── patient.model.ts
│       │   │   └── user.model.ts
│       │   ├── indexes/              # single source of truth for all Mongo indexes, run on startup
│       │   │   └── ensure-indexes.ts
│       │   ├── repositories/         # raw Mongoose queries & aggregation pipelines, isolated from logic
│       │   │   ├── doctor.repository.ts
│       │   │   └── patient.repository.ts
│       │   ├── services/             # business logic, calls repositories
│       │   ├── controllers/          # thin — request/response only, delegate to services
│       │   ├── routes/
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   ├── validate.ts       # generic Zod-schema validation middleware
│       │   │   └── error-handler.ts
│       │   ├── validators/           # Zod schemas per resource
│       │   └── server.ts
│       ├── Dockerfile
│       └── package.json
├── packages/
│   └── shared-types/         # shared TS interfaces (Doctor, Patient, API responses)
├── docker-compose.yml
├── docker-compose.dev.yml    # hot-reload overrides
├── .env.example
├── turbo.json
├── package.json
└── README.md
```

## 5. Data Models

### User (admin)
```
{ _id, name, email (unique), passwordHash, role: "admin", createdAt }
```

### Doctor
```
{
  _id, name, specialization, hospital, phone, email,
  createdAt, updatedAt
}
```
Index: `{ name: "text", specialization: "text", hospital: "text" }` for search; `{ createdAt: -1 }` for date filtering/sorting.

### Patient
```
{
  _id, doctorId (ref Doctor, indexed),
  name, age, gender, condition, phone,
  visitDate, notes,
  createdAt, updatedAt
}
```
Index: `{ doctorId: 1, createdAt: -1 }` compound index (fast per-doctor pagination); `{ condition: 1 }`; text index on `name`.

## 6. API Design (Express, REST)

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/doctors            ?search=&page=&limit=&from=&to=&sort=
POST   /api/doctors
GET    /api/doctors/:id
PATCH  /api/doctors/:id
DELETE /api/doctors/:id
GET    /api/doctors/:id/patients

POST   /api/doctors/:id/patients

GET    /api/patients           ?search=&page=&limit=&condition=&from=&to=
GET    /api/patients/:id
PATCH  /api/patients/:id
DELETE /api/patients/:id

GET    /api/dashboard/summary  # totals: doctors, patients, patients-per-doctor
GET    /api/dashboard/stats    # date-bucketed stats for charts
```

## 7. Page-by-Page Specification

Every page below lists: the route, exactly what data it shows, table columns (with source field + type), filters/search, actions, and which API endpoint backs it. Frontend and backend must match these field names exactly — no renaming between the DB schema, API response, and UI.

### 7.1 Login — `/login`
**Purpose:** authenticate the admin.
**Fields:** `email` (text input), `password` (password input).
**Validation (Zod):** `email` valid email format, `password` min 6 chars.
**Actions:** Submit → `POST /api/auth/login` → on success, redirect to `/dashboard`; on 401, inline error + toast "Invalid credentials".
**No table, no filters.**

---

### 7.2 Dashboard — `/dashboard`
**Purpose:** at-a-glance analytics. No tables — stat cards + charts only.

**Stat cards** (from `GET /api/dashboard/summary`):
| Card | Field | Type |
|---|---|---|
| Total Doctors | `totalDoctors` | number |
| Total Patients | `totalPatients` | number |
| Avg. Patients / Doctor | `avgPatientsPerDoctor` | number (rounded to 1 decimal) |
| New Patients (30d) | `newPatientsLast30Days` | number |

**Charts** (from `GET /api/dashboard/stats`):
| Chart | Type | Data shape |
|---|---|---|
| Patients registered over time | Line/Area chart | `[{ date, count }]`, bucketed by day/week (query param `bucket=day\|week\|month`) |
| Patients per doctor | Bar chart (top 10) | `[{ doctorName, patientCount }]` |
| Patients by condition | Pie/Donut chart | `[{ condition, count }]` |
| Doctors by specialization | Bar/Pie chart | `[{ specialization, count }]` |

**Filters:** date-range picker (applies to the time-series chart only) → `?from=&to=&bucket=`.
**No actions besides filter changes.**

---

### 7.3 Doctors List — `/doctors`
**Purpose:** manage all doctors.
**Backed by:** `GET /api/doctors?search=&specialization=&from=&to=&sort=&page=&limit=`

**Table columns:**
| Column | Source field | Type | Sortable |
|---|---|---|---|
| Name | `name` | string | ✓ |
| Specialization | `specialization` | string | ✓ |
| Hospital | `hospital` | string | ✓ |
| Phone | `phone` | string | – |
| Email | `email` | string | – |
| Patients | `patientCount` (computed via `$lookup`/count in the list aggregation) | number | ✓ |
| Added On | `createdAt` | date (formatted `MMM D, YYYY`) | ✓ (default sort desc) |
| Actions | — | View / Edit / Delete icon buttons | – |

**Filters (top toolbar):**
- Search box (debounced 300ms) → matches `name`, `specialization`, `hospital` (text index)
- Specialization dropdown (multi-select, populated from distinct values or a fixed enum)
- Date range picker → filters `createdAt` between `from`/`to`
- "Clear filters" button

**Actions:**
- "+ Add Doctor" button (top right) → opens Add Doctor modal
- Row click / "View" icon → navigates to `/doctors/[id]`
- "Edit" icon → opens Edit Doctor modal (pre-filled)
- "Delete" icon → confirmation dialog → `DELETE /api/doctors/:id`

**Pagination:** footer with page size selector (10/25/50) + page controls, showing "X–Y of Z doctors".

---

### 7.4 Doctor Detail — `/doctors/[id]`
**Purpose:** view one doctor + manage their patients.
**Backed by:** `GET /api/doctors/:id` (doctor info) + `GET /api/doctors/:id/patients?search=&page=&limit=`

**Doctor info card:** `name`, `specialization`, `hospital`, `phone`, `email`, `createdAt` — read-only display with an "Edit" button opening the same Edit Doctor modal as 7.3.

**Patients table (scoped to this doctor):**
| Column | Source field | Type |
|---|---|---|
| Name | `name` | string |
| Age | `age` | number |
| Gender | `gender` | enum: Male/Female/Other |
| Condition | `condition` | string |
| Visit Date | `visitDate` | date |
| Phone | `phone` | string |
| Actions | — | Edit / Delete |

**Filters:** search box (matches `name`), condition dropdown, pagination — same pattern as 7.3.
**Actions:** "+ Add Patient" button → opens Add Patient modal with `doctorId` pre-set and locked → `POST /api/doctors/:id/patients`. Delete → confirmation → `DELETE /api/patients/:id`.

---

### 7.5 Add / Edit Doctor Modal
**Fields:**
| Field | Input type | Zod rule |
|---|---|---|
| `name` | text | min 2 chars, required |
| `specialization` | text or select (from a predefined list) | required |
| `hospital` | text | required |
| `phone` | tel input | valid phone pattern, required |
| `email` | email input | valid email, required |

**Actions:** Cancel (closes modal, discards), Save → `POST /api/doctors` (create) or `PATCH /api/doctors/:id` (edit) → on success: toast "Doctor added/updated", close modal, invalidate `doctors` query.

---

### 7.6 Patients List — `/patients`
**Purpose:** manage all patients across all doctors (dedicated page per spec §2.3).
**Backed by:** `GET /api/patients?search=&condition=&from=&to=&doctorId=&sort=&page=&limit=`

**Table columns:**
| Column | Source field | Type | Sortable |
|---|---|---|---|
| Name | `name` | string | ✓ |
| Age | `age` | number | ✓ |
| Gender | `gender` | enum | – |
| Condition | `condition` | string | ✓ |
| Doctor | `doctorId` → populated `doctorName` | string (link to `/doctors/[id]`) | ✓ |
| Visit Date | `visitDate` | date | ✓ (default sort desc) |
| Phone | `phone` | string | – |
| Actions | — | Edit / Delete | – |

**Filters (top toolbar):**
- Search box (debounced) → matches `name` (text index)
- Condition dropdown (multi-select, distinct values)
- Doctor dropdown (searchable select, filters by `doctorId`)
- Date range picker → filters `visitDate` between `from`/`to`
- "Clear filters" button

**Actions:** "Edit" icon → opens Edit Patient modal (pre-filled, `doctorId` reassignable here since this is the global list). "Delete" icon → confirmation → `DELETE /api/patients/:id`.
**Pagination:** same pattern as 7.3.

---

### 7.7 Add / Edit Patient Modal
**Fields:**
| Field | Input type | Zod rule |
|---|---|---|
| `name` | text | min 2 chars, required |
| `age` | number input | int, 0–120, required |
| `gender` | select (Male/Female/Other) | required |
| `condition` | text or select | required |
| `phone` | tel input | valid phone pattern, required |
| `visitDate` | date picker | required, cannot be in the future |
| `notes` | textarea | optional, max 500 chars |
| `doctorId` | select (searchable) — locked/pre-filled when opened from Doctor Detail page | required |

**Actions:** Cancel, Save → `POST /api/doctors/:id/patients` (create, from doctor detail) or `PATCH /api/patients/:id` (edit, from either page) → toast, close, invalidate both `patients` and `doctors` queries (patient count changes).

## 8. UI Guidelines

**Layout**
- Persistent left sidebar (collapsible on tablet, drawer on mobile) with nav items: Dashboard, Doctors, Patients — active route highlighted.
- Top bar: page title + breadcrumb, user menu (logout) on the right.
- Max content width constrained (`max-w-7xl mx-auto`) with consistent page padding (`p-6` desktop, `p-4` mobile).

**Color & Typography**
- Soft, pastel palette: muted blues/greens/lavenders for primary/accent, avoid saturated/neon colors. Use ShadCN's theming (CSS variables) so light/dark can share the same pastel logic.
- Neutral gray scale for text/borders (ShadCN default slate/zinc), one primary accent color for CTAs and active states, semantic colors kept muted too (soft red for destructive, soft green for success, soft amber for warning).
- One font family via `next/font` (e.g. Inter or Geist), consistent type scale: page titles `text-2xl font-semibold`, section headers `text-lg font-medium`, body `text-sm`/`text-base`, muted metadata `text-sm text-muted-foreground`.

**Tables**
- ShadCN `DataTable` (Table + TanStack Table under the hood) — sticky header, zebra or hover row highlight (subtle, pastel), right-aligned numeric columns, actions column pinned right.
- Empty state: icon + short message + primary action (e.g. "No doctors yet — Add your first doctor").
- Loading state: skeleton rows, not a spinner, to avoid layout shift.

**Forms & Modals**
- ShadCN `Dialog` for Add/Edit (or `Sheet`/drawer on mobile for longer forms like Patient).
- Labels above inputs, inline validation errors in soft red below the field, disable Save while submitting (show spinner in the button).
- Destructive actions (delete) always go through `AlertDialog` confirmation — never delete on a single click.

**Feedback**
- Toasts (`sonner`) for all mutation results — success and error — positioned top-right, auto-dismiss ~4s.
- Global top-level error boundary for unexpected failures with a retry button.

**Filters & Search**
- Filter bar sits directly above each table, wraps responsively into two rows on smaller screens.
- Search input has a `lucide-react` `Search` icon prefix, debounced, clears with an `X` icon when non-empty.
- Active filters shown as removable pill/badges below the toolbar when more than one is applied.

**Responsiveness**
- Breakpoints follow Tailwind defaults (`sm/md/lg/xl`). Tables collapse to stacked cards below `md`; sidebar becomes an off-canvas drawer below `md`.
- Charts on Dashboard stack to a single column below `lg`.

**Icons**
- `lucide-react` throughout — consistent stroke width (default 2px), sized `size-4`/`size-5` depending on context, always paired with accessible labels (`aria-label` on icon-only buttons).



## 9. Build Phases

**Commit discipline:** this is a large project — commit after every small milestone, not just at the end of a phase. Each checklist item (or a tightly related pair) below should be its own commit, using Conventional Commits format (§3). Aim for a granular, readable history a reviewer could step through — e.g. `feat(api): add doctor model with indexes`, `feat(web): add doctors table with pagination`, `fix(api): correct patient date filter range` — rather than one giant commit per phase. Never bundle unrelated changes (e.g. a backend model + an unrelated frontend style tweak) into the same commit.

### Phase 0 — Scaffolding
- [ ] Init monorepo (Turborepo or workspaces), root `package.json`, `.gitignore`
- [ ] **Commit:** `chore: init monorepo structure`
- [ ] Scaffold `apps/web` with `create-next-app` (App Router, TS, Tailwind)
- [ ] **Commit:** `chore(web): scaffold next.js app`
- [ ] Scaffold `apps/api` with Express + TypeScript
- [ ] **Commit:** `chore(api): scaffold express app`
- [ ] Set up `packages/shared-types` and reference it from both apps
- [ ] **Commit:** `chore: add shared-types package`
- [ ] Install & init ShadCN in `apps/web`
- [ ] **Commit:** `chore(web): init shadcn/ui`
- [ ] Write root `.env.example` (`MONGO_URI`, `JWT_SECRET`, `PORT`, `NEXT_PUBLIC_API_URL`, etc.)
- [ ] **Commit:** `docs: add .env.example`

### Phase 1 — Auth
- [ ] `User` model + seed script for one admin user
- [ ] **Commit:** `feat(api): add user model and admin seed script`
- [ ] Express: `/auth/login` (bcrypt compare, sign JWT, set httpOnly cookie), `/auth/logout`, `/auth/me`
- [ ] **Commit:** `feat(api): add login, logout, and me auth endpoints`
- [ ] Express `authMiddleware` protecting all `/api/doctors`, `/api/patients`, `/api/dashboard` routes
- [ ] **Commit:** `feat(api): add auth middleware to protected routes`
- [ ] Next.js `middleware.ts` redirecting unauthenticated users away from `(dashboard)` routes
- [ ] **Commit:** `feat(web): add route protection middleware`
- [ ] Frontend login page (ShadCN form) + axios instance with `withCredentials: true`
- [ ] **Commit:** `feat(web): add login page and axios instance`

### Phase 2 — Doctors Module (Backend)
- [ ] Doctor model, indexes registered in `indexes/ensure-indexes.ts` (run once on server startup)
- [ ] **Commit:** `feat(api): add doctor model and indexes`
- [ ] `doctor.repository.ts` — all Mongoose queries/aggregations live here, nothing in controllers
- [ ] **Commit:** `feat(api): add doctor repository layer`
- [ ] Controllers stay thin: parse request → call service → return response
- [ ] CRUD routes with input validation (Zod schemas via generic `validate.ts` middleware)
- [ ] **Commit:** `feat(api): add doctor CRUD routes with zod validation`
- [ ] List endpoint: search + date filter + pagination via aggregation `$facet` (repository layer)
- [ ] **Commit:** `feat(api): add doctor list endpoint with search, filter, pagination`
- [ ] Centralized error handler middleware, consistent error JSON shape
- [ ] **Commit:** `feat(api): add centralized error handler`

### Phase 3 — Doctors Module (Frontend)
- [ ] `lib/api/doctors.ts` — request functions built on the shared `get/post/put/del` helpers
- [ ] **Commit:** `feat(web): add doctors api request functions`
- [ ] `hooks/use-doctors.ts` — `useQuery` with query-key including filters/page (enables caching per filter combo)
- [ ] **Commit:** `feat(web): add use-doctors query hook`
- [ ] `useMutation` for create/delete with `queryClient.invalidateQueries`/optimistic updates
- [ ] **Commit:** `feat(web): add doctor create/delete mutations`
- [ ] Zod schema for the doctor form; validate before the mutation fires
- [ ] **Commit:** `feat(web): add doctor form zod schema`
- [ ] Doctors table page: search input (debounced), filter controls, pagination component, ShadCN `DataTable` — components live in `app/(dashboard)/doctors/_components/` (route-local, not in shared `components/`)
- [ ] **Commit:** `feat(web): add doctors list page with search, filters, pagination`
- [ ] Doctor detail page showing their patients (`[id]/_components/`)
- [ ] **Commit:** `feat(web): add doctor detail page`

### Phase 4 — Patients Module (Backend + Frontend)
- [ ] Patient model + compound indexes registered in `indexes/ensure-indexes.ts`
- [ ] **Commit:** `feat(api): add patient model and indexes`
- [ ] `patient.repository.ts` — query layer, mirrors doctor repository pattern
- [ ] **Commit:** `feat(api): add patient repository layer`
- [ ] CRUD + list endpoint (search, condition filter, date filter, pagination) via Zod-validated routes
- [ ] **Commit:** `feat(api): add patient CRUD and list endpoints`
- [ ] "Add patient under doctor" endpoint + frontend form (modal/drawer, Zod-validated)
- [ ] **Commit:** `feat: add patient-under-doctor creation flow`
- [ ] Dedicated `/patients` page mirroring doctors page pattern (edit, delete, search, filter, paginate) — components in `app/(dashboard)/patients/_components/`
- [ ] **Commit:** `feat(web): add patients list page`

### Phase 5 — Dashboard
- [ ] Aggregation endpoints: totals, patients-per-doctor, date-bucketed counts (repository layer)
- [ ] **Commit:** `feat(api): add dashboard summary and stats endpoints`
- [ ] Frontend dashboard page: stat cards + charts, `useQuery` with a sensible `staleTime`
- [ ] **Commit:** `feat(web): add dashboard stat cards and charts`
- [ ] Chart components loaded via `next/dynamic({ ssr: false })` to keep them out of the initial route bundle
- [ ] **Commit:** `perf(web): lazy-load dashboard chart components`
- [ ] Responsive grid layout
- [ ] **Commit:** `style(web): responsive dashboard grid`

### Phase 6 — Polish
- [ ] Loading skeletons, empty states, toast notifications (ShadCN `sonner`/`toast`)
- [ ] **Commit:** `feat(web): add loading skeletons, empty states, toasts`
- [ ] Responsive pass (mobile nav, tables → cards on small screens)
- [ ] **Commit:** `style(web): responsive pass for nav and tables`
- [ ] Route-level error boundaries
- [ ] **Commit:** `feat(web): add route-level error boundaries`
- [ ] Lighthouse/perf + bundle-analyzer pass (`@next/bundle-analyzer`); confirm charts/heavy tables are code-split, no barrel-file bloat
- [ ] **Commit:** `perf(web): bundle analysis and code-split cleanup`
- [ ] Avoid unnecessary re-renders (memoize table rows, debounce search)
- [ ] **Commit:** `perf(web): memoize table rows, debounce search inputs`
- [ ] Lint pass: no `any`, no stray `console.log`, no inline styles, icons all from `lucide-react`, ESLint/Prettier clean
- [ ] **Commit:** `chore: lint and format cleanup`

### Phase 7 — Docker & DX
- [ ] `apps/web/Dockerfile` (multi-stage: deps → build → run, `next start`)
- [ ] **Commit:** `chore(web): add production dockerfile`
- [ ] `apps/api/Dockerfile` (multi-stage: deps → build → run)
- [ ] **Commit:** `chore(api): add production dockerfile`
- [ ] Root `docker-compose.yml`: `mongo`, `api`, `web` services, named volume for Mongo data, healthchecks, `depends_on`
- [ ] **Commit:** `chore: add docker-compose for mongo, api, web`
- [ ] `docker-compose.dev.yml` override with bind mounts + hot reload (nodemon/`next dev`) for local dev
- [ ] **Commit:** `chore: add docker-compose dev override with hot reload`
- [ ] One command to run everything: `docker compose up --build`
- [ ] Seed script runnable inside the api container (`docker compose exec api npm run seed`) to create demo doctors/patients + the admin user
- [ ] **Commit:** `feat(api): add demo data seed script`

### Phase 8 — README & Submission

- [ ] Elevator pitch paragraph
- [ ] Setup guide (local + Docker) referencing `.env.example`
- [ ] Architecture diagram/description (request → Next.js → Axios → Express → Mongo, auth flow)
- [ ] Two "Technical Decisions" deep dives — good candidates:
  - Why Express as a separate service instead of Next.js API routes
  - Why TanStack Query over plain `useEffect`/SWR for caching & revalidation
- [ ] Desktop + mobile screenshots
- [ ] Demo credentials + deployed link + GitHub repo link
- [ ] **Commit:** `docs: add full README with setup, architecture, and screenshots`

## 10. Docker Compose Sketch

```yaml
services:
  mongo:
    image: mongo:7
    volumes: [mongo-data:/data/db]
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh --quiet
      interval: 10s
      retries: 5

  api:
    build: ./apps/api
    env_file: .env
    depends_on:
      mongo:
        condition: service_healthy
    ports: ["4000:4000"]

  web:
    build: ./apps/web
    env_file: .env
    depends_on: [api]
    ports: ["3000:3000"]

volumes:
  mongo-data:
```

## 11. Quality Checklist (map to evaluation criteria)

- [ ] Consistent folder structure, reusable components, no duplicated fetch logic
- [ ] Every index lives in `indexes/ensure-indexes.ts`; all list queries verified against them with `.explain()`
- [ ] No client-side over-fetching — pagination enforced server-side
- [ ] TanStack Query cache keys correctly scoped so filters/pagination don't collide
- [ ] All mutations invalidate/update the right query keys
- [ ] Auth guards on both frontend (middleware) and backend (route middleware) — never trust the client alone
- [ ] Zod validation on every write endpoint (frontend form + backend request), meaningful 4xx error messages
- [ ] Controllers contain no direct Mongoose calls — everything routed through `repositories/`
- [ ] No `any` in the frontend codebase; ESLint/Prettier pass clean
- [ ] Route bundles stay lean: no unused shared-component imports, heavy widgets dynamically imported
- [ ] `docker compose up --build` works from a clean clone with only `.env` filled in

## 12. Notes / Open Deviations to Flag in README

- Backend is a standalone Express service rather than embedded in Next.js API routes — call this out explicitly since the original brief said "full-stack inside Next.js."
- Confirm with stakeholders whether "date-wise filter" on doctors means doctor-creation date or filtering by a doctor's patients' visit dates — the spec is ambiguous; current plan assumes doctor `createdAt`.
