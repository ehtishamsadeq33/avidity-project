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

- **Monorepo**: pnpm workspaces, Node.js 24, TypeScript 5.9
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

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm install` from workspace root after adding new packages
- Chromium is installed via `replit.nix` (required for PDF generation)
- The `ADMIN_JWT_SECRET` env var is set as a shared env var (not a secret)
- Do NOT run `pnpm dev` or `pnpm build` at workspace root — no dev script exists there

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
