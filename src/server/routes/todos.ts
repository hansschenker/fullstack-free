import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq, and } from 'drizzle-orm'
import { todos } from '../../db/schema'
import {
  createTodoSchema,
  updateTodoSchema,
  todoIdSchema,
} from '../../shared/schemas/todo.schema'
import type { Database } from '../../db/client'
import type { Auth } from '../auth'

type Env = {
  Bindings: { DATABASE_URL: string; BETTER_AUTH_SECRET: string }
  Variables: {
    db: Database
    auth: Auth
    user: { id: string; name: string; email: string } | null
    session: unknown
  }
}

export const todoRoutes = new Hono<Env>()

  // GET /api/todos
  .get('/', async (c) => {
    const db = c.get('db')
    const user = c.get('user')
    const result = await db
      .select()
      .from(todos)
      .where(eq(todos.userId, user!.id))
      .orderBy(todos.createdAt)
    return c.json(result)
  })

  // GET /api/todos/:id
  .get('/:id', zValidator('param', todoIdSchema), async (c) => {
    const { id } = c.req.valid('param')
    const db = c.get('db')
    const user = c.get('user')
    const [todo] = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, user!.id)))
    if (!todo) return c.json({ error: 'Not found' }, 404)
    return c.json(todo)
  })

  // POST /api/todos
  .post('/', zValidator('json', createTodoSchema), async (c) => {
    const data = c.req.valid('json')
    const db = c.get('db')
    const user = c.get('user')
    const [todo] = await db.insert(todos).values({ ...data, userId: user!.id }).returning()
    return c.json(todo, 201)
  })

  // PUT /api/todos/:id
  .put('/:id', zValidator('param', todoIdSchema), zValidator('json', updateTodoSchema), async (c) => {
    const { id } = c.req.valid('param')
    const data = c.req.valid('json')
    const db = c.get('db')
    const user = c.get('user')
    const [todo] = await db
      .update(todos)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(todos.id, id), eq(todos.userId, user!.id)))
      .returning()
    if (!todo) return c.json({ error: 'Not found' }, 404)
    return c.json(todo)
  })

  // DELETE /api/todos/:id
  .delete('/:id', zValidator('param', todoIdSchema), async (c) => {
    const { id } = c.req.valid('param')
    const db = c.get('db')
    const user = c.get('user')
    const [todo] = await db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, user!.id)))
      .returning()
    if (!todo) return c.json({ error: 'Not found' }, 404)
    return c.json({ deleted: true })
  })
