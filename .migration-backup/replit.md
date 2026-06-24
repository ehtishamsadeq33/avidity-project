# Coach Readiness Assessment (CRA)

A mobile-first assessment platform that evaluates coaching readiness via survey and generates detailed PDF reports. Includes a secure admin dashboard for viewing and managing candidate results.

## Run & Operate

- `pnpm install` — install all workspace dependencies
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server (port 8080)
- `pnpm --filter @workspace/mobile run dev` — run Expo mobile app (port 18115)

**Required secrets:** `MONGODB_URI` (Replit Secret)
**Env vars:** `ADMIN_JWT_SECRET` (shared)

**First-time admin setup:** `POST /api/admin/setup` with `{ username, password }` — only works if no admins exist yet.
**Default admin credentials:** `admin` / `admin123` (change immediately via Settings tab)

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24
- **Frontend**: React Native + Expo (expo-router), runs as web via react-native-web
- **Backend**: Express 5, Mongoose (MongoDB), Puppeteer-core (PDF generation via Chromium), bcryptjs + jsonwebtoken (admin auth)
- **Validation**: Zod (v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec/`)
- **Build**: esbuild (ESM bundle)

## Where things live

- `artifacts/api-server/` — Express backend (routes, MongoDB models, PDF generation)
- `artifacts/api-server/src/routes/admin.ts` — all admin API routes
- `artifacts/api-server/src/middlewares/adminAuth.ts` — JWT middleware
- `artifacts/api-server/src/models/Admin.ts` — Admin mongoose model
- `artifacts/mobile/` — Expo React Native app
- `artifacts/mobile/app/admin/` — admin login + dashboard screens
- `artifacts/mobile/context/AdminContext.tsx` — admin auth state (JWT in AsyncStorage)
- `lib/api-spec/` — OpenAPI spec (source of truth for API contract)
- `artifacts/api-server/src/lib/cra.ts` — scoring logic (Perceived vs Actual, Composite scores)

## Architecture decisions

- MongoDB is the primary data store (survey responses + admin users); PostgreSQL/Drizzle is auxiliary
- PDF reports generated server-side via Puppeteer-core + system Chromium (installed via `replit.nix`)
- Expo app runs in web mode inside Replit preview (port 18115 → external port 3000)
- API server on port 8080; mobile app proxied via Replit's Expo domain env vars
- `MONGODB_URI` stored as a Replit Secret; `ADMIN_JWT_SECRET` stored as shared env var
- After survey submit, users see only a "Thank You" confirmation — no report access
- All report/PDF endpoints require admin JWT; admin routes protected by `requireAdmin` middleware

## Product

- **Individual Survey flow**: Home → IC Number entry → Personal info → Questions → "Thank you"
- **Group Survey flow**: Home → IC Number entry (verified against a group) → Personal info → Questions → "Thank you"
- **Admin flow**: Login → 6-tab dashboard:
  - **Overview**: Total/weekly/monthly counts, average scores, score distribution chart, gender histogram, submissions timeline
  - **Candidates**: Searchable/filterable list with name, IC number, group, scores, date; filter by Individual/Group/All; download PDF per candidate
  - **Groups**: Create groups with group name, cohort, organization, and IC number list; view group detail with submission status per member
  - **Analytics**: Skills vs Will scatter plot, Will vs Env scatter plot, submissions over time line chart
  - **Export**: Download all/filtered candidates as CSV
  - **Settings**: Change password, add/remove admin users

## Gotchas

- Chromium must be available via `replit.nix` (`pkgs.chromium`) for Puppeteer PDF generation
- Run `pnpm install` before starting workflows if `node_modules` is missing
- The mobile dev command requires `REPLIT_DEV_DOMAIN`, `REPL_ID`, and `REPLIT_EXPO_DEV_DOMAIN` env vars (auto-set by Replit runtime)
- Admin setup endpoint (`POST /api/admin/setup`) only works once when no admins exist

## Pointers

- Admin routes: `artifacts/api-server/src/routes/admin.ts`
- Scoring logic: `artifacts/api-server/src/lib/cra.ts`
- Report HTML template: `artifacts/api-server/src/lib/reportHTML.ts`
