---
name: testing-fullstack-free
description: Test the fullstack-free framework (TanStack + Hono + Cloudflare Workers). Use when verifying client rendering, API routes, or build integrity.
---

## Local Development Setup

1. Install dependencies: `npm install`
2. Start Vite dev server (client): `npm run dev` (serves on port 5173)
3. Start Wrangler dev server (API): `npm run preview` (serves on port 8787)
4. Vite proxies `/api/*` requests to `http://localhost:8787` in dev mode

## Build & Typecheck

- Typecheck: `npm run typecheck` or `npx tsc --noEmit`
- Client build: `npm run build:client` (outputs to `dist/client/`)
- Full build: `npm run build`

## Devin Secrets Needed

- `DATABASE_URL` — Neon Postgres connection string (required for API/CRUD testing)
- `JWT_SECRET` — JWT signing secret (required for auth middleware testing)
- Cloudflare credentials — Required for `npm run deploy` (wrangler deploy)

Without `DATABASE_URL`, you can only test:
- TypeScript compilation
- Vite production build
- Client-side rendering (layout, form, error states)
- Form interactivity (input fields respond to typing)

## Database Commands

- Generate migrations: `npm run db:generate`
- Push schema to DB: `npm run db:push`
- Seed data: `npm run db:seed`
- Drizzle Studio: `npm run db:studio`

## What to Test

### Without Database
- App renders at `http://localhost:5173`
- H1 reads "Fullstack MVU Todo"
- Form has input (placeholder "What needs doing?"), textarea, and "Add Todo" button
- TodoListView shows "Error: Failed to fetch todos" (expected without backend)
- Form fields accept text input

### With Database
- Start both Vite (`npm run dev`) and Wrangler (`npm run preview`)
- Create a `.dev.vars` file with `DATABASE_URL=...` and `JWT_SECRET=...`
- Run `npm run db:push` to create tables
- Test full CRUD: create, read, toggle, filter, delete todos
- Test filter buttons (all/active/completed)
- Test optimistic updates on toggle
- Test form validation (empty title should show error)

## Architecture Notes

- Client uses MVU (Model-View-Update) pattern with React useReducer
- TanStack Query manages server state; MVU manages UI state
- TanStack Form v1 uses Standard Schema validation (no separate zod adapter needed)
- Hono RPC client (`hc<AppType>`) provides end-to-end type safety
- JSON responses serialize Date fields as strings (use `InferResponseType` from hono/client)
