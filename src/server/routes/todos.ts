import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { todos } from '../../db/schema'
import {
  createTodoSchema,
  updateTodoSchema,
  todoIdSchema,
} from '../../shared/schemas/todo.schema'
import type { Database } from '../../db/client'

type Env = {
  Bindings: { DATABASE_URL: string }
  Variables: { db: Database }
}

export const todoRoutes = new Hono<Env>()

  // GET /api/todos
  .get('/', async (c) => {
    const db = c.get('db')
    const result = await db.select().from(todos).orderBy(todos.createdAt)
    return c.json(result)
  })

  // GET /api/todos/:id
  .get('/:id', zValidator('param', todoIdSchema), async (c) => {
    const { id } = c.req.valid('param')
    const db = c.get('db')
    const [todo] = await db.select().from(todos).where(eq(todos.id, id))
    if (!todo) return c.json({ error: 'Not found' }, 404)
    return c.json(todo)
  })

  // POST /api/todos
  .post('/', zValidator('json', createTodoSchema), async (c) => {
    const data = c.req.valid('json')
    const db = c.get('db')
    const [todo] = await db.insert(todos).values(data).returning()
    return c.json(todo, 201)
  })

  // PUT /api/todos/:id
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

  // DELETE /api/todos/:id
  .delete('/:id', zValidator('param', todoIdSchema), async (c) => {
    const { id } = c.req.valid('param')
    const db = c.get('db')
    const [todo] = await db.delete(todos).where(eq(todos.id, id)).returning()
    if (!todo) return c.json({ error: 'Not found' }, 404)
    return c.json({ deleted: true })
  })
