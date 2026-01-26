import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const botLogs = pgTable("bot_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const discordUsers = pgTable("discord_users", {
  id: text("id").primaryKey(), // Discord User ID
  genies: integer("genies").default(100).notNull(),
  lastClaimedDate: text("last_claimed_date"), // YYYY-MM-DD format
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBotLogSchema = createInsertSchema(botLogs);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type BotLog = typeof botLogs.$inferSelect;
export type DiscordUser = typeof discordUsers.$inferSelect;
export type InsertBotLog = z.infer<typeof insertBotLogSchema>;
