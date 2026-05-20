import { z } from 'zod'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { todos } from '../../db/schema'

export const todoSelectSchema = createSelectSchema(todos)
export const todoInsertSchema = createInsertSchema(todos, {
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
})

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

export type CreateTodoInput = z.infer<typeof createTodoSchema>
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>
export type TodoRecord = z.infer<typeof todoSelectSchema>
