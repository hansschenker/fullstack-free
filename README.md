# Fullstack Free

A fullstack web framework built on **TanStack**, **Hono**, and **Cloudflare Workers**, with **better-auth** for authentication.

## Stack

| Layer | Technology | Role |
|---|---|---|
| Authentication | better-auth | Email/password auth, sessions, user management |
| SPA Runtime | React + MVU Architecture | UI rendering, state management |
| Client Data | TanStack Query | Cache, optimistic writes |
| Client Forms | TanStack Form + Zod | Validation, field state, submission |
| API Framework | Hono | Routes, middleware, typed RPC |
| ORM | Drizzle | Schema, migrations, type-safe queries |
| Validation | Zod | Shared schemas (client + server) |
| Runtime | Cloudflare Workers | Edge deployment |
| Database | Neon Postgres | Serverless Postgres over HTTP |

## Getting Started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) Postgres database

### Install

```bash
npm install
```

### Configure

Create a `.dev.vars` file for local development:

```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-secret-at-least-32-chars-long
BETTER_AUTH_URL=http://localhost:5173
```

Generate a secret with `openssl rand -base64 32`.

### Database Setup

```bash
npm run db:generate   # Generate migrations from Drizzle schema
npm run db:push       # Push schema to database
npm run db:seed       # Seed with sample data
```

### Development

```bash
# Start Vite dev server (client)
npm run dev

# Start Wrangler dev server (API)
npm run preview
```

### Build & Deploy

```bash
npm run build:client  # Build the SPA
npm run deploy        # Deploy to Cloudflare Workers
```

Set production secrets:

```bash
wrangler secret put DATABASE_URL
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put BETTER_AUTH_URL
```

## Authentication

This app uses [better-auth](https://better-auth.com) for authentication:

- **Email & Password** sign up / sign in
- **Session management** via secure cookies
- **Protected API routes** — all `/api/todos/*` routes require authentication
- **Per-user todos** — each user only sees their own todos

Auth tables (`user`, `session`, `account`, `verification`) are defined in the Drizzle schema and managed alongside application tables.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a detailed breakdown of all 9 layers.

### Type Flow

Types flow from the database schema to the UI with zero duplication:

```
Drizzle Schema → drizzle-zod → Zod Schemas → Hono zValidator / TanStack Form / TypeScript types → hc<AppType>() → End-to-end type safety
```

### MVU Pattern

The client uses Model-View-Update (MVU) for UI state:

- **Model**: Immutable TypeScript type describing UI state
- **Msg**: Discriminated union of all possible events
- **Update**: Pure function `(model, msg) → model`
- **View**: Pure function `(model, dispatch) → JSX`

Server state lives in TanStack Query. The MVU loop stays pure.
