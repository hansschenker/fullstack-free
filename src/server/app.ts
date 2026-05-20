import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { todoRoutes } from './routes/todos'
import { errorHandler } from './middleware/error-handler'
import { createDb } from '../db/client'
import { createAuth, type Auth } from './auth'

type Bindings = {
  DATABASE_URL: string
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL?: string
}

type Variables = {
  db: ReturnType<typeof createDb>
  auth: Auth
  user: Auth extends { $Infer: { Session: { user: infer U } } } ? U | null : never
  session: Auth extends { $Infer: { Session: { session: infer S } } } ? S | null : never
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Global Middleware
app.use('*', logger())
app.use('*', prettyJSON())
app.use(
  '*',
  cors({
    origin: (origin) => origin || '*',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
)

// Inject DB + Auth instance per request
app.use('*', async (c, next) => {
  const db = createDb(c.env.DATABASE_URL)
  const auth = createAuth(c.env.DATABASE_URL, c.env.BETTER_AUTH_SECRET, c.env.BETTER_AUTH_URL)
  c.set('db', db)
  c.set('auth', auth)
  await next()
})

// Better Auth handler
app.on(['POST', 'GET'], '/api/auth/*', async (c) => {
  const auth = c.get('auth')
  return auth.handler(c.req.raw)
})

// Session middleware for API routes
app.use('/api/todos/*', async (c, next) => {
  const auth = c.get('auth')
  const authSession = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!authSession) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  c.set('user', authSession.user as Variables['user'])
  c.set('session', authSession.session as Variables['session'])
  await next()
})

// Error Handler
app.onError(errorHandler)

// API Routes
const routes = app
  .route('/api/todos', todoRoutes)
  .get('/api/health', (c) => c.json({ status: 'ok', runtime: 'cloudflare-workers' }))
  .get('/api/me', async (c) => {
    const auth = c.get('auth')
    const authSession = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!authSession) return c.json({ user: null, session: null })
    return c.json({ user: authSession.user, session: authSession.session })
  })

export type AppType = typeof routes
export { app }
