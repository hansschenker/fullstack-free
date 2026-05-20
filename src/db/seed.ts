import { createDb } from './client'
import { todos, user, account } from './schema'

async function seed() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL is required')
    process.exit(1)
  }

  const db = createDb(databaseUrl)

  console.log('Seeding database...')

  // Create a demo user (password hash for "password123" — use better-auth to create real users)
  const demoUserId = 'demo-user-seed-001'

  await db.insert(user).values({
    id: demoUserId,
    name: 'Demo User',
    email: 'demo@example.com',
    emailVerified: true,
  }).onConflictDoNothing()

  await db.insert(account).values({
    id: 'demo-account-seed-001',
    userId: demoUserId,
    accountId: demoUserId,
    providerId: 'credential',
  }).onConflictDoNothing()

  await db.insert(todos).values([
    {
      userId: demoUserId,
      title: 'Learn Hono',
      description: 'Build a REST API with Hono on Cloudflare Workers',
      isComplete: false,
    },
    {
      userId: demoUserId,
      title: 'Learn Drizzle ORM',
      description: 'Define schemas and run type-safe queries with Drizzle',
      isComplete: false,
    },
    {
      userId: demoUserId,
      title: 'Learn TanStack Query',
      description: 'Use TanStack Query for server state management',
      isComplete: true,
    },
    {
      userId: demoUserId,
      title: 'Build the MVU pattern',
      description: 'Implement Model-View-Update architecture with React',
      isComplete: false,
    },
  ])

  console.log('Seeding complete!')
}

seed().catch(console.error)
