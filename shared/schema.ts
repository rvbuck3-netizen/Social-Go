
import { pgTable, text, serial, timestamp, boolean, doublePrecision, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  isGoMode: boolean("is_go_mode").default(false).notNull(),
  goModeExpiresAt: timestamp("go_mode_expires_at"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  lastSeen: timestamp("last_seen").defaultNow(),
  bio: text("bio"),
  avatar: text("avatar"),
  instagram: text("instagram"),
  twitter: text("twitter"),
  website: text("website"),
  isBoosted: boolean("is_boosted").default(false).notNull(),
  boostExpiresAt: timestamp("boost_expires_at"),
  coins: integer("coins").default(0).notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  authorName: text("author_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  hideExactLocation: boolean("hide_exact_location").default(false).notNull(),
});

export const blockedUsers = pgTable("blocked_users", {
  id: serial("id").primaryKey(),
  blockerId: integer("blocker_id").notNull(),
  blockedId: integer("blocked_id").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").notNull(),
  reportedUserId: integer("reported_user_id").notNull(),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).omit({ 
  id: true, 
  createdAt: true 
}).extend({
  hideExactLocation: z.boolean().optional().default(false),
  isAnonymous: z.boolean().optional().default(false),
});

export const insertBlockSchema = createInsertSchema(blockedUsers).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  status: true,
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type BlockedUser = typeof blockedUsers.$inferSelect;
export type Report = typeof reports.$inferSelect;
