# Doctor Tracker — Medical Administration Portal

Doctor Tracker is a full-stack admin dashboard for managing doctor profiles, patient records, and clinical analytics—built as a **Turborepo monorepo**. Hospital administrators log in through a JWT-secured portal, search and filter doctors and patients with real-time fuzzy matching, manage CRUD operations via slide-over forms, and monitor key metrics through interactive Recharts dashboards—all served from a standalone Express API backed by MongoDB aggregation pipelines and a Next.js 15 frontend styled with Tailwind CSS v4.

---

## Table of Contents

- [Setup Guide](#setup-guide)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Option A — Docker (Recommended)](#option-a--docker-recommended)
  - [Option B — Local Development](#option-b--local-development)
  - [Seed Demo Data](#seed-demo-data)
- [System Architecture](#system-architecture)
  - [Monorepo Layout](#monorepo-layout)
  - [Data Flow Diagram](#data-flow-diagram)
  - [API Endpoints](#api-endpoints)
- [Technical Decisions](#technical-decisions)
  - [Why TanStack Query for API State](#1-why-tanstack-query-for-api-state)
  - [Why Turborepo as the Monorepo Tool](#2-why-turborepo-as-the-monorepo-tool)
- [Visual Evidence](#visual-evidence)

---

## Setup Guide

### Prerequisites

| Tool              | Version  | Purpose                          |
| ----------------- | -------- | -------------------------------- |
| **Node.js**       | ≥ 18     | Runtime for API & Web            |
| **npm**           | ≥ 9      | Package manager (workspaces)     |
| **Docker Desktop**| Latest   | Containerized deployment         |
| **MongoDB**       | 7.x      | Only needed for local dev (no Docker) |

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

**`.env.example`**

```env
# ─── Backend (apps/api) ─────────────────────────────
PORT=4000
MONGO_URI=mongodb://localhost:27017/doctor-tracker
JWT_SECRET=change-me-to-a-random-64-char-hex-string
NODE_ENV=development

# ─── Frontend (apps/web) ────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_OPEN_WEATHER_API_KEY=your_openweathermap_api_key
```

| Variable                            | Required | Description                                                 |
| ----------------------------------- | -------- | ----------------------------------------------------------- |
| `PORT`                              | Yes      | Express server port (default `4000`)                        |
| `MONGO_URI`                         | Yes      | MongoDB connection string                                   |
| `JWT_SECRET`                        | Yes      | Secret key for signing JWT tokens (use a random hex string) |
| `NODE_ENV`                          | No       | `development` or `production`                               |
| `NEXT_PUBLIC_API_URL`               | Yes      | Full URL to the Express API (must include `/api`)           |
| `NEXT_PUBLIC_OPEN_WEATHER_API_KEY`  | No       | OpenWeatherMap API key for the dashboard weather widget     |

---

### Option A — Docker (Recommended)

The fastest path — a single command spins up **MongoDB 7**, the **Express API**, and the **Next.js frontend**:

```bash
docker compose up --build
```

| Service   | URL                              |
| --------- | -------------------------------- |
| Web App   | http://localhost:3000             |
| API       | http://localhost:4000/api         |
| MongoDB   | mongodb://localhost:27017         |

The database auto-seeds on first launch when the tables are empty (6 doctors, 40 patients, 1 admin user).

---

### Option B — Local Development

> Requires a running MongoDB instance (local install or Atlas).

```bash
# 1. Clone & install dependencies (from project root)
git clone https://github.com/shariarSultanFahim/Doctor-Tracker-v1.git
cd Doctor-Tracker-v1
npm install

# 2. Create your .env file
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET

# 3. Start all workspaces in parallel via Turborepo
npm run dev
```

Turborepo will concurrently launch:
- **`apps/api`** → Express dev server on `:4000` (hot-reload via `tsx watch`)
- **`apps/web`** → Next.js dev server on `:3000` (HMR)

### Seed Demo Data

To populate the database with sample doctors, patients, and a default admin account:

```bash
# Docker
docker compose exec api npm run seed

# Local
npm run seed --workspace=@doctor-tracker/api
```

**Default Admin Credentials:**
| Field    | Value                       |
| -------- | --------------------------- |
| Email    | `admin@doctortracker.com`   |
| Password | `admin123`                  |

---

## System Architecture

### Monorepo Layout

```
doctor-tracker-v1/
├── apps/
│   ├── api/                        # Express.js REST API
│   │   ├── src/
│   │   │   ├── config/             # Database connection
│   │   │   ├── indexes/            # Startup index synchronization
│   │   │   ├── middleware/         # Auth (JWT) · Validation · Error handler
│   │   │   ├── models/             # Mongoose schemas (User, Doctor, Patient)
│   │   │   ├── repositories/       # Query layer (aggregation pipelines)
│   │   │   ├── routes/             # Express route handlers
│   │   │   ├── scripts/            # Database seed script
│   │   │   ├── validators/         # Zod request schemas
│   │   │   └── server.ts           # Express app entry point
│   │   └── Dockerfile
│   │
│   └── web/                        # Next.js 15 Frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/         # Login page route group
│       │   │   └── (dashboard)/    # Protected dashboard routes
│       │   │       ├── dashboard/  # Analytics & charts
│       │   │       ├── doctors/    # Doctor CRUD + detail pages
│       │   │       ├── patients/   # Patient CRUD + detail pages
│       │   │       └── profile/    # User settings & theme
│       │   ├── components/
│       │   │   ├── shared/         # Reusable (DataTable, Combobox, etc.)
│       │   │   └── ui/             # shadcn/ui primitives
│       │   ├── hooks/              # TanStack Query custom hooks
│       │   ├── lib/                # Axios client & API functions
│       │   └── middleware.ts       # Next.js edge auth guard
│       └── Dockerfile
│
├── packages/
│   └── shared-types/               # TypeScript interfaces shared across apps
│
├── docker-compose.yml              # Production multi-container setup
├── docker-compose.dev.yml          # Dev override with volume mounts
├── turbo.json                      # Turborepo pipeline configuration
└── package.json                    # Root workspace definition
```

### Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                          │
│                                                                  │
│   Next.js 15 App Router ─── React 19 ─── Tailwind CSS v4         │
│                                                                  │
│   ┌─────────────────┐  ┌────────────────┐  ┌─────────────────┐   │
│   │  TanStack Query │  │   nuqs (URL)   │  │  React Hook     │   │
│   │  (Server State) │  │  (Search State)│  │  Form + Zod     │   │
│   └────────┬────────┘  └───────┬────────┘  └────────┬────────┘   │
│            │                   │                    │            │
│            └───────────────────┼────────────────────┘            │
│                                │                                 │
│                    Axios (httpOnly cookie auth)                  │
└────────────────────────────────┼─────────────────────────────────┘
                                 │  HTTP REST
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                     EXPRESS API  (:4000)                           │
│                                                                    │
│   middleware/auth.ts ──► JWT cookie verification                   │
│   middleware/validate.ts ──► Zod request body validation           │
│                                                                    │
│   routes/                                                          │
│   ├── auth.routes     POST /login · /logout · GET /me · PATCH /profile│
│   ├── doctor.routes   GET / · GET /:id · POST / · PATCH /:id · DELETE│
│   ├── patient.routes  GET / · POST / · PATCH /:id · DELETE /:id    │
│   └── dashboard.routes GET /summary · GET /stats                   │
│                                                                    │
│   repositories/ ──► Mongoose aggregation pipelines ($facet,        │
│                     $lookup, $dateToString bucketing)              │
└────────────────────────────────┬───────────────────────────────────┘
                                 │  Mongoose ODM
                                 ▼
                    ┌──────────────────────┐
                    │   MongoDB 7 (:27017) │
                    │                      │
                    │  Collections:        │
                    │  • users             │
                    │  • doctors           │
                    │  • patients          │
                    └──────────────────────┘
```

### API Endpoints

| Method   | Endpoint                         | Auth | Description                                 |
| -------- | -------------------------------- | ---- | ------------------------------------------- |
| `POST`   | `/api/auth/login`                | ✗    | Authenticate & set httpOnly JWT cookie       |
| `POST`   | `/api/auth/logout`               | ✗    | Clear auth cookie                            |
| `GET`    | `/api/auth/me`                   | ✓    | Get current user profile                     |
| `PATCH`  | `/api/auth/profile`              | ✓    | Update profile, password, theme, preferences |
| `GET`    | `/api/doctors`                   | ✓    | List doctors (paginated, fuzzy search)       |
| `GET`    | `/api/doctors/:id`               | ✓    | Get doctor by ID with patient count          |
| `POST`   | `/api/doctors`                   | ✓    | Create doctor                                |
| `PATCH`  | `/api/doctors/:id`               | ✓    | Update doctor                                |
| `DELETE` | `/api/doctors/:id`               | ✓    | Delete doctor & cascade patients             |
| `GET`    | `/api/doctors/:id/patients`      | ✓    | List patients for a doctor (paginated)       |
| `POST`   | `/api/doctors/:id/patients`      | ✓    | Create patient under a doctor                |
| `GET`    | `/api/patients`                  | ✓    | List all patients (paginated, filterable)    |
| `GET`    | `/api/patients/:id`              | ✓    | Get patient by ID                            |
| `PATCH`  | `/api/patients/:id`              | ✓    | Update patient                               |
| `DELETE` | `/api/patients/:id`              | ✓    | Delete patient                               |
| `GET`    | `/api/dashboard/summary`         | ✓    | KPI summary (totals, averages, 30-day new)   |
| `GET`    | `/api/dashboard/stats`           | ✓    | Chart data (time-series, by-condition, by-doctor) |

---

## Technical Decisions

### 1. Why TanStack Query for API State

The frontend needs to keep server data (doctors list, patient details, dashboard stats) synchronized with what's in MongoDB—without building a custom caching and refetching layer from scratch.

**The problem it solves:** In a traditional React approach using `useEffect` + `useState`, every page that fetches data must manually handle loading states, error states, cache invalidation when a mutation happens on another page, stale data when the user navigates back, and race conditions from rapid filter changes. This leads to duplicated boilerplate across every data-fetching component and subtle bugs when cache consistency breaks.

**Why TanStack Query (v5) was chosen over alternatives:**

- **Declarative cache keys.** Each query is identified by a structured key like `['doctors', { search, page }]`. When filters change, TanStack Query automatically deduplicates in-flight requests and refetches only what's needed. The `nuqs` URL state flows directly into these keys, so the URL is always the single source of truth for what data is displayed.

- **Automatic mutation invalidation.** When `useCreatePatient()` succeeds, it calls `queryClient.invalidateQueries({ queryKey: ['patients'] })` plus `['doctors']` and `['dashboard']` — because creating a patient changes the doctor's patient count and the dashboard summary. TanStack Query then silently re-fetches only the affected queries in the background. Without this, we'd need a custom pub-sub system or manual `refetch()` calls scattered across unrelated components.

- **Stale-while-revalidate.** All queries use `staleTime: 5 minutes`, meaning navigating between pages feels instant (cached data renders immediately) while a background refetch quietly updates the data. This eliminates loading spinners on page transitions and gives the app a native-app feel without any manual caching code.

- **Why not SWR?** SWR is lighter but lacks first-class mutation support, structured query keys, and the `invalidateQueries` API that makes cross-entity cache invalidation trivial. For a CRUD-heavy admin app, TanStack Query's mutation hooks (`useMutation` with `onSuccess` callbacks) provide significantly less boilerplate.

- **Why not server-side data fetching in Next.js?** The app needs real-time filtering with debounced search, URL-synced pagination, and instant optimistic updates—all of which require client-side state management. Server Components would introduce waterfall requests and eliminate the ability to show stale data instantly on navigation.

**Concrete impact on this codebase:**
Every data-fetching concern is consolidated into 6 hook files (`use-auth.ts`, `use-dashboard.ts`, `use-doctors.ts`, `use-patients.ts`, `use-weather.ts`, `use-mobile.tsx`), each under 70 lines. Page components contain zero data-fetching logic—they simply call `usePatients(filters)` and render.

---

### 2. Why Turborepo as the Monorepo Tool

This project contains three packages (`apps/api`, `apps/web`, `packages/shared-types`) that share TypeScript interfaces and need coordinated builds. A monorepo tool is needed to manage these interdependencies without publishing packages to npm.

**The problem it solves:** Without a monorepo orchestrator, running `npm run build` in `apps/web` would fail because it imports `@doctor-tracker/shared-types`, which must be built first. Developers would need to manually run builds in the correct order, and CI would require hand-crafted dependency graphs.

**Why Turborepo was chosen over alternatives:**

- **Zero-config dependency graph.** The single `turbo.json` configuration defines that `build` depends on `^build` (upstream packages first). Turborepo automatically resolves that `shared-types` must compile before `api` and `web`. No manual `prebuild` scripts or workspace topology definitions needed—it reads `package.json` workspace declarations and infers the graph.

- **Parallel task execution.** Running `npm run dev` invokes `turbo run dev`, which launches the API server and Next.js dev server in parallel with interleaved output. Running `npm run build` compiles `shared-types` first, then builds `api` and `web` concurrently—cutting CI time nearly in half compared to sequential builds.

- **Local computation caching.** Turborepo hashes source files and caches build outputs in `.turbo/`. If `shared-types` hasn't changed, rebuilding the monorepo skips its compilation entirely and replays the cached output. This makes incremental rebuilds near-instant during development.

- **npm workspace native.** Unlike Nx (which requires its own plugin ecosystem and `project.json` per package) or Lerna (which is primarily a publishing tool), Turborepo works directly on top of npm workspaces with no additional per-package configuration. The entire orchestration config is 18 lines in `turbo.json`.

- **Why not Nx?** Nx is more powerful for large monorepos (100+ packages) with its dependency graph visualization, affected-command analysis, and distributed caching. For a 3-package project, it introduces unnecessary complexity—custom generators, a plugin system, and a learning curve. Turborepo delivers the two features that matter here (dependency-ordered builds and caching) with minimal configuration overhead.

- **Why not just npm workspaces alone?** npm workspaces handle package linking (`@doctor-tracker/shared-types` resolves correctly) but provide no task orchestration. `npm run build` in the root would run builds in non-deterministic order, potentially building `web` before `shared-types` is compiled. Turborepo adds the missing orchestration layer.

**Concrete impact on this codebase:**
The shared type package (`packages/shared-types`) exports interfaces like `Doctor`, `Patient`, `PaginatedResponse`, and `ApiResponse` that are imported by both `apps/api` (for repository return types) and `apps/web` (for hook generics and component props). A single type change propagates to both apps through Turborepo's `dependsOn: ["^build"]` pipeline—guaranteeing type safety across the entire stack.

---

## Visual Evidence

> **Screenshots will be added here.**

### Desktop Views

![Login Screen UI Screenshot](<UI Screenshots/Doctor Tracker Login Screen.png>)
![Doctor Directory Screen UI Screenshot](<UI Screenshots/Doctor Tracker Doctors Directory Screen.png>)
![Doctor Details Screen UI Screenshot](<UI Screenshots/Doctor Tracker Doctor Details Screen.png>)
![Doctor Directory Screen UI Screenshot](<UI Screenshots/Doctor Tracker Doctors Directory Screen.png>)
![Patient Directory Screen UI Screenshot](<UI Screenshots/Doctor Tracker Patients Directory Screen.png>)

