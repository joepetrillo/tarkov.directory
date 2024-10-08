import { sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", (t) => ({
  id: t.text().primaryKey(),
  email: t.text().notNull().unique(),
  emailVerified: t.boolean().notNull().default(false),
  username: t.text().notNull().unique(),
  passwordHash: t.text().notNull(),
}));

export const emailVerificationTable = pgTable("email_verification", (t) => ({
  id: t
    .uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  email: t
    .text()
    .notNull()
    .references(() => userTable.email),
  userId: t
    .text()
    .notNull()
    .references(() => userTable.id),
  code: t.text().notNull(),
  expiresAt: t
    .timestamp({
      withTimezone: true,
      mode: "date",
    })
    .notNull()
    .$defaultFn(() => new Date(Date.now() + 1000 * 60 * 15)), // valid for 15 minutes
}));

export const sessionTable = pgTable("session", (t) => ({
  id: t.text().primaryKey(),
  userId: t
    .text()
    .notNull()
    .references(() => userTable.id),
  expiresAt: t
    .timestamp({
      withTimezone: true,
      mode: "date",
    })
    .notNull(),
}));

export const rateLimitTable = pgTable("rate_limit", (t) => ({
  identifier: t.text().primaryKey(), // Unique identifier for each rate limit key
  window: t.integer().notNull(), // Window duration in seconds
  lastReset: t
    .timestamp({
      withTimezone: true,
      mode: "date",
    })
    .notNull(), // Most recent window reset time
  max: t.integer().notNull(), // Maximum number of requests allowed in the window
  count: t.integer().notNull(), // Number of requests made in the window
}));
