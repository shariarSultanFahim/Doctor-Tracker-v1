# Doctor Tracker — Admin Portal

Doctor Tracker is a full-stack monorepo web application designed to track doctors, patient rosters, and medical analytics.

## Tech Stack

- **Monorepo:** Turborepo & npm Workspaces
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v4.3.3, Lucide Icons, TanStack Query v5, Axios
- **Backend:** Express.js (TypeScript), Mongoose ODM, MongoDB 7
- **Authentication & Validation:** JWT in `httpOnly` cookies, Zod schema validation (frontend & backend)
- **Containerization:** Docker & Docker Compose

## Quick Start (Docker)

Ensure Docker Desktop is running on your machine, then run:

```bash
docker compose up --build
```

Access the web application at `http://localhost:3000` and the Express API at `http://localhost:4000/api`.

### Seed Demo Data

To populate demo doctors, patients, and default admin credentials, run:

```bash
docker compose exec api npm run seed
```

**Default Admin Credentials:**
- **Email:** `admin@doctortracker.com`
- **Password:** `admin123`

## Technical Architecture & Decisions

### 1. Standalone Express Backend (`apps/api`)
Rather than relying on Next.js API routes, the backend is architected as an isolated Express service. This allows strict separation of concerns, enabling custom database connection lifecycles, auditable index initialization (`indexes/ensure-indexes.ts`), and clean isolation of query aggregation logic inside `repositories/`.

### 2. Isolated Query Repository Layer
Mongoose queries and aggregation pipelines (`$facet` for paginated text search, `$lookup` for patient counts, date-bucketed stats) live strictly inside `repositories/` (`doctor.repository.ts`, `patient.repository.ts`, `dashboard.repository.ts`). Controllers remain thin and focused exclusively on HTTP handling.

### 3. Route-Based Code Splitting
Frontend components are route-local (`app/(dashboard)/<route>/_components/`) to minimize bundle sizes. Heavy data-visualization charts (Recharts) are lazy-loaded via `next/dynamic({ ssr: false })`.
