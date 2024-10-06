import { sql } from "drizzle-orm";
import {
  text,
  pgTable,
  timestamp,
  boolean,
  uuid,
  integer,
} from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});

export const emailVerificationTable = pgTable("email_verification", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  email: text("email")
    .notNull()
    .references(() => userTable.email),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .$defaultFn(() => new Date(Date.now() + 1000 * 60 * 15)), // valid for 15 minutes
});

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const rateLimitTable = pgTable("rate_limit", {
  identifier: text("identifier").primaryKey(), // Unique identifier for each rate limit key
  window: integer("window").notNull(), // Window duration in seconds
  lastReset: timestamp("last_reset", {
    withTimezone: true,
    mode: "date",
  }).notNull(), // Most recent window reset time
  max: integer("max").notNull(), // Maximum number of requests allowed in the window
  count: integer("count").notNull(), // Number of requests made in the window
});
