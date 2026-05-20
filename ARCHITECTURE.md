# Full-Stack Architecture: SPA + TanStack + Hono + Cloudflare Workers

## The Napkin

```
┌─────────────────────────────────────────────────────────────────┐
│  CLIENT (SPA)                                                   │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │  MVU Layer   │  │  TanStack    │  │  TanStack DB          │ │
│  │              │  │  Query       │  │                       │ │
│  │  Model ──┐   │  │              │  │  Collections          │ │
│  │  View   ◄┤   │  │  Cache +    │  │  Live Queries         │ │
│  │  Update ─┘   │  │  SWR        │  │  Optimistic Mutations │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────┘ │
│         │                 │                      │              │
│  ┌──────┴─────────────────┴──────────────────────┴───────────┐ │
│  │  TanStack Form + Zod Validation                           │ │
│  └───────────────────────────┬───────────────────────────────┘ │
│                              │                                  │
│  ════════════════════════════╪══════════════════════════════════ │
│         Request / Response   │   (Web Standard Fetch API)       │
└──────────────────────────────┼──────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│  SERVER (Cloudflare Workers) │                                  │
│                              │                                  │
│  ┌───────────────────────────┴───────────────────────────────┐ │
│  │  Hono  (Request Handler)                                  │ │
│  │                                                           │ │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌────────────┐ │ │
│  │  │  CORS   │  │   Auth   │  │  Rate   │  │  OpenAPI   │ │ │
│  │  │         │  │  (JWT)   │  │  Limit  │  │  /Swagger  │ │ │
│  │  └────┬────┘  └────┬─────┘  └────┬────┘  └─────┬──────┘ │ │
│  │       └─────────────┴─────────────┴─────────────┘        │ │
│  │                         │                                 │ │
│  │  ┌──────────────────────┴──────────────────────────────┐ │ │
│  │  │  API Routes  (typed, Zod-validated)                 │ │ │
│  │  │                                                     │ │ │
│  │  │  GET  /api/todos         → list                     │ │ │
│  │  │  POST /api/todos         → create                   │ │ │
│  │  │  GET  /api/todos/:id     → read                     │ │ │
│  │  │  PUT  /api/todos/:id     → update                   │ │ │
│  │  │  DELETE /api/todos/:id   → delete                   │ │ │
│  │  └──────────────────────┬──────────────────────────────┘ │ │
│  └─────────────────────────┼─────────────────────────────────┘ │
│                            │                                    │
│  ┌─────────────────────────┴─────────────────────────────────┐ │
│  │  Drizzle ORM                                              │ │
│  │                                                           │ │
│  │  Schema ──► Type-safe queries ──► Zod inference           │ │
│  └─────────────────────────┬─────────────────────────────────┘ │
│                            │                                    │
│  ┌─────────────────────────┴─────────────────────────────────┐ │
│  │  Neon Postgres  (serverless, HTTP driver)                 │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Stack Summary

| Layer              | Technology                | Role                                    |
|--------------------|---------------------------|-----------------------------------------|
| SPA Runtime        | JSX + MVU Architecture    | UI rendering, state management          |
| Client Data        | TanStack Query + DB       | Cache, live queries, optimistic writes   |
| Client Forms       | TanStack Form + Zod       | Validation, field state, submission      |
| API Framework      | Hono                      | Routes, middleware, OpenAPI, typed RPC    |
| ORM                | Drizzle                   | Schema, migrations, type-safe queries    |
| Validation         | Zod                       | Shared schemas (client + server)         |
| Runtime            | Cloudflare Workers        | Edge deployment, Request → Response      |
| Database           | Neon Postgres (serverless)| Serverless Postgres over HTTP            |

---

## Project Structure

```
project/
├── src/
│   ├── client/                    # SPA Layer
│   │   ├── app.tsx                # Root application, MVU bootstrap
│   │   ├── mvu/                   # MVU Architecture Core
│   │   │   ├── types.ts           # Model, Msg, Update types
│   │   │   ├── store.ts           # MVU store (Model + dispatch)
│   │   │   └── hooks.ts           # useModel, useDispatch, useSelector
│   │   ├── models/                # Domain Models (the M in MVU)
│   │   │   ├── todo.model.ts      # Todo model + messages + update
│   │   │   └── app.model.ts       # Root model combining sub-models
│   │   ├── views/                 # Pure View Functions (the V in MVU)
│   │   │   ├── todo-list.view.tsx # TodoList view
│   │   │   ├── todo-form.view.tsx # TodoForm view
│   │   │   └── layout.view.tsx    # Layout shell
│   │   ├── effects/               # Side effects (API calls via Query)
│   │   │   └── todo.effects.ts    # Query/mutation hooks for todos
│   │   ├── collections/           # TanStack DB collections
│   │   │   └── todo.collection.ts # Todo collection definition
│   │   └── entry.tsx              # Client entry point
│   │
│   ├── server/                    # Server Layer
│   │   ├── app.ts                 # Hono app root
│   │   ├── middleware/            # Hono middleware
│   │   │   ├── auth.ts            # JWT / session middleware
│   │   │   ├── cors.ts            # CORS configuration
│   │   │   └── error-handler.ts   # Global error handling
│   │   ├── routes/                # Hono API routes
│   │   │   ├── index.ts           # Route aggregator
│   │   │   └── todos.ts           # /api/todos routes
│   │   └── entry.ts               # Worker entry point
│   │
│   ├── shared/                    # Shared between client + server
│   │   ├── schemas/               # Zod schemas (single source of truth)
│   │   │   └── todo.schema.ts     # Todo validation schemas
│   │   └── types/                 # Shared TypeScript types
│   │       └── todo.types.ts      # Inferred from Drizzle + Zod
│   │
│   └── db/                        # Database Layer
│       ├── schema.ts              # Drizzle schema definitions
│       ├── client.ts              # Neon + Drizzle connection
│       ├── migrations/            # Generated migrations
│       └── seed.ts                # Seed data
│
├── public/                        # Static assets
│   └── index.html                 # SPA shell
├── drizzle.config.ts              # Drizzle Kit configuration
├── wrangler.toml                  # Cloudflare Workers config
├── vite.config.ts                 # Vite build config
├── tsconfig.json
└── package.json
```

---

## Layer 1: Database (Drizzle + Neon Postgres)

### Schema Definition

```typescript
// src/db/schema.ts
import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const todos = pgTable('todos', {
  id:          uuid('id').defaultRandom().primaryKey(),
  title:       text('title').notNull(),
  description: text('description'),
  isComplete:  boolean('is_complete').notNull().default(false),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Infer types directly from the schema
export type Todo = typeof todos.$inferSelect
export type NewTodo = typeof todos.$inferInsert
```

### Database Client (Neon Serverless)

```typescript
// src/db/client.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Factory: creates a DB instance per request (stateless workers)
export function createDb(databaseUrl: string) {
  const sql = neon(databaseUrl)
  return drizzle(sql, { schema })
}

export type Database = ReturnType<typeof createDb>
```

### Drizzle Config

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

---

## Layer 2: Shared Schemas (Zod — Single Source of Truth)

The Zod schemas are the contract between client and server.
Both sides import from the same file. No duplication.

```typescript
// src/shared/schemas/todo.schema.ts
import { z } from 'zod'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { todos } from '../../db/schema'

// Derive Zod schemas directly from the Drizzle table
export const todoSelectSchema = createSelectSchema(todos)
export const todoInsertSchema = createInsertSchema(todos, {
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
})

// API-specific schemas (subset of fields the client sends)
export const createTodoSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
})

export const updateTodoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  isComplete: z.boolean().optional(),
})

export const todoIdSchema = z.object({
  id: z.string().uuid(),
})

// Infer TypeScript types from Zod (these flow everywhere)
export type CreateTodoInput = z.infer<typeof createTodoSchema>
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>
export type TodoRecord = z.infer<typeof todoSelectSchema>
```

---

## Layer 3: Server (Hono on Cloudflare Workers)

### Hono App Root

```typescript
// src/server/app.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { todoRoutes } from './routes/todos'
import { errorHandler } from './middleware/error-handler'
import { createDb } from '../db/client'

// Cloudflare Workers bindings type
type Bindings = {
  DATABASE_URL: string
  JWT_SECRET: string
}

// App-level variables injected per request
type Variables = {
  db: ReturnType<typeof createDb>
}

export const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// ── Global Middleware ──────────────────────────────────────────
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'PUT', 'DELETE'] }))

// Inject DB instance per request (stateless workers pattern)
app.use('/api/*', async (c, next) => {
  const db = createDb(c.env.DATABASE_URL)
  c.set('db', db)
  await next()
})

// ── Error Handler ─────────────────────────────────────────────
app.onError(errorHandler)

// ── API Routes ────────────────────────────────────────────────
app.route('/api/todos', todoRoutes)

// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', (c) => c.json({ status: 'ok', runtime: 'cloudflare-workers' }))

// Export the type for the RPC client
export type AppType = typeof app
```

### Todo API Routes (typed, validated)

```typescript
// src/server/routes/todos.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { todos } from '../../db/schema'
import {
  createTodoSchema,
  updateTodoSchema,
  todoIdSchema,
} from '../../shared/schemas/todo.schema'

type Env = {
  Bindings: { DATABASE_URL: string }
  Variables: { db: any }
}

export const todoRoutes = new Hono<Env>()

  // ── GET /api/todos ────────────────────────────────────────
  .get('/', async (c) => {
    const db = c.get('db')
    const result = await db.select().from(todos).orderBy(todos.createdAt)
    return c.json(result)
  })

  // ── GET /api/todos/:id ────────────────────────────────────
  .get('/:id', zValidator('param', todoIdSchema), async (c) => {
    const { id } = c.req.valid('param')
    const db = c.get('db')
    const [todo] = await db.select().from(todos).where(eq(todos.id, id))
    if (!todo) return c.json({ error: 'Not found' }, 404)
    return c.json(todo)
  })

  // ── POST /api/todos ───────────────────────────────────────
  .post('/', zValidator('json', createTodoSchema), async (c) => {
    const data = c.req.valid('json')
    const db = c.get('db')
    const [todo] = await db.insert(todos).values(data).returning()
    return c.json(todo, 201)
  })

  // ── PUT /api/todos/:id ────────────────────────────────────
  .put('/:id', zValidator('param', todoIdSchema), zValidator('json', updateTodoSchema), async (c) => {
    const { id } = c.req.valid('param')
    const data = c.req.valid('json')
    const db = c.get('db')
    const [todo] = await db
      .update(todos)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(todos.id, id))
      .returning()
    if (!todo) return c.json({ error: 'Not found' }, 404)
    return c.json(todo)
  })

  // ── DELETE /api/todos/:id ─────────────────────────────────
  .delete('/:id', zValidator('param', todoIdSchema), async (c) => {
    const { id } = c.req.valid('param')
    const db = c.get('db')
    const [todo] = await db.delete(todos).where(eq(todos.id, id)).returning()
    if (!todo) return c.json({ error: 'Not found' }, 404)
    return c.json({ deleted: true })
  })
```

### Worker Entry Point

```typescript
// src/server/entry.ts
import { app } from './app'

// Cloudflare Workers: export the fetch handler
// This is the Request → Response function
export default {
  fetch: app.fetch,
}
```

### Error Handler

```typescript
// src/server/middleware/error-handler.ts
import type { ErrorHandler } from 'hono'
import { ZodError } from 'zod'

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof ZodError) {
    return c.json(
      { error: 'Validation failed', issues: err.issues },
      400
    )
  }

  console.error('Unhandled error:', err)
  return c.json(
    { error: 'Internal server error' },
    500
  )
}
```

---

## Layer 4: SPA — MVU Architecture

### The MVU Pattern

MVU (Model-View-Update) separates your application into three concerns:

```
    ┌─────────────────────────────────────────────┐
    │                                             │
    │   Model ───────────► View (pure JSX)        │
    │     ▲                   │                   │
    │     │                   │ user event         │
    │     │                   ▼                   │
    │   Update ◄──────── Msg (discriminated union)│
    │                                             │
    └─────────────────────────────────────────────┘
```

- **Model**: an immutable TypeScript type describing the entire UI state
- **Msg**: a discriminated union of all possible events
- **Update**: a pure function `(model, msg) → model`
- **View**: a pure function `(model, dispatch) → JSX`

Side effects (API calls) live outside the MVU loop in an effects layer
powered by TanStack Query. The MVU loop stays pure.

### MVU Core Types

```typescript
// src/client/mvu/types.ts

// Generic MVU types — framework-agnostic
export type Update<Model, Msg> = (model: Model, msg: Msg) => Model
export type View<Model, Msg> = (model: Model, dispatch: Dispatch<Msg>) => JSX.Element
export type Dispatch<Msg> = (msg: Msg) => void
```

### MVU Store (useReducer under the hood)

```typescript
// src/client/mvu/store.ts
import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react'

// Generic MVU store factory
export function createMVUStore<Model, Msg>(
  initialModel: Model,
  update: (model: Model, msg: Msg) => Model
) {
  const ModelContext = createContext<Model>(initialModel)
  const DispatchContext = createContext<Dispatch<Msg>>(() => {})

  function Provider({ children }: { children: ReactNode }) {
    const [model, dispatch] = useReducer(update, initialModel)
    return (
      <ModelContext.Provider value={model}>
        <DispatchContext.Provider value={dispatch}>
          {children}
        </DispatchContext.Provider>
      </ModelContext.Provider>
    )
  }

  function useModel(): Model {
    return useContext(ModelContext)
  }

  function useDispatch(): Dispatch<Msg> {
    return useContext(DispatchContext)
  }

  // Selector for fine-grained reactivity
  function useSelector<T>(selector: (model: Model) => T): T {
    const model = useContext(ModelContext)
    return selector(model)
  }

  return { Provider, useModel, useDispatch, useSelector }
}
```

### Todo Model (the M in MVU)

```typescript
// src/client/models/todo.model.ts
import type { TodoRecord } from '../../shared/schemas/todo.schema'

// ── Model ───────────────────────────────────────────────────
export type TodoFilter = 'all' | 'active' | 'completed'

export type TodoModel = {
  filter: TodoFilter
  editingId: string | null
  optimisticToggles: Set<string>  // IDs currently being toggled
}

export const initialTodoModel: TodoModel = {
  filter: 'all',
  editingId: null,
  optimisticToggles: new Set(),
}

// ── Msg (discriminated union of all possible events) ────────
export type TodoMsg =
  | { type: 'SET_FILTER'; filter: TodoFilter }
  | { type: 'START_EDITING'; id: string }
  | { type: 'STOP_EDITING' }
  | { type: 'OPTIMISTIC_TOGGLE'; id: string }
  | { type: 'RESOLVE_TOGGLE'; id: string }

// ── Update (pure function: model + msg → model) ────────────
export function todoUpdate(model: TodoModel, msg: TodoMsg): TodoModel {
  switch (msg.type) {
    case 'SET_FILTER':
      return { ...model, filter: msg.filter }

    case 'START_EDITING':
      return { ...model, editingId: msg.id }

    case 'STOP_EDITING':
      return { ...model, editingId: null }

    case 'OPTIMISTIC_TOGGLE': {
      const next = new Set(model.optimisticToggles)
      next.add(msg.id)
      return { ...model, optimisticToggles: next }
    }

    case 'RESOLVE_TOGGLE': {
      const next = new Set(model.optimisticToggles)
      next.delete(msg.id)
      return { ...model, optimisticToggles: next }
    }
  }
}
```

### Root App Model (composing sub-models)

```typescript
// src/client/models/app.model.ts
import { TodoModel, TodoMsg, initialTodoModel, todoUpdate } from './todo.model'

// ── Root Model (composition of sub-models) ──────────────────
export type AppModel = {
  todo: TodoModel
  // future: user: UserModel, etc.
}

export const initialAppModel: AppModel = {
  todo: initialTodoModel,
}

// ── Root Msg (tagged union routing to sub-updates) ──────────
export type AppMsg =
  | { domain: 'todo'; msg: TodoMsg }
  // future: | { domain: 'user'; msg: UserMsg }

// ── Root Update (delegates to sub-updates) ──────────────────
export function appUpdate(model: AppModel, appMsg: AppMsg): AppModel {
  switch (appMsg.domain) {
    case 'todo':
      return { ...model, todo: todoUpdate(model.todo, appMsg.msg) }
  }
}
```

### MVU Store Instance

```typescript
// src/client/mvu/index.ts
import { createMVUStore } from './store'
import { AppModel, AppMsg, initialAppModel, appUpdate } from '../models/app.model'

export const {
  Provider: MVUProvider,
  useModel,
  useDispatch,
  useSelector,
} = createMVUStore<AppModel, AppMsg>(initialAppModel, appUpdate)

// Convenience: dispatch a todo message
export function useTodoDispatch() {
  const dispatch = useDispatch()
  return (msg: import('../models/todo.model').TodoMsg) =>
    dispatch({ domain: 'todo', msg })
}
```

---

## Layer 5: Effects (TanStack Query — side effects outside MVU)

The effects layer bridges the pure MVU world and the server.
Query handles caching, deduplication, background refetching.
The MVU loop never touches the network directly.

### Typed Hono RPC Client

```typescript
// src/client/api.ts
import { hc } from 'hono/client'
import type { AppType } from '../server/app'

// Type-safe client — types flow from Hono route definitions
// No codegen, no OpenAPI spec parsing, just TypeScript inference
export const api = hc<AppType>('/')
```

### Todo Effects (Query + Mutations)

```typescript
// src/client/effects/todo.effects.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { api } from '../api'
import type {
  CreateTodoInput,
  UpdateTodoInput,
  TodoRecord,
} from '../../shared/schemas/todo.schema'

// ── Query Keys ──────────────────────────────────────────────
export const todoKeys = {
  all:    ['todos'] as const,
  detail: (id: string) => ['todos', id] as const,
}

// ── Queries ─────────────────────────────────────────────────
export function useTodos() {
  return useQuery({
    queryKey: todoKeys.all,
    queryFn: async () => {
      const res = await api.api.todos.$get()
      if (!res.ok) throw new Error('Failed to fetch todos')
      return res.json() as Promise<TodoRecord[]>
    },
  })
}

export function useTodo(id: string) {
  return useQuery({
    queryKey: todoKeys.detail(id),
    queryFn: async () => {
      const res = await api.api.todos[':id'].$get({ param: { id } })
      if (!res.ok) throw new Error('Todo not found')
      return res.json() as Promise<TodoRecord>
    },
    enabled: !!id,
  })
}

// ── Mutations ───────────────────────────────────────────────
export function useCreateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateTodoInput) => {
      const res = await api.api.todos.$post({ json: data })
      if (!res.ok) throw new Error('Failed to create')
      return res.json() as Promise<TodoRecord>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
    },
  })
}

export function useUpdateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTodoInput }) => {
      const res = await api.api.todos[':id'].$put({
        param: { id },
        json: data,
      })
      if (!res.ok) throw new Error('Failed to update')
      return res.json() as Promise<TodoRecord>
    },
    onSuccess: (todo) => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
      queryClient.setQueryData(todoKeys.detail(todo.id), todo)
    },
  })
}

export function useDeleteTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.api.todos[':id'].$delete({ param: { id } })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
    },
  })
}

export function useToggleTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isComplete }: { id: string; isComplete: boolean }) => {
      const res = await api.api.todos[':id'].$put({
        param: { id },
        json: { isComplete },
      })
      if (!res.ok) throw new Error('Failed to toggle')
      return res.json() as Promise<TodoRecord>
    },
    // Optimistic update at the Query cache level
    onMutate: async ({ id, isComplete }) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.all })
      const previous = queryClient.getQueryData<TodoRecord[]>(todoKeys.all)
      queryClient.setQueryData<TodoRecord[]>(todoKeys.all, (old) =>
        old?.map((t) => (t.id === id ? { ...t, isComplete } : t))
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(todoKeys.all, context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
    },
  })
}
```

---

## Layer 6: TanStack DB (Reactive Client Collections)

For apps that outgrow Query's isolated-cache-entry model,
DB provides relational, reactive, cross-collection queries.

```typescript
// src/client/collections/todo.collection.ts
import { createCollection } from '@tanstack/db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { todoKeys } from '../effects/todo.effects'
import type { TodoRecord } from '../../shared/schemas/todo.schema'

export const todoCollection = createCollection<TodoRecord>(
  queryCollectionOptions({
    id: 'todos',
    queryKey: todoKeys.all,
    queryFn: async () => {
      const res = await fetch('/api/todos')
      return res.json()
    },
    getId: (todo) => todo.id,
  })
)
```

### Live Queries

```typescript
// In a component — reactive, sub-millisecond
import { useLiveQuery } from '@tanstack/react-db'
import { todoCollection } from '../collections/todo.collection'

function ActiveTodoCount() {
  const activeTodos = useLiveQuery((q) =>
    q.from({ todo: todoCollection })
     .where(({ todo }) => !todo.isComplete)
     .select(({ todo }) => todo)
  )

  return <span>{activeTodos.length} remaining</span>
}
```

---

## Layer 7: TanStack Form (with Zod validation)

```typescript
// src/client/views/todo-form.view.tsx
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { createTodoSchema } from '../../shared/schemas/todo.schema'
import { useCreateTodo } from '../effects/todo.effects'

// Pure view function — takes dispatch, returns JSX
export function TodoFormView() {
  const createTodo = useCreateTodo()

  const form = useForm({
    defaultValues: { title: '', description: '' },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: createTodoSchema,
    },
    onSubmit: async ({ value }) => {
      await createTodo.mutateAsync(value)
      form.reset()
    },
  })

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <form.Field name="title">
          {(field) => (
            <div>
              <input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="What needs doing?"
              />
              {field.state.meta.errors.length > 0 && (
                <span>{field.state.meta.errors.join(', ')}</span>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="Details (optional)"
            />
          )}
        </form.Field>

        <button type="submit" disabled={createTodo.isPending}>
          {createTodo.isPending ? 'Adding...' : 'Add Todo'}
        </button>
      </form>
    </div>
  )
}
```

---

## Layer 8: Views (Pure JSX Functions)

Views are pure functions of `(model + server data) → JSX`.
They read from the MVU model for UI state and from Query for server data.

```typescript
// src/client/views/todo-list.view.tsx
import { useTodos, useToggleTodo, useDeleteTodo } from '../effects/todo.effects'
import { useSelector, useTodoDispatch } from '../mvu'
import type { TodoRecord } from '../../shared/schemas/todo.schema'
import type { TodoFilter } from '../models/todo.model'

export function TodoListView() {
  // Server data (via Query)
  const { data: todos = [], isLoading, error } = useTodos()

  // UI state (via MVU model)
  const filter = useSelector((m) => m.todo.filter)
  const dispatch = useTodoDispatch()

  // Derived: filter todos based on MVU model state
  const filtered = filterTodos(todos, filter)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <section>
      <FilterBar current={filter} onFilter={(f) => dispatch({ type: 'SET_FILTER', filter: f })} />
      <ul>
        {filtered.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
      {filtered.length === 0 && <EmptyState filter={filter} />}
    </section>
  )
}

// ── Pure sub-view functions ─────────────────────────────────

function FilterBar({ current, onFilter }: { current: TodoFilter; onFilter: (f: TodoFilter) => void }) {
  const filters: TodoFilter[] = ['all', 'active', 'completed']
  return (
    <nav>
      {filters.map((f) => (
        <button key={f} onClick={() => onFilter(f)} data-active={f === current}>
          {f}
        </button>
      ))}
    </nav>
  )
}

function TodoItem({ todo }: { todo: TodoRecord }) {
  const toggle = useToggleTodo()
  const remove = useDeleteTodo()

  return (
    <li>
      <input
        type="checkbox"
        checked={todo.isComplete}
        onChange={() => toggle.mutate({ id: todo.id, isComplete: !todo.isComplete })}
      />
      <span data-complete={todo.isComplete}>{todo.title}</span>
      <button onClick={() => remove.mutate(todo.id)} disabled={remove.isPending}>
        ✕
      </button>
    </li>
  )
}

function EmptyState({ filter }: { filter: TodoFilter }) {
  const messages: Record<TodoFilter, string> = {
    all: 'No todos yet. Add one above.',
    active: 'All caught up!',
    completed: 'Nothing completed yet.',
  }
  return <p>{messages[filter]}</p>
}

// ── Pure helper (no side effects) ───────────────────────────
function filterTodos(todos: TodoRecord[], filter: TodoFilter): TodoRecord[] {
  switch (filter) {
    case 'all':       return todos
    case 'active':    return todos.filter((t) => !t.isComplete)
    case 'completed': return todos.filter((t) => t.isComplete)
  }
}
```

---

## Layer 9: App Bootstrap

```typescript
// src/client/app.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MVUProvider } from './mvu'
import { TodoListView } from './views/todo-list.view.tsx'
import { TodoFormView } from './views/todo-form.view.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,          // 30s fresh
      gcTime: 1000 * 60 * 5,         // 5min garbage collection
      refetchOnWindowFocus: true,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MVUProvider>
        <main>
          <h1>Todos</h1>
          <TodoFormView />
          <TodoListView />
        </main>
      </MVUProvider>
    </QueryClientProvider>
  )
}
```

### Client Entry

```typescript
// src/client/entry.tsx
import { createRoot } from 'react-dom/client'
import { App } from './app'

createRoot(document.getElementById('root')!).render(<App />)
```

---

## Cloudflare Workers Configuration

```toml
# wrangler.toml
name = "fullstack-mvu-app"
main = "src/server/entry.ts"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = "./dist/client"

[vars]
# Non-secret env vars

# Secrets (set via `wrangler secret put DATABASE_URL`)
# DATABASE_URL = "..."
# JWT_SECRET = "..."
```

---

## The Type Flow

Types flow from the database schema to the UI with zero duplication:

```
Drizzle Schema (schema.ts)
    │
    ├──► Drizzle types:  Todo, NewTodo
    │
    ├──► drizzle-zod:    createSelectSchema, createInsertSchema
    │         │
    │         ▼
    │    Zod schemas (todo.schema.ts)  ◄── SINGLE SOURCE OF TRUTH
    │         │
    │         ├──► Server: Hono zValidator()
    │         │
    │         ├──► Client: TanStack Form zodValidator()
    │         │
    │         └──► TypeScript types: z.infer<typeof schema>
    │                   │
    │                   ├──► Query hooks (effects layer)
    │                   ├──► MVU model types
    │                   ├──► View component props
    │                   └──► TanStack DB collection types
    │
    └──► Hono typed routes
              │
              └──► hc<AppType>() client  ◄── END-TO-END TYPE SAFETY
                        │
                        └──► Query hooks call typed API methods
```

No codegen. No OpenAPI parsing. No manual type definitions.
Change a column in the Drizzle schema and TypeScript errors
propagate to every component that touches that data.

---

## The Mental Model

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  MVU handles UI state:                              │
│    • Which filter is active                         │
│    • Which item is being edited                     │
│    • Optimistic toggle tracking                     │
│    • Modal open/close                               │
│    • Form focus state                               │
│                                                     │
│  Query handles server state:                        │
│    • Todo list data                                 │
│    • Loading/error states                           │
│    • Cache freshness                                │
│    • Background refetching                          │
│    • Optimistic cache updates                       │
│                                                     │
│  DB handles reactive client data:                   │
│    • Cross-collection joins                         │
│    • Live queries (differential dataflow)           │
│    • Optimistic mutations with rollback             │
│                                                     │
│  Form handles form state:                           │
│    • Field values                                   │
│    • Validation (via shared Zod schemas)            │
│    • Submission lifecycle                           │
│                                                     │
│  Hono handles the server:                           │
│    • Middleware pipeline                             │
│    • Route handling                                 │
│    • Request validation (via shared Zod schemas)    │
│    • Response serialization                         │
│                                                     │
│  Drizzle handles the database:                      │
│    • Schema as code                                 │
│    • Type-safe queries                              │
│    • Migrations                                     │
│                                                     │
│  Zod is the glue:                                   │
│    • One schema, used everywhere                    │
│    • Client validation = server validation          │
│    • Types inferred, never manually written         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Key Dependencies

```json
{
  "dependencies": {
    "hono": "^4.12.0",
    "@hono/zod-validator": "^0.5.0",
    "@neondatabase/serverless": "^0.10.0",
    "drizzle-orm": "^0.38.0",
    "drizzle-zod": "^0.6.0",
    "zod": "^3.24.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-form": "^1.0.0",
    "@tanstack/react-db": "^0.6.0",
    "@tanstack/db": "^0.6.0",
    "@tanstack/query-db-collection": "^0.6.0",
    "@tanstack/zod-form-adapter": "^1.0.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.30.0",
    "wrangler": "^4.0.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.7.0"
  }
}
```
