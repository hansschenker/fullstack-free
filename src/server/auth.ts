import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createDb } from '../db/client'

export function createAuth(databaseUrl: string, secret: string, baseURL?: string) {
  const db = createDb(databaseUrl)
  return betterAuth({
    database: drizzleAdapter(db, { provider: 'pg' }),
    secret,
    baseURL,
    basePath: '/api/auth',
    emailAndPassword: {
      enabled: true,
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
  })
}

export type Auth = ReturnType<typeof createAuth>
