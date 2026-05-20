import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createDb } from './client'
import { todos } from './schema'

async function seed() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL is required')
    process.exit(1)
  }

  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) {
    console.error('BETTER_AUTH_SECRET is required')
    process.exit(1)
  }

  const db = createDb(databaseUrl)

  const auth = betterAuth({
    database: drizzleAdapter(db, { provider: 'pg' }),
    secret,
    basePath: '/api/auth',
    emailAndPassword: { enabled: true },
  })

  console.log('Seeding database...')

  // Create demo user via better-auth API (ensures proper password hashing)
  const { user } = await auth.api.signUpEmail({
    body: {
      email: 'demo@example.com',
      password: 'password123',
      name: 'Demo User',
    },
  })

  console.log(`Created user: ${user.email}`)

  await db.insert(todos).values([
    {
      userId: user.id,
      title: 'Learn Hono',
      description: 'Build a REST API with Hono on Cloudflare Workers',
      isComplete: false,
    },
    {
      userId: user.id,
      title: 'Learn Drizzle ORM',
      description: 'Define schemas and run type-safe queries with Drizzle',
      isComplete: false,
    },
    {
      userId: user.id,
      title: 'Learn TanStack Query',
      description: 'Use TanStack Query for server state management',
      isComplete: true,
    },
    {
      userId: user.id,
      title: 'Build the MVU pattern',
      description: 'Implement Model-View-Update architecture with React',
      isComplete: false,
    },
  ])

  console.log('Seeding complete! Demo credentials: demo@example.com / password123')
}

seed().catch(console.error)
