import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { todoRoutes } from './routes/todos'
import { errorHandler } from './middleware/error-handler'
import { createDb } from '../db/client'

type Bindings = {
  DATABASE_URL: string
  JWT_SECRET: string
}

type Variables = {
  db: ReturnType<typeof createDb>
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Global Middleware
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'PUT', 'DELETE'] }))

// Inject DB instance per request (stateless workers pattern)
app.use('/api/*', async (c, next) => {
  const db = createDb(c.env.DATABASE_URL)
  c.set('db', db)
  await next()
})

// Error Handler
app.onError(errorHandler)

// API Routes — capture the chained result to preserve route types for hc<AppType>
const routes = app
  .route('/api/todos', todoRoutes)
  .get('/api/health', (c) => c.json({ status: 'ok', runtime: 'cloudflare-workers' }))

export type AppType = typeof routes
export { app }
