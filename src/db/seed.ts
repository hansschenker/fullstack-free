import { createDb } from './client'
import { todos } from './schema'

async function seed() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL is required')
    process.exit(1)
  }

  const db = createDb(databaseUrl)

  console.log('Seeding database...')

  await db.insert(todos).values([
    {
      title: 'Learn Hono',
      description: 'Build a REST API with Hono on Cloudflare Workers',
      isComplete: false,
    },
    {
      title: 'Learn Drizzle ORM',
      description: 'Define schemas and run type-safe queries with Drizzle',
      isComplete: false,
    },
    {
      title: 'Learn TanStack Query',
      description: 'Use TanStack Query for server state management',
      isComplete: true,
    },
    {
      title: 'Build the MVU pattern',
      description: 'Implement Model-View-Update architecture with React',
      isComplete: false,
    },
  ])

  console.log('Seeding complete!')
}

seed().catch(console.error)
