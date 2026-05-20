import type { MiddlewareHandler } from 'hono'

export const authMiddleware: MiddlewareHandler<{
  Bindings: { JWT_SECRET: string }
}> = async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  // JWT verification would go here
  // For now, pass through
  await next()
}
