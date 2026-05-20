# Fullstack Free

A fullstack web framework built on **TanStack**, **Hono**, and **Cloudflare Workers**.

## Stack

| Layer | Technology | Role |
|---|---|---|
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
JWT_SECRET=your-secret
```

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
