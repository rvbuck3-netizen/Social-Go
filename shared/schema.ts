
import { pgTable, text, serial, timestamp, boolean, doublePrecision, integer, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
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
  tiktok: text("tiktok"),
  snapchat: text("snapchat"),
  linkedin: text("linkedin"),
  facebook: text("facebook"),
  website: text("website"),
  isBoosted: boolean("is_boosted").default(false).notNull(),
  boostExpiresAt: timestamp("boost_expires_at"),
  coins: integer("coins").default(0).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionTier: text("subscription_tier"),
  isFoundingMember: boolean("is_founding_member").default(false).notNull(),
  ageVerified: boolean("age_verified").default(false).notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  authorName: text("author_name").notNull(),
  authorUserId: varchar("author_user_id"),
  createdAt: timestamp("created_at").defaultNow(),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  hideExactLocation: boolean("hide_exact_location").default(false).notNull(),
});

export const blockedUsers = pgTable("blocked_users", {
  id: serial("id").primaryKey(),
  blockerUserId: varchar("blocker_user_id").notNull(),
  blockedUserId: varchar("blocked_user_id").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterUserId: varchar("reporter_user_id").notNull(),
  reportedUserId: varchar("reported_user_id").notNull(),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).omit({ 
  id: true, 
  createdAt: true,
  authorUserId: true,
}).extend({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
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

export type Profile = typeof profiles.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type BlockedUser = typeof blockedUsers.$inferSelect;
export type Report = typeof reports.$inferSelect;
