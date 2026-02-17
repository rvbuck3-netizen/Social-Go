
import { pgTable, text, serial, timestamp, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  isGoMode: boolean("is_go_mode").default(false).notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  lastSeen: timestamp("last_seen").defaultNow(),
  bio: text("bio"),
  avatar: text("avatar"),
  instagram: text("instagram"),
  twitter: text("twitter"),
  website: text("website"),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  authorName: text("author_name").notNull(), // Simple auth for now
  createdAt: timestamp("created_at").defaultNow(),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  hideExactLocation: boolean("hide_exact_location").default(false).notNull(),
});

export const insertPostSchema = createInsertSchema(posts).omit({ 
  id: true, 
  createdAt: true 
}).extend({
  hideExactLocation: z.boolean().default(false),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
