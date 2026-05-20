import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'

// ── Better-auth core tables ──────────────────────────────────────────

export const user = pgTable('user', {
  id:            text('id').primaryKey(),
  name:          text('name').notNull(),
  email:         text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image:         text('image'),
  createdAt:     timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:     timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const session = pgTable('session', {
  id:        text('id').primaryKey(),
  userId:    text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  token:     text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const account = pgTable('account', {
  id:                    text('id').primaryKey(),
  userId:                text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId:             text('account_id').notNull(),
  providerId:            text('provider_id').notNull(),
  accessToken:           text('access_token'),
  refreshToken:          text('refresh_token'),
  accessTokenExpiresAt:  timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope:                 text('scope'),
  idToken:               text('id_token'),
  password:              text('password'),
  createdAt:             timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:             timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const verification = pgTable('verification', {
  id:         text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value:      text('value').notNull(),
  expiresAt:  timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:  timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ── Application tables ───────────────────────────────────────────────

export const todos = pgTable('todos', {
  id:          uuid('id').defaultRandom().primaryKey(),
  userId:      text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  title:       text('title').notNull(),
  description: text('description'),
  isComplete:  boolean('is_complete').notNull().default(false),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Todo = typeof todos.$inferSelect
export type NewTodo = typeof todos.$inferInsert
